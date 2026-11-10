import { describe, it, expect } from 'vitest';
import {
    contarActividad, puntosGanados, puntosGastados, hacerResumen, motivoParaNoCanjear, codigoDesde,
    PUNTOS, PREMIOS, TOPE_COMENTARIOS_DIA, type Canje,
} from './puntos';

const canje = (c: Partial<Canje>): Canje => ({
    id: 'x', codigo: 'SM-AAAAAA', premioId: 'd5', puntos: 150, descuento: 5, estado: 'pendiente', creado: 1, ...c,
});

describe('contarActividad', () => {
    it('una toma al día: dos el mismo día cuentan como una', () => {
        const a = contarActividad('yo', { diasDeMisTomas: ['2026-11-01', '2026-11-01', '2026-11-02'], votantesPorToma: [], comentarios: [] });
        expect(a.diasConToma).toBe(2);
    });
    it('el bravo propio no cuenta, y cada persona cuenta una vez por toma', () => {
        const a = contarActividad('yo', { diasDeMisTomas: [], votantesPorToma: [['yo', 'ana', 'luis'], ['ana', 'ana']], comentarios: [] });
        expect(a.bravosRecibidos).toBe(3);
    });
    it('un comentario de dos letras no puntúa', () => {
        const a = contarActividad('yo', { diasDeMisTomas: [], votantesPorToma: [], comentarios: [
            { dia: '2026-11-01', texto: 'ok' },
            { dia: '2026-11-01', texto: 'Me ha gustado cómo aguantas el silencio.' },
        ] });
        expect(a.comentarios).toBe(1);
    });
    it('tope de comentarios que puntúan en un día', () => {
        const muchos = Array.from({ length: 12 }, () => ({ dia: '2026-11-01', texto: 'Un comentario con sustancia' }));
        const a = contarActividad('yo', { diasDeMisTomas: [], votantesPorToma: [], comentarios: muchos });
        expect(a.comentarios).toBe(TOPE_COMENTARIOS_DIA);
    });
});

describe('puntos y saldo', () => {
    it('suma según la tabla', () => {
        expect(puntosGanados({ diasConToma: 2, bravosRecibidos: 3, comentarios: 4 }))
            .toBe(2 * PUNTOS.toma + 3 * PUNTOS.bravo + 4 * PUNTOS.comentario);
    });
    it('un canje anulado devuelve sus puntos', () => {
        expect(puntosGastados([canje({ puntos: 150 }), canje({ puntos: 300, estado: 'anulado' }), canje({ puntos: 150, estado: 'usado' })])).toBe(300);
    });
    it('el resumen dice cuánto falta para el siguiente premio', () => {
        const r = hacerResumen({ diasConToma: 10, bravosRecibidos: 0, comentarios: 0 }, []);
        expect(r.saldo).toBe(100);
        expect(r.siguiente?.id).toBe(PREMIOS[0].id);
        expect(r.faltan).toBe(PREMIOS[0].puntos - 100);
    });
    it('el saldo nunca baja de cero aunque se retiren tomas después de canjear', () => {
        const r = hacerResumen({ diasConToma: 1, bravosRecibidos: 0, comentarios: 0 }, [canje({ puntos: 150, estado: 'usado' })]);
        expect(r.saldo).toBe(0);
    });
});

describe('motivoParaNoCanjear', () => {
    it('con puntos de sobra y nada pendiente, se puede', () => {
        expect(motivoParaNoCanjear('d5', 150, [])).toBeNull();
    });
    it('sin puntos suficientes, no', () => {
        expect(motivoParaNoCanjear('d10', 299, [])).toBe('saldo');
    });
    it('con un descuento pendiente, no se pide otro', () => {
        expect(motivoParaNoCanjear('d5', 999, [{ estado: 'pendiente' }])).toBe('pendiente');
        expect(motivoParaNoCanjear('d5', 999, [{ estado: 'usado' }, { estado: 'anulado' }])).toBeNull();
    });
    it('un premio que no existe, no', () => {
        expect(motivoParaNoCanjear('gratis', 9999, [])).toBe('premio');
    });
});

describe('codigoDesde', () => {
    it('SM- y seis caracteres que no se confunden', () => {
        const c = codigoDesde(new Uint8Array([0, 1, 2, 250, 251, 255]));
        expect(c).toMatch(/^SM-[A-HJ-NP-Z2-9]{6}$/);
    });
});
