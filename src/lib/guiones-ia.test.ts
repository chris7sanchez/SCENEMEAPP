import { describe, it, expect } from 'vitest';
import { limpiarGuionesIA, emparejar, urlBuscarGuion } from './guiones-ia';
import type { GuionCatalogo } from './guiones-catalogo';

const cat = (titulo: string, anio: number | null = null, id = titulo): GuionCatalogo =>
    ({ titulo, anio, autor: '', seccion: '', fuente: 'bloguionistas', tipo: 'pdf', url: 'https://x/y.pdf', idioma: 'es', id } as GuionCatalogo);

describe('limpiarGuionesIA', () => {
    it('recorta, corrige valores raros y descarta lo que no tiene título', () => {
        const r = limpiarGuionesIA({ guiones: [
            { titulo: 'Moulin Rouge', anio: 2001, guionistas: 'Baz Luhrmann, Craig Pearce', tipo: 'pelicula', publicado: 'si', donde: 'Se publicó en libro.', busqueda: 'Moulin Rouge 2001 screenplay pdf' },
            { titulo: '' },
            { titulo: 'Raro', tipo: 'videojuego', publicado: 'quizás' },
        ] });
        expect(r).toHaveLength(2);
        expect(r[0]).toMatchObject({ titulo: 'Moulin Rouge', anio: '2001', publicado: 'si' });
        expect(r[1]).toMatchObject({ tipo: 'pelicula', publicado: 'no_se' });
        expect(r[1].busqueda).toContain('Raro');
        expect(limpiarGuionesIA(null)).toEqual([]);
    });
});

describe('emparejar con la hemeroteca', () => {
    const catalogo = [cat('CAMPEONES', 2018, 'campeones'), cat('THE ROOM NEXT DOOR', 2025, 'room'), cat('LA', 2000, 'corto')];
    it('encuentra el mismo título aunque cambien mayúsculas o tildes', () => {
        expect(emparejar({ titulo: 'Campeones' }, catalogo)?.id).toBe('campeones');
        expect(emparejar({ titulo: 'The room next door', anio: '2025' }, catalogo)?.id).toBe('room');
    });
    it('no empareja títulos que sólo se parecen', () => {
        expect(emparejar({ titulo: 'Campeones 2', anio: '2023' }, catalogo)).toBeUndefined();
        expect(emparejar({ titulo: 'La la land', anio: '2000' }, catalogo)).toBeUndefined();
    });
    it('el enlace de búsqueda va a Google', () => {
        expect(urlBuscarGuion('Moulin Rouge guion')).toBe('https://www.google.com/search?q=Moulin%20Rouge%20guion');
    });
});
