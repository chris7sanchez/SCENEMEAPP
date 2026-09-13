import { describe, it, expect } from 'vitest';
import { juntarLinea, reconstruirPagina, pareceDeletreado, type TrozoPdf } from './pdf-texto';

/** PDF que entrega UNA LETRA POR TROZO: el caso que rompía el ensayo. */
function letraALetra(texto: string, y: number, x0 = 0, ancho = 0.5): TrozoPdf[] {
    const out: TrozoPdf[] = [];
    let x = x0;
    for (const c of texto) {
        if (c === ' ') { x += ancho; continue; } // el espacio ocupa, pero no es un trozo
        out.push({ x, y, texto: c });
        x += ancho;
    }
    return out;
}

describe('juntarLinea', () => {
    it('una palabra entregada letra a letra NO se deletrea', () => {
        expect(juntarLinea(letraALetra('ANA', 1))).toBe('ANA');
    });

    it('respeta los espacios reales entre palabras', () => {
        expect(juntarLinea(letraALetra('ANA: Hola', 1))).toBe('ANA: Hola');
    });

    it('funciona igual si el PDF entrega palabras enteras', () => {
        const trozos: TrozoPdf[] = [
            { x: 0, y: 1, texto: 'No' },
            { x: 1.5, y: 1, texto: 'quería' },
            { x: 5, y: 1, texto: 'hacerte' },
            { x: 9, y: 1, texto: 'daño.' },
        ];
        expect(juntarLinea(trozos)).toBe('No quería hacerte daño.');
    });

    it('no duplica el espacio si el PDF ya lo trae', () => {
        const trozos: TrozoPdf[] = [
            { x: 0, y: 1, texto: 'Hola ' },
            { x: 3, y: 1, texto: 'mundo' },
        ];
        expect(juntarLinea(trozos)).toBe('Hola mundo');
    });

    it('un solo trozo se devuelve tal cual', () => {
        expect(juntarLinea([{ x: 0, y: 1, texto: 'LUIS' }])).toBe('LUIS');
        expect(juntarLinea([])).toBe('');
    });
});

describe('reconstruirPagina', () => {
    it('separa líneas aunque las «y» difieran por decimales', () => {
        // Letras de la misma línea con y microscópicamente distinta: antes se
        // comparaba con igualdad exacta y cada letra acababa en su propia línea.
        const trozos: TrozoPdf[] = [
            { x: 0, y: 1.0000, texto: 'A' },
            { x: 0.5, y: 1.0001, texto: 'N' },
            { x: 1.0, y: 0.9999, texto: 'A' },
            { x: 0, y: 2.2, texto: 'H' },
            { x: 0.5, y: 2.2, texto: 'o' },
            { x: 1.0, y: 2.2, texto: 'l' },
            { x: 1.5, y: 2.2, texto: 'a' },
        ];
        expect(reconstruirPagina(trozos)).toBe('ANA\nHola');
    });

    it('reconstruye una escena de guion entregada letra a letra', () => {
        const pagina = [
            ...letraALetra('ANA', 1),
            ...letraALetra('¿De verdad pensabas?', 2),
            ...letraALetra('LUIS', 3),
            ...letraALetra('No quería hacerte daño.', 4),
        ];
        expect(reconstruirPagina(pagina)).toBe(
            'ANA\n¿De verdad pensabas?\nLUIS\nNo quería hacerte daño.',
        );
    });

    it('ordena de arriba abajo y de izquierda a derecha aunque lleguen desordenados', () => {
        const trozos: TrozoPdf[] = [
            { x: 5, y: 2, texto: 'mundo' },
            { x: 0, y: 1, texto: 'Hola' },
            { x: 0, y: 2, texto: 'ancho' },
        ];
        expect(reconstruirPagina(trozos)).toBe('Hola\nancho mundo');
    });

    it('una página vacía no revienta', () => {
        expect(reconstruirPagina([])).toBe('');
    });
});

describe('pareceDeletreado', () => {
    it('detecta el texto roto que producía el lector viejo', () => {
        // Tal cual salía: una letra, un espacio, otra letra.
        const roto = [...'ANA ¿De verdad pensabas que no me iba a enterar? LUIS No quería hacerte daño.']
            .filter(c => c !== ' ').join(' ');
        expect(pareceDeletreado(roto)).toBe(true);
    });

    it('no se queja de un guion bien extraído', () => {
        const bueno = `ANA
            ¿De verdad pensabas que no me iba a enterar? Llevo meses viendo
            cómo mirabas el teléfono cada vez que sonaba, y yo callada.
            LUIS
            No quería hacerte daño, te lo juro por lo que quieras.`;
        expect(pareceDeletreado(bueno)).toBe(false);
    });

    it('no juzga un texto demasiado corto', () => {
        expect(pareceDeletreado('A N A')).toBe(false);
    });
});
