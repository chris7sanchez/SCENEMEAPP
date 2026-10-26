// BÚSQUEDA DE GUIONES CON IA (lógica pura, para probarla).
//
// La hemeroteca tiene 243 guiones publicados legalmente. Cuando lo que buscas
// no está, la IA dice si ese guion se ha publicado, quién lo escribió y dónde
// suele estar; la app NO se fía de enlaces inventados: sólo enlaza a la
// hemeroteca (si coincide) o a una búsqueda de Google ya escrita.

import { normalizar, type GuionCatalogo } from './guiones-catalogo';

export type Publicado = 'si' | 'no' | 'no_se';

export interface GuionIA {
    titulo: string;
    anio?: string;
    guionistas?: string;
    tipo: 'pelicula' | 'serie' | 'corto' | 'teatro';
    publicado: Publicado;
    /** Una o dos frases: dónde se publicó o por qué no se encuentra. */
    donde: string;
    /** Texto para buscarlo en Google ("Moulin Rouge 2001 screenplay pdf"). */
    busqueda: string;
    /** La ficha de la hemeroteca si ese guion ya está dentro (para abrirlo en el lector). */
    enHemeroteca?: GuionCatalogo;
}

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const TIPOS = new Set(['pelicula', 'serie', 'corto', 'teatro']);
const PUBLICADO = new Set(['si', 'no', 'no_se']);

export function limpiarGuionesIA(raw: unknown): Omit<GuionIA, 'enHemeroteca'>[] {
    const lista = Array.isArray(raw) ? raw : (raw as any)?.guiones;
    if (!Array.isArray(lista)) return [];
    const out: Omit<GuionIA, 'enHemeroteca'>[] = [];
    for (const r of lista.slice(0, 6)) {
        const titulo = texto(r?.titulo, 120);
        if (!titulo) continue;
        const anio = texto(String(r?.anio ?? ''), 4);
        out.push({
            titulo,
            anio: /^\d{4}$/.test(anio) ? anio : undefined,
            guionistas: texto(r?.guionistas, 160) || undefined,
            tipo: TIPOS.has(r?.tipo) ? r.tipo : 'pelicula',
            publicado: PUBLICADO.has(r?.publicado) ? r.publicado : 'no_se',
            donde: texto(r?.donde, 300),
            busqueda: texto(r?.busqueda, 150) || `${titulo} ${anio} guion pdf`.replace(/\s+/g, ' ').trim(),
        });
    }
    return out;
}

/** ¿Está ya en la hemeroteca? Título igual (sin tildes ni signos) o uno contiene al otro con el mismo año. */
export function emparejar(g: Pick<GuionIA, 'titulo' | 'anio'>, catalogo: GuionCatalogo[]): GuionCatalogo | undefined {
    const t = normalizar(g.titulo);
    if (!t) return undefined;
    return catalogo.find(c => normalizar(c.titulo) === t)
        ?? catalogo.find(c => {
            const ct = normalizar(c.titulo);
            return !!g.anio && String(c.anio ?? '') === g.anio && ct.length > 3 && (ct.includes(t) || t.includes(ct));
        });
}

export function urlBuscarGuion(busqueda: string): string {
    return `https://www.google.com/search?q=${encodeURIComponent(busqueda)}`;
}

/** Lo que viaja de un guion a Fotogramas para pedir referencias de cine de esa escena. */
export interface EscenaParaReferencias {
    titulo: string;
    escena?: string;
    texto?: string;
}

export const CLAVE_ESCENA = 'sceneme:fotogramas:desde-guion';

/**
 * Deja la escena preparada para Fotogramas y devuelve la ruta a la que ir.
 * Va por sessionStorage y no por la URL: una escena entera no cabe bien en un enlace.
 */
export function rutaReferencias(e: EscenaParaReferencias): string {
    try {
        sessionStorage.setItem(CLAVE_ESCENA, JSON.stringify({
            titulo: e.titulo.slice(0, 120), escena: e.escena?.slice(0, 120), texto: e.texto?.slice(0, 4000),
        }));
    } catch { /* sin almacenamiento: Fotogramas buscará sólo por el título */ }
    return `/fotogramas?guion=${encodeURIComponent(e.titulo.slice(0, 120))}`;
}
