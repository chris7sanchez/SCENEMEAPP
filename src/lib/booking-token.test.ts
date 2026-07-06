import { describe, it, expect, beforeAll } from 'vitest';
import { signBookingAction, verifyBookingAction } from './booking-token';

beforeAll(() => { process.env.BOOKING_SECRET = 'secreto-de-test'; });

describe('booking token', () => {
    it('firma y verifica una acción', () => {
        const sig = signBookingAction('evt123', 'accept');
        expect(verifyBookingAction('evt123', 'accept', sig)).toBe(true);
    });

    it('rechaza firma de otra acción u otro evento', () => {
        const sig = signBookingAction('evt123', 'accept');
        expect(verifyBookingAction('evt123', 'reject', sig)).toBe(false);
        expect(verifyBookingAction('evt999', 'accept', sig)).toBe(false);
    });

    it('rechaza firmas malformadas y acciones desconocidas', () => {
        expect(verifyBookingAction('evt123', 'accept', 'zz')).toBe(false);
        expect(verifyBookingAction('evt123', 'delete', signBookingAction('evt123', 'accept'))).toBe(false);
    });
});
