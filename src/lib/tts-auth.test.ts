import { describe, it, expect, vi } from 'vitest';
import { uidDeLaPeticion } from './tts-auth';

const pet = (auth?: string) => new Request('https://x/api/tts', { method: 'POST', headers: auth ? { Authorization: auth } : {} });

describe('uidDeLaPeticion', () => {
    it('sin cabecera → null, sin llamar al verificador', async () => {
        const v = vi.fn();
        expect(await uidDeLaPeticion(pet(), v)).toBeNull();
        expect(v).not.toHaveBeenCalled();
    });

    it('cabecera que no es Bearer → null', async () => {
        expect(await uidDeLaPeticion(pet('Basic abc'), vi.fn())).toBeNull();
    });

    it('sin verificador (Firebase sin configurar) → null', async () => {
        expect(await uidDeLaPeticion(pet('Bearer tok'), null)).toBeNull();
    });

    it('token inválido → null', async () => {
        const v = vi.fn(async () => { throw new Error('expirado'); });
        expect(await uidDeLaPeticion(pet('Bearer tok'), v)).toBeNull();
    });

    it('token válido → uid', async () => {
        const v = vi.fn(async (t: string) => ({ uid: t === 'tok' ? 'u1' : 'otro' }));
        expect(await uidDeLaPeticion(pet('Bearer tok'), v)).toBe('u1');
    });
});
