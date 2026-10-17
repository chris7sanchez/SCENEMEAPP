import { describe, it, expect } from 'vitest';
import { buscarGuiones, driveIdDe, urlVisorDrive, normalizar, partirEnEscenas, type GuionCatalogo } from './guiones-catalogo';
import catalogo from '../data/guiones-catalogo.json';

const g = (titulo: string, autor = '', tipo: GuionCatalogo['tipo'] = 'pdf'): GuionCatalogo =>
    ({ id: titulo, titulo, autor, seccion: '', anio: null, fuente: 't', tipo, url: 'https://x/' + titulo + '.pdf', idioma: 'es' });

describe('normalizar', () => {
    it('quita tildes, mayúsculas y signos', () => {
        expect(normalizar('¡El Verdugo!  (1963)')).toBe('el verdugo 1963');
        expect(normalizar('Campeones')).toBe('campeones');
    });
});

describe('buscarGuiones', () => {
    const lista = [g('La isla mínima', 'Rafael Cobos'), g('Campeones', 'Javier Fesser', 'drive'), g('El verdugo', 'Azcona y Berlanga')];

    it('encuentra sin tildes ni mayúsculas', () => {
        expect(buscarGuiones('isla minima', lista).map(x => x.titulo)).toEqual(['La isla mínima']);
    });
    it('busca también por autor', () => {
        expect(buscarGuiones('berlanga', lista).map(x => x.titulo)).toEqual(['El verdugo']);
    });
    it('exige todas las palabras', () => {
        expect(buscarGuiones('isla campeones', lista)).toEqual([]);
    });
    it('con consulta vacía no devuelve nada', () => {
        expect(buscarGuiones('   ', lista)).toEqual([]);
    });
    it('a igual acierto, el PDF legible va antes que el visor', () => {
        const l2 = [g('Verano', '', 'drive'), g('Verano', '', 'pdf')];
        expect(buscarGuiones('verano', l2)[0].tipo).toBe('pdf');
    });
});

describe('drive', () => {
    it('saca el id y arma el visor incrustable', () => {
        const u = 'https://drive.google.com/file/d/1wln7eNCIgl06wqvqY2ChxjwoPE8hljK7/view?usp=sharing';
        expect(driveIdDe(u)).toBe('1wln7eNCIgl06wqvqY2ChxjwoPE8hljK7');
        expect(urlVisorDrive(u)).toBe('https://drive.google.com/file/d/1wln7eNCIgl06wqvqY2ChxjwoPE8hljK7/preview');
        expect(urlVisorDrive('https://bloguionistas.com/x.pdf')).toBeNull();
    });
});

describe('partirEnEscenas', () => {
    it('parte por INT./EXT. y guarda lo de antes como Inicio', () => {
        const texto = 'EL MINISTERIO DEL TIEMPO\nCapítulo 1\n\n1\nEXT/ AMANECER\nCAMPOS\n\n2. INT. SALA - DÍA\nALONSO\nPorque vos lo ordenasteis.\n';
        const e = partirEnEscenas(texto);
        expect(e.map(x => x.titulo)).toEqual(['Inicio', 'EXT/ AMANECER', '2. INT. SALA - DÍA']);
        expect(e[2].texto).toContain('ALONSO');
    });
    it('reconoce los encabezados de las series españolas: "1 EXT/ AMANECER", "2 INT/DÍA. SALA"', () => {
        const e = partirEnEscenas('1 EXT/ AMANECER  CAMPOS DE FLANDES  [1569]\nRótulo\n2 INT/DÍA. SALA OFICIALES  [1569]\nALONSO\n3 INT/NOCHE  CALABOZO\nx');
        expect(e.map(x => x.titulo)).toEqual(['1 EXT/ AMANECER  CAMPOS DE FLANDES  [1569]', '2 INT/DÍA. SALA OFICIALES  [1569]', '3 INT/NOCHE  CALABOZO']);
    });
    it('reconoce el orden de Almodóvar: "2. BOOKSTORE. INT. DAY."', () => {
        const e = partirEnEscenas('2. BOOKSTORE. INT. DAY.\nx\n4 . FAÇADE OF A HOSPITAL/HOSPITAL LOBBY INT./EXT. DAY.\ny\n5. Martha walks into the room.\nz');
        expect(e.map(x => x.titulo)).toEqual(['2. BOOKSTORE. INT. DAY.', '4 . FAÇADE OF A HOSPITAL/HOSPITAL LOBBY INT./EXT. DAY.']);
        expect(e[1].texto).toContain('Martha walks');
    });
    it('no toma por escena una frase que empieza por "Interesante"', () => {
        expect(partirEnEscenas('Interesante, dijo.\nExterior nada.')).toHaveLength(1);
    });
    it('reconoce ESCENA n y INT/EXT', () => {
        const e = partirEnEscenas('ESCENA 1\nhola\nINT/EXT. COCHE\nadiós');
        expect(e.map(x => x.titulo)).toEqual(['ESCENA 1', 'INT/EXT. COCHE']);
    });
    it('sin encabezados, todo es una escena', () => {
        expect(partirEnEscenas('ANA: hola\nLUIS: adiós')).toHaveLength(1);
    });
});

describe('el catálogo generado', () => {
    const lista = catalogo as GuionCatalogo[];
    it('tiene entradas con id único, título, url y tipo válido', () => {
        expect(lista.length).toBeGreaterThan(200);
        const ids = new Set(lista.map(x => x.id));
        expect(ids.size).toBe(lista.length);
        for (const x of lista) {
            expect(x.titulo.length).toBeGreaterThan(0);
            expect(x.url.startsWith('http')).toBe(true);
            expect(['pdf', 'drive', 'web']).toContain(x.tipo);
            if (x.tipo === 'drive') expect(driveIdDe(x.url)).not.toBeNull();
        }
    });
    it('encuentra guiones conocidos', () => {
        expect(buscarGuiones('ministerio del tiempo', lista).length).toBeGreaterThan(3);
        expect(buscarGuiones('la casa', lista).some(x => x.tipo === 'drive')).toBe(true);
    });
});
