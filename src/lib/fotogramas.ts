// FOTOGRAMAS — referencias de cine para el actor (la idea de ShotDeck, sin su catálogo).
//
// Por qué funciona así (26/10/2026):
//  - Los fotogramas de cine actual son de los estudios. TMDB cobra 149 USD/mes
//    por usarlos en una app de pago, y la búsqueda de imágenes de Google ya no
//    admite clientes nuevos. Así que la app NO trae imágenes de nadie.
//  - La IA propone películas y escenas; el clip se ve incrustado desde YouTube
//    (permitido) y hay un enlace a Google Imágenes con la búsqueda ya escrita.
//  - Las capturas las pega o sube el propio actor a su deck PRIVADO. La app es
//    sólo el sitio donde las guarda (como Pinterest o Milanote) y retira lo que
//    un titular denuncie (/api/fotogramas/denuncia).
//  - La IA etiqueta lo que el actor sube: plano, ángulo, luz, color, emoción.
//
// Este fichero es lógica pura (sin red ni Firebase) para poder probarla.

export type Plan = 'gratis' | 'pro';

/**
 * Periodo de prueba (26/10/2026): todo gratis para cualquiera con sesión,
 * para valorar cuánto interesa antes de decidir si se cobra. El cobro con
 * Stripe sigue en el código, apagado. Para volver a los dos planos: false.
 */
export const TODO_GRATIS = true;

/** Lo que incluye cada plan. Pro no tiene tope (Infinity). */
export const LIMITES = {
    gratis: { decks: 1, planosPorDeck: 12, etiquetadoIA: false, compartir: false },
    pro: { decks: Infinity, planosPorDeck: Infinity, etiquetadoIA: true, compartir: true },
} as const;

/** Una película y escena que propone la IA para lo que pide el actor. */
export interface Idea {
    titulo: string;
    anio?: string;
    director?: string;
    escena: string;
    porQue: string;
    /** Texto para buscar el clip o la imagen ("Heat 1995 escena cafetería De Niro Pacino"). */
    busqueda: string;
}

export interface Etiquetas {
    plano?: string;        // primer plano, plano medio, general...
    angulo?: string;       // picado, contrapicado, cenital...
    luz?: string;          // dura lateral, suave, contraluz...
    color?: string;        // paleta dominante
    emocion?: string;      // lo que transmite el personaje
    composicion?: string;  // regla de tercios, simetría...
    palabras?: string[];   // para buscar
}

export interface Plano {
    id: string;
    /** URL de descarga de Firebase Storage. */
    imagen: string;
    /** Ruta en Storage (users/{uid}/fotogramas/{id}.jpg), para poder borrarla. */
    ruta: string;
    pelicula?: string;
    anio?: string;
    nota?: string;
    /** De dónde sacó la captura el actor (por si hay que retirarla). */
    fuente?: string;
    etiquetas?: Etiquetas;
    creado: number;
}

export interface Deck {
    id: string;
    nombre: string;
    planos: Plano[];
    creado: number;
    /** Id público si el deck está compartido (sólo Pro). */
    compartido?: string;
}

export type MotivoBloqueo = 'limite_planos' | 'duplicado';

export function motivoParaNoAnadir(plan: Plan, deck: Deck, plano: Pick<Plano, 'id'>): MotivoBloqueo | null {
    if (deck.planos.some(p => p.id === plano.id)) return 'duplicado';
    if (deck.planos.length >= LIMITES[plan].planosPorDeck) return 'limite_planos';
    return null;
}

export function puedeCrearDeck(plan: Plan, decksActuales: number): boolean {
    return decksActuales < LIMITES[plan].decks;
}

export function urlGoogleImagenes(busqueda: string): string {
    return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(busqueda)}`;
}

export function urlBusquedaYoutube(busqueda: string): string {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(busqueda)}`;
}

/** Embed sin cookies de seguimiento hasta que el usuario le da al play. */
export function urlEmbedYoutube(id: string): string | undefined {
    return /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;
}

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Lo que devuelve el modelo no se fía: se recorta y se descarta lo incompleto. */
export function limpiarIdeas(raw: unknown): Idea[] {
    const lista = Array.isArray(raw) ? raw : (raw as any)?.ideas;
    if (!Array.isArray(lista)) return [];
    const out: Idea[] = [];
    for (const r of lista.slice(0, 8)) {
        const titulo = texto(r?.titulo, 120);
        const escena = texto(r?.escena, 400);
        if (!titulo || !escena) continue;
        const anio = texto(String(r?.anio ?? ''), 4);
        out.push({
            titulo,
            anio: /^\d{4}$/.test(anio) ? anio : undefined,
            director: texto(r?.director, 80) || undefined,
            escena,
            porQue: texto(r?.porQue, 400),
            busqueda: texto(r?.busqueda, 150) || `${titulo} ${anio} escena`.trim(),
        });
    }
    return out;
}

export function limpiarEtiquetas(raw: unknown): Etiquetas {
    const r = (raw ?? {}) as Record<string, unknown>;
    const e: Etiquetas = {};
    for (const k of ['plano', 'angulo', 'luz', 'color', 'emocion', 'composicion'] as const) {
        const v = texto(r[k], 80);
        if (v) e[k] = v;
    }
    if (Array.isArray(r.palabras)) {
        e.palabras = r.palabras.map(p => texto(p, 40).toLowerCase()).filter(Boolean).slice(0, 12);
    }
    return e;
}

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Filtro del deck: todas las palabras escritas tienen que aparecer en película, nota o etiquetas. */
export function coincide(p: Plano, consulta: string): boolean {
    const palabras = sinTildes(consulta).split(/\s+/).filter(Boolean);
    if (palabras.length === 0) return true;
    const e = p.etiquetas ?? {};
    const pajar = sinTildes([
        p.pelicula, p.anio, p.nota, e.plano, e.angulo, e.luz, e.color, e.emocion, e.composicion, ...(e.palabras ?? []),
    ].filter(Boolean).join(' '));
    return palabras.every(w => pajar.includes(w));
}

/** Sólo se aceptan imágenes guardadas en el Storage del proyecto. */
export function esImagenPropia(url: unknown): url is string {
    return typeof url === 'string' && url.length < 1000
        && /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[\w.-]+\/o\/users%2F[\w-]+%2Ffotogramas%2F[\w.-]+\?/.test(url);
}

/** Planos que llegan del navegador para un deck compartido: se valida cada campo. */
export function limpiarPlanosPublicos(raw: unknown): Omit<Plano, 'ruta' | 'fuente'>[] {
    if (!Array.isArray(raw)) return [];
    const out: Omit<Plano, 'ruta' | 'fuente'>[] = [];
    for (const p of raw.slice(0, 500)) {
        if (!esImagenPropia(p?.imagen) || typeof p?.id !== 'string' || !/^[\w-]{1,40}$/.test(p.id)) continue;
        out.push({
            id: p.id,
            imagen: p.imagen,
            pelicula: texto(p.pelicula, 120) || undefined,
            anio: /^\d{4}$/.test(String(p.anio ?? '')) ? String(p.anio) : undefined,
            nota: texto(p.nota, 500) || undefined,
            etiquetas: p.etiquetas ? limpiarEtiquetas(p.etiquetas) : undefined,
            creado: Number(p.creado) || 0,
        });
    }
    return out;
}
