// Cálculo de huecos libres para reservas (zona horaria Europe/Madrid).
export type BusyInterval = { start?: string | null; end?: string | null };

export function getMadridOffset(dateStr: string): string {
    const probe = new Date(`${dateStr}T12:00:00Z`);
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Madrid',
        timeZoneName: 'longOffset',
    }).formatToParts(probe);
    const tz = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+01:00';
    const m = tz.match(/GMT([+-]\d{2}:\d{2})/);
    return m ? m[1] : '+01:00';
}

// Convierte fecha (YYYY-MM-DD) y hora (HH:MM) de Madrid a un Date absoluto.
export function slotToDate(dateStr: string, timeStr: string): Date {
    return new Date(`${dateStr}T${timeStr}:00${getMadridOffset(dateStr)}`);
}

export interface FreeSlotsOptions {
    dateStr: string;          // YYYY-MM-DD
    durationMin: number;      // 60 | 120
    busy: BusyInterval[];
    workStartHour?: number;   // por defecto 10:00
    workEndHour?: number;     // por defecto 20:00
    stepMin?: number;         // por defecto 30
    now?: Date;
}

export function computeFreeSlots(opts: FreeSlotsOptions): string[] {
    const { dateStr, durationMin, busy, workStartHour = 10, workEndHour = 20, stepMin = 30 } = opts;
    const now = opts.now ?? new Date();

    const intervals = busy
        .filter(b => b.start && b.end)
        .map(b => {
            // Eventos de día completo llegan como YYYY-MM-DD: ocupan el día entero en Madrid.
            const s = /^\d{4}-\d{2}-\d{2}$/.test(b.start!) ? slotToDate(b.start!, '00:00') : new Date(b.start!);
            const e = /^\d{4}-\d{2}-\d{2}$/.test(b.end!) ? slotToDate(b.end!, '00:00') : new Date(b.end!);
            return { s: s.getTime(), e: e.getTime() };
        });

    const out: string[] = [];
    for (let m = workStartHour * 60; m + durationMin <= workEndHour * 60; m += stepMin) {
        const hh = String(Math.floor(m / 60)).padStart(2, '0');
        const mm = String(m % 60).padStart(2, '0');
        const start = slotToDate(dateStr, `${hh}:${mm}`);
        const end = new Date(start.getTime() + durationMin * 60_000);
        if (start.getTime() <= now.getTime()) continue;
        const overlaps = intervals.some(iv => start.getTime() < iv.e && end.getTime() > iv.s);
        if (!overlaps) out.push(`${hh}:${mm}`);
    }
    return out;
}
