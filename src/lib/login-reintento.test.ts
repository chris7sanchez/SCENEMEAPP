import { describe, expect, it, vi } from 'vitest';
import { conReintentoDeRed } from './login-reintento';

/**
 * «auth/network-request-failed» al entrar, con la red funcionando y el servidor
 * contestando. Pasa: una petición que se cae sola, un service worker que se
 * despierta tarde, la radio del móvil cambiando de antena. El usuario no tiene
 * que enterarse de nada de eso: se vuelve a intentar y entra.
 *
 * Lo que NO se reintenta es una contraseña mal puesta. Reintentar eso acerca la
 * cuenta al bloqueo por intentos de Google, que es peor que el fallo original.
 */
const esFalloDeRed = (e: unknown) => String((e as { code?: string })?.code || '').includes('network-request-failed');
const sinEsperar = () => Promise.resolve();

describe('conReintentoDeRed', () => {
    it('si entra a la primera, no reintenta nada', async () => {
        const intentar = vi.fn().mockResolvedValue('dentro');
        const r = await conReintentoDeRed(intentar, esFalloDeRed, sinEsperar);
        expect(r).toBe('dentro');
        expect(intentar).toHaveBeenCalledTimes(1);
    });

    it('un fallo de red se reintenta y el segundo intento entra', async () => {
        const intentar = vi.fn()
            .mockRejectedValueOnce({ code: 'auth/network-request-failed' })
            .mockResolvedValue('dentro');
        const r = await conReintentoDeRed(intentar, esFalloDeRed, sinEsperar);
        expect(r).toBe('dentro');
        expect(intentar).toHaveBeenCalledTimes(2);
    });

    it('una contraseña mal puesta NO se reintenta: acercaría la cuenta al bloqueo', async () => {
        const intentar = vi.fn().mockRejectedValue({ code: 'auth/invalid-credential' });
        await expect(conReintentoDeRed(intentar, esFalloDeRed, sinEsperar)).rejects.toMatchObject({ code: 'auth/invalid-credential' });
        expect(intentar).toHaveBeenCalledTimes(1);
    });

    it('si la red falla en todos los intentos, se devuelve el último error', async () => {
        const intentar = vi.fn().mockRejectedValue({ code: 'auth/network-request-failed' });
        await expect(conReintentoDeRed(intentar, esFalloDeRed, sinEsperar, 3)).rejects.toMatchObject({ code: 'auth/network-request-failed' });
        expect(intentar).toHaveBeenCalledTimes(3);
    });

    it('espera entre intentos en vez de machacar seguido', async () => {
        const esperas: number[] = [];
        const esperar = (ms: number) => { esperas.push(ms); return Promise.resolve(); };
        const intentar = vi.fn().mockRejectedValue({ code: 'auth/network-request-failed' });
        await conReintentoDeRed(intentar, esFalloDeRed, esperar, 3).catch(() => { });
        expect(esperas.length).toBe(2);          // una espera por reintento, no tras el último
        expect(esperas[1]).toBeGreaterThan(esperas[0]);
    });
});
