import crypto from 'crypto';

export type BookingAction = 'accept' | 'reject';

function getSecret(): string {
    return process.env.BOOKING_SECRET || '';
}

export function signBookingAction(eventId: string, action: BookingAction): string {
    const secret = getSecret();
    if (!secret) throw new Error('Falta BOOKING_SECRET en las variables de entorno');
    return crypto.createHmac('sha256', secret).update(`${eventId}:${action}`).digest('hex');
}

export function verifyBookingAction(eventId: string, action: string, sig: string): boolean {
    if (!getSecret()) return false;
    if (action !== 'accept' && action !== 'reject') return false;
    try {
        const expected = Buffer.from(signBookingAction(eventId, action), 'hex');
        const given = Buffer.from(String(sig), 'hex');
        return expected.length === given.length && crypto.timingSafeEqual(expected, given);
    } catch {
        return false;
    }
}
