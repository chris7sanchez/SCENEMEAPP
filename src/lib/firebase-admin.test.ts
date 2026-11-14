import { describe, it, expect, beforeEach } from 'vitest';
import { obtenerAdmin } from './firebase-admin';

describe('obtenerAdmin', () => {
    beforeEach(() => {
        delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
        delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    });

    it('devuelve null si faltan las credenciales (no rompe el build)', () => {
        expect(obtenerAdmin()).toBeNull();
    });
});
