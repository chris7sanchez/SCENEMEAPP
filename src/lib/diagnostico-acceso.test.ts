import { describe, expect, it } from 'vitest';
import { explicarFalloDeAcceso, PUERTA_DEL_LOGIN } from './diagnostico-acceso';

/**
 * El diagnóstico del login llevaba probando la puerta equivocada.
 *
 * El login entra por `accounts:signInWithPassword`. La comprobación llamaba a
 * `accounts:createAuthUri`, que es OTRA puerta: que ésa conteste 200 no dice
 * nada de la otra. Encima Google dejó de devolver `registered` y `allProviders`
 * en createAuthUri (protección contra enumeración de emails), así que las tres
 * ramas que miraban esos campos quedaron muertas y TODO el mundo terminaba en
 * el cajón de sastre diciendo "no es un bloqueador" sin haberlo comprobado.
 *
 * Ahora se llama a la misma puerta del login y se clasifica lo que conteste.
 */
describe('explicarFalloDeAcceso', () => {
    it('la llamada del login NO sale: eso es lo que corta un bloqueador', () => {
        const r = explicarFalloDeAcceso({ salio: false, codigo: 0, motivo: '' }, 'auth/network-request-failed');
        expect(r.culpa).toBe('navegador');
        expect(r.texto).toMatch(/bloqueador|extensión|antivirus/i);
    });

    it('credenciales rechazadas significa que la puerta está ABIERTA', () => {
        const r = explicarFalloDeAcceso({ salio: true, codigo: 400, motivo: 'INVALID_LOGIN_CREDENTIALS' }, 'auth/wrong-password');
        expect(r.culpa).toBe('credenciales');
        expect(r.texto).toMatch(/contraseña|email/i);
    });

    it('EMAIL_NOT_FOUND también prueba que la puerta está abierta', () => {
        const r = explicarFalloDeAcceso({ salio: true, codigo: 400, motivo: 'EMAIL_NOT_FOUND' }, 'auth/user-not-found');
        expect(r.culpa).toBe('credenciales');
    });

    it('la contradicción se dice en voz alta: la puerta abre pero el SDK dice fallo de red', () => {
        const r = explicarFalloDeAcceso({ salio: true, codigo: 400, motivo: 'INVALID_LOGIN_CREDENTIALS' }, 'auth/network-request-failed');
        expect(r.culpa).toBe('contradiccion');
        expect(r.texto).toMatch(/service worker|caché|recarga/i);
    });

    it('Authentication apagado en el proyecto se nombra tal cual', () => {
        const r = explicarFalloDeAcceso({ salio: true, codigo: 400, motivo: 'CONFIGURATION_NOT_FOUND' }, 'auth/configuration-not-found');
        expect(r.culpa).toBe('proyecto');
        expect(r.texto).toMatch(/Authentication/);
    });

    it('OPERATION_NOT_ALLOWED es el acceso por contraseña desactivado', () => {
        const r = explicarFalloDeAcceso({ salio: true, codigo: 400, motivo: 'OPERATION_NOT_ALLOWED' }, '');
        expect(r.culpa).toBe('proyecto');
    });

    it('clave restringida: 403 y mensaje de API key', () => {
        const r = explicarFalloDeAcceso({ salio: true, codigo: 403, motivo: 'API_KEY_HTTP_REFERRER_BLOCKED' }, '');
        expect(r.culpa).toBe('proyecto');
        expect(r.texto).toMatch(/clave/i);
    });

    it('demasiados intentos no se confunde con un fallo de red', () => {
        const r = explicarFalloDeAcceso({ salio: true, codigo: 400, motivo: 'TOO_MANY_ATTEMPTS_TRY_LATER' }, 'auth/too-many-requests');
        expect(r.culpa).toBe('espera');
    });

    it('la prueba usa la MISMA puerta que el login, no otra', () => {
        expect(PUERTA_DEL_LOGIN).toBe('signInWithPassword');
    });

    it('nunca deja al usuario sin frase, pase lo que pase', () => {
        const r = explicarFalloDeAcceso({ salio: true, codigo: 500, motivo: '' }, '');
        expect(r.texto.length).toBeGreaterThan(20);
        expect(r.culpa).toBe('google');
    });
});
