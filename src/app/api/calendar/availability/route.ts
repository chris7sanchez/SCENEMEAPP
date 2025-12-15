import { NextResponse } from 'next/server';
import { getBusyDates } from '@/lib/google-calendar';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

export async function GET(request: Request) {
    try {
        // Por defecto miramos desde hoy hasta 6 meses en el futuro
        const start = startOfMonth(new Date());
        const end = endOfMonth(addMonths(new Date(), 6));

        const busySlots = await getBusyDates(start, end);

        return NextResponse.json({ success: true, busySlots });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch availability' },
            { status: 500 }
        );
    }
}
