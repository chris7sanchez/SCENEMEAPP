import { describe, it, expect } from 'vitest';
import { actoresDelTablon, iniciales, llevaCompanero } from './tablon';
import type { Publicacion } from './comunidad-db';

const toma = (p: Partial<Publicacion>): Publicacion => ({
    id: Math.random().toString(36), uid: 'u1', autor: 'Ana García', fecha: '2026-11-01',
    titulo: 'Escena', downloadURL: 'https://firebasestorage.googleapis.com/x', creado: 1, bravos: 0, ...p,
});

describe('actoresDelTablon', () => {
    it('junta las tomas de un mismo actor y suma sus bravos', () => {
        const r = actoresDelTablon([
            toma({ uid: 'u1', creado: 10, bravos: 2, titulo: 'Vieja' }),
            toma({ uid: 'u1', creado: 30, bravos: 3, titulo: 'Nueva', autor: 'Ana G.' }),
            toma({ uid: 'u2', creado: 20, autor: 'Luis Pérez' }),
        ]);
        expect(r).toHaveLength(2);
        expect(r[0]).toMatchObject({ uid: 'u1', nombre: 'Ana G.', tomas: 2, bravos: 5, ultimoTitulo: 'Nueva' });
        expect(r[1]).toMatchObject({ uid: 'u2', nombre: 'Luis Pérez', tomas: 1 });
    });
    it('ordena por quien compartió hace menos', () => {
        const r = actoresDelTablon([toma({ uid: 'a', creado: 1 }), toma({ uid: 'b', creado: 9 })]);
        expect(r.map(a => a.uid)).toEqual(['b', 'a']);
    });
    it('sin publicaciones, tablón vacío: no se inventa a nadie', () => {
        expect(actoresDelTablon([])).toEqual([]);
    });
});

describe('iniciales', () => {
    it('nombre y apellido', () => expect(iniciales('Ana García López')).toBe('AL'));
    it('un solo nombre', () => expect(iniciales('ana')).toBe('AN'));
    it('vacío', () => expect(iniciales('  ')).toBe('·'));
});

describe('llevaCompanero', () => {
    it('el monólogo no lleva compañero', () => expect(llevaCompanero('solo')).toBe(false));
    it('el resto sí', () => {
        expect(llevaCompanero('m-f')).toBe(true);
        expect(llevaCompanero('ensemble')).toBe(true);
    });
    it('sin dinámica elegida, todavía no', () => expect(llevaCompanero('')).toBe(false));
});
