import { NextResponse } from 'next/server';
import { createPendingBooking, getBusyDates } from '@/lib/google-calendar';
import { slotToDate } from '@/lib/booking-slots';
import { signBookingAction } from '@/lib/booking-token';
import { sendBookingEmail, adminNewBookingEmail, clientReceivedEmail, type BookingSummary } from '@/lib/booking-emails';

const SERVICES: Record<string, string> = {
    book: 'Book Actoral Completo',
    selftape: 'Sesión Self-Tape',
    packtor: 'Packtor Pro (Completo)',
};

function labels(startISO: string, durationMin: number, time: string) {
    const start = new Date(startISO);
    const dateLabel = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(start);
    const endMin = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)) + durationMin;
    const timeLabel = `${time} – ${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
    return { dateLabel, timeLabel };
}

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const body = await req.json();
        const { name, email, phone, service, date, time, duration } = body || {};

        const durationMin = Number(duration);
        if (!name?.trim() || !email?.includes('@') || !phone?.trim()) {
            return NextResponse.json({ success: false, error: 'Faltan datos de contacto' }, { status: 400 });
        }
        if (!SERVICES[service] || ![60, 120].includes(durationMin) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(time || '')) {
            return NextResponse.json({ success: false, error: 'Solicitud no válida' }, { status: 400 });
        }

        const start = slotToDate(date, time);
        const end = new Date(start.getTime() + durationMin * 60_000);
        if (start.getTime() <= Date.now()) {
            return NextResponse.json({ success: false, error: 'Esa hora ya ha pasado' }, { status: 400 });
        }

        // Revalidar contra el calendario: la franja puede haberse ocupado.
        const busy = await getBusyDates(start, end);
        const taken = busy.some(b => b.start && b.end &&
            start.getTime() < new Date(b.end).getTime() && end.getTime() > new Date(b.start).getTime());
        if (taken) {
            return NextResponse.json({ success: false, error: 'Esa franja acaba de ocuparse. Elige otra.' }, { status: 409 });
        }

        const event = await createPendingBooking({
            name: name.trim(), email: email.trim(), phone: phone.trim(),
            service: SERVICES[service],
            startISO: start.toISOString(), endISO: end.toISOString(),
        });
        if (!event.id) throw new Error('El calendario no devolvió id de evento');

        const summary: BookingSummary = {
            name: name.trim(), email: email.trim(), phone: phone.trim(),
            service: SERVICES[service], ...labels(start.toISOString(), durationMin, time),
        };

        const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
        const confirmUrl = (action: 'accept' | 'reject') =>
            `${origin}/api/bookings/confirm?id=${encodeURIComponent(event.id!)}&action=${action}&sig=${signBookingAction(event.id!, action)}`;

        const adminTo = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        if (adminTo) {
            const mail = adminNewBookingEmail(summary, confirmUrl('accept'), confirmUrl('reject'));
            await sendBookingEmail(adminTo, mail.subject, mail.html);
        } else {
            console.warn('⚠️ NEXT_PUBLIC_ADMIN_EMAIL no configurado: no se envía aviso de pedido');
        }

        // Acuse al cliente (no bloqueante: Resend en modo prueba solo entrega al email verificado)
        const ack = clientReceivedEmail(summary);
        await sendBookingEmail(summary.email, ack.subject, ack.html);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creando reserva:', error);
        return NextResponse.json({ success: false, error: 'No se pudo registrar la reserva' }, { status: 500 });
    }
}
