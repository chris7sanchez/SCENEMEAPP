// FOTOGRAMAS — la biblioteca de planos de cine de SCENE ME (referencia: ShotDeck).
//
// Lo que NO se copia de ShotDeck: sus imágenes y su etiquetado a mano (objetivo,
// luz, color, emoción...) son suyos y de sus estudios. Aquí los planos salen de
// TMDB (fondos oficiales de cada película, uso permitido con atribución) y los
// filtros son los que TMDB sí tiene: género, época, idioma, director/actor y
// palabras clave. Es la misma idea, con otro catálogo y menos etiquetas.
//
// Este fichero es lógica pura (sin red ni Firebase) para poder probarla.

export type Plan = 'gratis' | 'pro';

export interface Filtros {
    q?: string;
    genero?: number;
    desde?: number;      // año
    hasta?: number;      // año
    idioma?: string;     // 'es', 'en', 'fr'...
    persona?: number;    // id TMDB de director o actor
    palabra?: number;    // id TMDB de palabra clave ("neo-noir")
    orden?: 'populares' | 'recientes' | 'mejor_valoradas';
}

export const GENEROS: Record<number, string> = {
    28: 'Acción', 12: 'Aventura', 16: 'Animación', 35: 'Comedia', 80: 'Crimen',
    99: 'Documental', 18: 'Drama', 10751: 'Familia', 14: 'Fantasía', 36: 'Historia',
    27: 'Terror', 10402: 'Música', 9648: 'Misterio', 10749: 'Romance',
    878: 'Ciencia ficción', 53: 'Suspense', 10752: 'Bélica', 37: 'Western',
};

export const IDIOMAS: Record<string, string> = {
    es: 'Español', en: 'Inglés', fr: 'Francés', it: 'Italiano', de: 'Alemán',
    ja: 'Japonés', ko: 'Coreano', pt: 'Portugués',
};

/** Lo que incluye cada plan. Pro no tiene tope (Infinity). */
export const LIMITES = {
    gratis: { decks: 1, planosPorDeck: 12, filtrosAvanzados: false, compartir: false, descargaOriginal: false },
    pro: { decks: Infinity, planosPorDeck: Infinity, filtrosAvanzados: true, compartir: true, descargaOriginal: true },
} as const;

const ORDEN_TMDB = {
    populares: 'popularity.desc',
    recientes: 'primary_release_date.desc',
    mejor_valoradas: 'vote_average.desc',
} as const;

/** ¿Estos filtros piden algo que sólo da el plan Pro? Gratis: título y un género. */
export function usaFiltrosAvanzados(f: Filtros): boolean {
    return !!(f.desde || f.hasta || f.idioma || f.persona || f.palabra || (f.orden && f.orden !== 'populares'));
}

/** Filtros que llegan en la URL de /api/fotogramas, saneados (nada se fía del navegador). */
export function filtrosDe(sp: URLSearchParams): Filtros {
    const num = (k: string, min: number, max: number) => {
        const v = sp.get(k);
        if (!v || !/^\d{1,9}$/.test(v)) return undefined;
        const n = Number(v);
        return n >= min && n <= max ? n : undefined;
    };
    const idioma = sp.get('idioma') || '';
    const orden = sp.get('orden') as Filtros['orden'];
    const genero = num('genero', 1, 99999);
    return {
        q: (sp.get('q') || '').trim().slice(0, 200) || undefined,
        genero: genero && GENEROS[genero] ? genero : undefined,
        desde: num('desde', 1888, 2100),
        hasta: num('hasta', 1888, 2100),
        idioma: /^[a-z]{2}$/.test(idioma) ? idioma : undefined,
        persona: num('persona', 1, 999999999),
        palabra: num('palabra', 1, 999999999),
        orden: orden && orden in ORDEN_TMDB ? orden : undefined,
    };
}

/**
 * Parámetros para TMDB. Con texto se usa /search/movie (que sólo admite año);
 * sin texto, /discover/movie con todos los filtros.
 */
export function consultaTmdb(f: Filtros, pagina = 1): { ruta: string; params: URLSearchParams } {
    const p = new URLSearchParams({ language: 'es-ES', include_adult: 'false', page: String(Math.min(Math.max(pagina, 1), 20)) });
    if (f.q) {
        p.set('query', f.q);
        return { ruta: '/search/movie', params: p };
    }
    if (f.genero) p.set('with_genres', String(f.genero));
    if (f.desde) p.set('primary_release_date.gte', `${f.desde}-01-01`);
    if (f.hasta) p.set('primary_release_date.lte', `${f.hasta}-12-31`);
    if (f.idioma) p.set('with_original_language', f.idioma);
    if (f.persona) p.set('with_people', String(f.persona));
    if (f.palabra) p.set('with_keywords', String(f.palabra));
    const orden = f.orden ?? 'populares';
    p.set('sort_by', ORDEN_TMDB[orden]);
    // Sin esto, "mejor valoradas" devuelve películas con 1 voto y nota 10.
    if (orden === 'mejor_valoradas') p.set('vote_count.gte', '300');
    if (orden === 'recientes') p.set('vote_count.gte', '20');
    return { ruta: '/discover/movie', params: p };
}

export type Tamano = 'w780' | 'w1280' | 'original';

export function urlImagen(ruta: string | null | undefined, tam: Tamano): string | undefined {
    return ruta && /^\/[\w.-]+$/.test(ruta) ? `https://image.tmdb.org/t/p/${tam}${ruta}` : undefined;
}

export interface Plano {
    /** Ruta TMDB del fondo, p. ej. "/abc.jpg". Sirve de id dentro de la película. */
    ruta: string;
    peliculaId: string;
    titulo: string;
    anio?: string;
    ancho?: number;
    alto?: number;
}

export interface Deck {
    id: string;
    nombre: string;
    planos: Plano[];
    creado: number;
    /** Id público si el deck está compartido (sólo Pro). */
    compartido?: string;
}

export type MotivoBloqueo = 'limite_decks' | 'limite_planos' | 'duplicado';

/** ¿Cabe este plano en este deck con este plan? null = sí, cabe. */
export function motivoParaNoAnadir(plan: Plan, deck: Deck, plano: Plano): MotivoBloqueo | null {
    if (deck.planos.some(p => p.ruta === plano.ruta && p.peliculaId === plano.peliculaId)) return 'duplicado';
    if (deck.planos.length >= LIMITES[plan].planosPorDeck) return 'limite_planos';
    return null;
}

export function puedeCrearDeck(plan: Plan, decksActuales: number): boolean {
    return decksActuales < LIMITES[plan].decks;
}
