import { describe, expect, it, vi } from 'vitest';
import { esperarSesion } from './sesion';

/**
 * Abrir /creator con la sesión iniciada tardaba de más: antes de pintar nada se
 * esperaba a Firebase Auth Y ADEMÁS al perfil del usuario en Firestore, una
 * detrás de otra. El perfil no hace falta para dibujar la pantalla.
 *
 * Lo que se prueba aquí es justo eso: la sesión se resuelve con lo que da Auth,
 * sin esperar a nadie más.
 */
describe('esperarSesion', () => {
    it('resuelve en cuanto Auth contesta, sin esperar al perfil', async () => {
        const perfil = vi.fn();               // nadie debería llamarlo
        const suscribir = (avisar: (u: { uid: string; email: string | null } | null) => void) => {
            avisar({ uid: 'u1', email: 'chris@sceneme.com' });
            return () => { };
        };

        const sesion = await esperarSesion(suscribir);

        expect(sesion).toEqual({ uid: 'u1', email: 'chris@sceneme.com' });
        expect(perfil).not.toHaveBeenCalled();
    });

    it('devuelve null cuando no hay nadie identificado', async () => {
        const sesion = await esperarSesion((avisar) => { avisar(null); return () => { }; });
        expect(sesion).toBeNull();
    });

    it('se da de baja del listener tras resolver, para no dejarlo colgado', async () => {
        const baja = vi.fn();
        await esperarSesion((avisar) => { avisar({ uid: 'u1', email: 'a@b.c' }); return baja; });
        expect(baja).toHaveBeenCalledTimes(1);
    });

    it('sin Firebase configurado responde null y no revienta', async () => {
        const sesion = await esperarSesion(null);
        expect(sesion).toBeNull();
    });

    it('el email ausente no deja el campo en undefined', async () => {
        const sesion = await esperarSesion((avisar) => { avisar({ uid: 'u9', email: null }); return () => { }; });
        expect(sesion).toEqual({ uid: 'u9', email: '' });
    });
});
