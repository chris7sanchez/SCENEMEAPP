import { describe, it, expect } from 'vitest';
import { planDe, sigueSiendoPro } from './suscripcion';
import { TODO_GRATIS } from './fotogramas';

describe('plan', () => {
    it('sin sesión siempre es gratis', async () => {
        expect(await planDe(null)).toBe('gratis');
    });
    it('en el periodo de prueba, cualquiera con sesión tiene todo', async () => {
        if (!TODO_GRATIS) return;
        expect(await planDe({ uid: 'cualquiera', email: 'x@y.com' })).toBe('pro');
    });
    it('una suscripción cancelada conserva Pro hasta el fin del periodo pagado', () => {
        const ahora = 1_000_000;
        expect(sigueSiendoPro({ estado: 'active' }, ahora)).toBe(true);
        expect(sigueSiendoPro({ estado: 'canceled', hasta: ahora + 1 }, ahora)).toBe(true);
        expect(sigueSiendoPro({ estado: 'canceled', hasta: ahora - 1 }, ahora)).toBe(false);
        expect(sigueSiendoPro(undefined, ahora)).toBe(false);
    });
});
