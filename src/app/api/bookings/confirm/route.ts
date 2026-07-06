import { verifyBookingAction } from '@/lib/booking-token';
import { confirmBooking, rejectBooking } from '@/lib/google-calendar';
import { sendBookingEmail, clientConfirmedEmail, clientRejectedEmail, type BookingSummary } from '@/lib/booking-emails';

function page(title: string, msg: string, ok: boolean) {
    return new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="font-family:Arial,sans-serif;background:#09090b;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<div style="text-align:center;padding:32px;max-width:420px">
<div style="font-size:56px;margin-bottom:16px">${ok ? '✅' : '✖️'}</div>
<h1 style="margin:0 0 12px;font-size:24px">${title}</h1>
<p style="color:#a1a1aa;line-height:1.5">${msg}</p>
</div></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function summaryFromEvent(event: any): BookingSummary {
    const p = event.extendedProperties?.private || {};
    const start = event.start?.dateTime ? new Date(event.start.dateTime) : null;
    const end = event.end?.dateTime ? new Date(event.end.dateTime) : null;
    const fmtD = start ? new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(start) : '-';
    const fmtT = (d: Date | null) => d ? new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false }).format(d) : '-';
    return {
        name: p.clientName || 'cliente', email: p.clientEmail || '', phone: '-',
        service: p.service || 'Sesión', dateLabel: fmtD, timeLabel: `${fmtT(start)} – ${fmtT(end)}`,
    };
}

export async function GET(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id') || '';
        const action = url.searchParams.get('action') || '';
        const sig = url.searchParams.get('sig') || '';

        if (!id || !verifyBookingAction(id, action, sig)) {
            return page('Enlace no válido', 'Este enlace ha caducado o no es correcto.', false);
        }

        if (action === 'accept') {
            const event = await confirmBooking(id);
            const s = summaryFromEvent(event);
            if (s.email) {
                const mail = clientConfirmedEmail(s);
                await sendBookingEmail(s.email, mail.subject, mail.html);
            }
            return page('Reserva confirmada', `La fecha queda bloqueada en tu calendario y ${s.name} recibirá el email de confirmación.`, true);
        }

        const event = await rejectBooking(id);
        const s = summaryFromEvent(event);
        if (s.email) {
            const mail = clientRejectedEmail(s);
            await sendBookingEmail(s.email, mail.subject, mail.html);
        }
        return page('Reserva rechazada', `El evento provisional se ha eliminado del calendario y ${s.name} recibirá un aviso.`, true);
    } catch (error) {
        console.error('Error en confirmación de reserva:', error);
        return page('Algo ha fallado', 'No se pudo procesar la acción. Puede que la reserva ya se haya gestionado antes.', false);
    }
}
