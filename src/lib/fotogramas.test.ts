import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import {
    filtrosDe, consultaTmdb, usaFiltrosAvanzados, urlImagen, motivoParaNoAnadir, puedeCrearDeck,
    type Deck, type Plano,
} from './fotogramas';
import { firmaStripeValida } from './stripe-firma';

const plano = (ruta: string): Plano => ({ ruta, peliculaId: '1', titulo: 'X' });
const deck = (n: number): Deck => ({ id: 'd', nombre: 'D', creado: 0, planos: Array.from({ length: n }, (_, i) => plano(`/p${i}.jpg`)) });

describe('filtrosDe', () => {
    it('sanea lo que llega del navegador', () => {
        const f = filtrosDe(new URLSearchParams('q=%20heat%20&genero=28&desde=1995&hasta=abc&idioma=EN&orden=hackeado&persona=-3'));
        expect(f).toEqual({ q: 'heat', genero: 28, desde: 1995, hasta: undefined, idioma: undefined, persona: undefined, palabra: undefined, orden: undefined });
    });
    it('descarta géneros que no existen', () => {
        expect(filtrosDe(new URLSearchParams('genero=424242')).genero).toBeUndefined();
    });
});

describe('plan', () => {
    it('gratis: título y un género; el resto es Pro', () => {
        expect(usaFiltrosAvanzados({ q: 'heat', genero: 28 })).toBe(false);
        expect(usaFiltrosAvanzados({ orden: 'populares' })).toBe(false);
        expect(usaFiltrosAvanzados({ desde: 1990 })).toBe(true);
        expect(usaFiltrosAvanzados({ persona: 5 })).toBe(true);
        expect(usaFiltrosAvanzados({ orden: 'recientes' })).toBe(true);
    });
    it('límites de decks y planos', () => {
        expect(puedeCrearDeck('gratis', 0)).toBe(true);
        expect(puedeCrearDeck('gratis', 1)).toBe(false);
        expect(puedeCrearDeck('pro', 500)).toBe(true);
        expect(motivoParaNoAnadir('gratis', deck(12), plano('/nuevo.jpg'))).toBe('limite_planos');
        expect(motivoParaNoAnadir('pro', deck(12), plano('/nuevo.jpg'))).toBeNull();
        expect(motivoParaNoAnadir('pro', deck(3), plano('/p1.jpg'))).toBe('duplicado');
    });
});

describe('consultaTmdb', () => {
    it('con texto usa búsqueda', () => {
        const { ruta, params } = consultaTmdb({ q: 'heat' });
        expect(ruta).toBe('/search/movie');
        expect(params.get('query')).toBe('heat');
    });
    it('sin texto usa discover con todos los filtros', () => {
        const { ruta, params } = consultaTmdb({ genero: 80, desde: 1990, hasta: 1999, idioma: 'en', persona: 7, palabra: 9, orden: 'mejor_valoradas' }, 2);
        expect(ruta).toBe('/discover/movie');
        expect(params.get('with_genres')).toBe('80');
        expect(params.get('primary_release_date.gte')).toBe('1990-01-01');
        expect(params.get('primary_release_date.lte')).toBe('1999-12-31');
        expect(params.get('with_people')).toBe('7');
        expect(params.get('sort_by')).toBe('vote_average.desc');
        expect(params.get('vote_count.gte')).toBe('300');
        expect(params.get('page')).toBe('2');
    });
});

describe('urlImagen', () => {
    it('sólo acepta rutas de TMDB bien formadas', () => {
        expect(urlImagen('/abc.jpg', 'w780')).toBe('https://image.tmdb.org/t/p/w780/abc.jpg');
        expect(urlImagen('/../../x', 'w780')).toBeUndefined();
        expect(urlImagen('https://malo.com/x.jpg', 'w780')).toBeUndefined();
        expect(urlImagen(null, 'w780')).toBeUndefined();
    });
});

describe('firmaStripeValida', () => {
    const secreto = 'whsec_test';
    const cuerpo = '{"type":"checkout.session.completed"}';
    const ahora = 1_800_000_000_000;
    const t = String(ahora / 1000);
    const firma = createHmac('sha256', secreto).update(`${t}.${cuerpo}`).digest('hex');

    it('acepta una firma buena', () => {
        expect(firmaStripeValida(cuerpo, `t=${t},v1=${firma}`, secreto, ahora)).toBe(true);
    });
    it('rechaza cuerpo manipulado, secreto distinto, firma ausente o aviso antiguo', () => {
        expect(firmaStripeValida(cuerpo + ' ', `t=${t},v1=${firma}`, secreto, ahora)).toBe(false);
        expect(firmaStripeValida(cuerpo, `t=${t},v1=${firma}`, 'otro', ahora)).toBe(false);
        expect(firmaStripeValida(cuerpo, null, secreto, ahora)).toBe(false);
        expect(firmaStripeValida(cuerpo, `t=${t},v1=zz`, secreto, ahora)).toBe(false);
        expect(firmaStripeValida(cuerpo, `t=${t},v1=${firma}`, secreto, ahora + 10 * 60_000)).toBe(false);
    });
});
