import { describe, it, expect } from 'vitest';
import { computeFreeSlots, getMadridOffset, slotToDate } from './booking-slots';

const NOW = new Date('2026-07-01T00:00:00Z');

describe('getMadridOffset', () => {
    it('devuelve +02:00 en verano y +01:00 en invierno', () => {
        expect(getMadridOffset('2026-07-10')).toBe('+02:00');
        expect(getMadridOffset('2026-01-10')).toBe('+01:00');
    });
});

describe('slotToDate', () => {
    it('convierte hora de Madrid a instante absoluto', () => {
        expect(slotToDate('2026-07-10', '16:00').toISOString()).toBe('2026-07-10T14:00:00.000Z');
    });
});

describe('computeFreeSlots', () => {
    it('sin eventos: horario completo con paso de 30 min', () => {
        const slots = computeFreeSlots({ dateStr: '2026-07-10', durationMin: 60, busy: [], now: NOW });
        expect(slots[0]).toBe('10:00');
        expect(slots[slots.length - 1]).toBe('19:00');
        expect(slots).toContain('14:30');
    });

    it('excluye franjas que solapan con eventos ocupados', () => {
        const busy = [{ start: '2026-07-10T14:00:00+02:00', end: '2026-07-10T16:00:00+02:00' }];
        const slots = computeFreeSlots({ dateStr: '2026-07-10', durationMin: 60, busy, now: NOW });
        expect(slots).not.toContain('13:30');
        expect(slots).not.toContain('14:00');
        expect(slots).not.toContain('15:30');
        expect(slots).toContain('13:00');
        expect(slots).toContain('16:00');
    });

    it('duración 120: el hueco debe caber entero', () => {
        const busy = [{ start: '2026-07-10T12:00:00+02:00', end: '2026-07-10T13:00:00+02:00' }];
        const slots = computeFreeSlots({ dateStr: '2026-07-10', durationMin: 120, busy, now: NOW });
        expect(slots).not.toContain('11:00');
        expect(slots).not.toContain('11:30');
        expect(slots).toContain('10:00');
        expect(slots).toContain('13:00');
        expect(slots[slots.length - 1]).toBe('18:00');
    });

    it('evento de día completo bloquea todo el día', () => {
        const busy = [{ start: '2026-07-10', end: '2026-07-11' }];
        expect(computeFreeSlots({ dateStr: '2026-07-10', durationMin: 60, busy, now: NOW })).toEqual([]);
    });

    it('no ofrece horas pasadas', () => {
        const now = new Date('2026-07-10T13:05:00+02:00');
        const slots = computeFreeSlots({ dateStr: '2026-07-10', durationMin: 60, busy: [], now });
        expect(slots[0]).toBe('13:30');
    });
});
