import { NextResponse } from 'next/server';
import { getBusyDates } from '@/lib/google-calendar';
import { computeFreeSlots, slotToDate } from '@/lib/booking-slots';

export async function GET(req: Request): Promise<NextResponse> {
    try {
        const url = new URL(req.url);
        const date = url.searchParams.get('date') || '';
        const durationMin = Number(url.searchParams.get('duration') || 60);

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || ![60, 120].includes(durationMin)) {
            return NextResponse.json({ success: false, error: 'Parámetros no válidos' }, { status: 400 });
        }

        const dayStart = slotToDate(date, '00:00');
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
        const busy = await getBusyDates(dayStart, dayEnd);

        const slots = computeFreeSlots({ dateStr: date, durationMin, busy });
        return NextResponse.json({ success: true, slots });
    } catch (error) {
        console.error('Error calculando huecos:', error);
        return NextResponse.json({ success: false, error: 'No se pudo consultar la disponibilidad' }, { status: 500 });
    }
}
