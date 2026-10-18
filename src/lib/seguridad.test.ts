import { describe, it, expect, beforeEach } from 'vitest';
import { escaparHtml, textoLimpio, esEmail, limitar, frenar, _reiniciarLimites } from './seguridad';

describe('escaparHtml', () => {
    it('convierte en texto lo que podría ser una etiqueta', () => {
        expect(escaparHtml('<a href="x">hola</a>')).toBe('&lt;a href=&quot;x&quot;&gt;hola&lt;/a&gt;');
        expect(escaparHtml(`O'Neill & co`)).toBe('O&#39;Neill &amp; co');
    });
    it('no rompe con vacíos', () => {
        expect(escaparHtml(undefined)).toBe('');
        expect(escaparHtml(null)).toBe('');
        expect(escaparHtml(42)).toBe('42');
    });
});

describe('textoLimpio', () => {
    it('recorta espacios y largo', () => {
        expect(textoLimpio('  Ana  ', 100)).toBe('Ana');
        expect(textoLimpio('x'.repeat(500), 10)).toHaveLength(10);
    });
});

describe('esEmail', () => {
    it('acepta emails normales', () => {
        expect(esEmail('ana@gmail.com')).toBe(true);
        expect(esEmail('a.b+c@sub.dominio.es')).toBe(true);
    });
    it('rechaza lo que no es un email', () => {
        expect(esEmail('ana')).toBe(false);
        expect(esEmail('ana@')).toBe(false);
        expect(esEmail('<script>@x.com')).toBe(false);
        expect(esEmail(123)).toBe(false);
        expect(esEmail('a@' + 'b'.repeat(300) + '.com')).toBe(false);
    });
});

describe('limitar', () => {
    beforeEach(() => _reiniciarLimites());

    it('deja pasar hasta el tope y frena después', () => {
        const t = 1_000_000;
        expect(limitar('k', 2, 60_000, t)).toBe(true);
        expect(limitar('k', 2, 60_000, t + 1)).toBe(true);
        expect(limitar('k', 2, 60_000, t + 2)).toBe(false);
    });
    it('vuelve a abrir cuando pasa la ventana', () => {
        const t = 1_000_000;
        limitar('k', 1, 60_000, t);
        expect(limitar('k', 1, 60_000, t + 10)).toBe(false);
        expect(limitar('k', 1, 60_000, t + 60_000)).toBe(true);
    });
    it('cuenta cada clave por separado', () => {
        expect(limitar('a', 1, 60_000, 1)).toBe(true);
        expect(limitar('b', 1, 60_000, 1)).toBe(true);
        expect(limitar('a', 1, 60_000, 2)).toBe(false);
    });
});

describe('frenar', () => {
    beforeEach(() => _reiniciarLimites());

    it('devuelve 429 a la IP que se pasa, y no a otra', () => {
        const de = (ip: string) => new Request('https://x/api', { headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` } });
        expect(frenar(de('1.1.1.1'), 'r', 1)).toBeNull();
        const r = frenar(de('1.1.1.1'), 'r', 1);
        expect(r?.status).toBe(429);
        expect(frenar(de('2.2.2.2'), 'r', 1)).toBeNull();
    });
});
