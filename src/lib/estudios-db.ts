'use client';

// MIS ESTUDIOS: el archivo personal del actor (favoritas, moodboard de
// personajes, escenas guardadas y guiones).
//
// Persistencia en dos niveles, a propósito:
//  - Con sesión: Firestore en users/{uid}/estudios/{coleccion} — las reglas ya
//    permiten leer y escribir sólo al dueño, así que no hace falta tocarlas.
//  - Sin sesión (o si Firebase falla): localStorage, para que la página sea
//    usable igualmente y nada se pierda al recargar.

import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Coleccion = 'favoritas' | 'moodboard' | 'escenas' | 'guiones';

export interface Pelicula {
    id: string;
    titulo: string;
    anio?: string;
    genero?: string;
    sinopsis?: string;
    poster?: string;
    trailer?: string;   // preview / tráiler
    verOnline?: string; // ficha donde verla o alquilarla
    nota?: string;      // por qué te importa a ti
    creado: number;
}

export interface Personaje {
    id: string;
    nombre: string;
    pelicula?: string;
    imagen?: string;
    notas?: string;
    creado: number;
}

export interface Escena {
    id: string;
    titulo: string;
    pelicula?: string;
    enlace?: string;    // YouTube, Apple TV, lo que sea
    notas?: string;
    creado: number;
}

export interface Guion {
    id: string;
    titulo: string;
    autor?: string;
    enlace?: string;
    texto?: string;
    creado: number;
}

export type Ficha = Pelicula | Personaje | Escena | Guion;

const LS = (c: Coleccion) => `sm_estudios_${c}_v1`;

function leerLocal<T>(c: Coleccion): T[] {
    try {
        const raw = localStorage.getItem(LS(c));
        return raw ? (JSON.parse(raw) as T[]) : [];
    } catch { return []; }
}

function guardarLocal<T>(c: Coleccion, items: T[]): void {
    try { localStorage.setItem(LS(c), JSON.stringify(items)); } catch { /* modo privado */ }
}

/** Lee una colección. Con uid intenta Firestore; si falla, cae a local sin romper. */
export async function listar<T extends Ficha>(uid: string | null, c: Coleccion): Promise<T[]> {
    if (uid && db) {
        try {
            const snap = await getDoc(doc(db, 'users', uid, 'estudios', c));
            if (snap.exists()) {
                const items = (snap.data()?.items ?? []) as T[];
                guardarLocal(c, items); // copia local para arrancar rápido la próxima vez
                return items;
            }
            return [];
        } catch (e) {
            console.warn('[estudios] lectura remota falló, uso local:', e);
        }
    }
    return leerLocal<T>(c);
}

/** Guarda la colección entera (son listas cortas: una escritura es más simple y barata). */
export async function guardar<T extends Ficha>(uid: string | null, c: Coleccion, items: T[]): Promise<void> {
    guardarLocal(c, items);
    if (!uid || !db) return;
    try {
        await setDoc(doc(db, 'users', uid, 'estudios', c), { items, actualizado: Date.now() });
    } catch (e) {
        console.warn('[estudios] guardado remoto falló (queda en local):', e);
    }
}

export function nuevoId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export class SinClaveError extends Error {
    constructor() { super('Falta la clave de TMDB'); this.name = 'SinClaveError'; }
}

/**
 * Búsqueda de películas con TMDB (la misma fuente que usan las fichas tipo
 * IMDb/FilmAffinity): póster, sinopsis, tráiler de YouTube y dónde verla.
 *
 * Probé antes la API de iTunes porque no necesita clave, pero Apple ha retirado
 * las películas de su búsqueda pública: `media=movie` devuelve 0 siempre y el
 * filtrado genérico sólo saca títulos irrelevantes. Sin clave no hay búsqueda
 * fiable, así que aquí avisamos y la página ofrece alta manual.
 */
export async function buscarPeliculas(termino: string): Promise<Pelicula[]> {
    const q = termino.trim();
    if (!q) return [];

    const clave = process.env.NEXT_PUBLIC_TMDB_KEY;
    if (!clave) throw new SinClaveError();

    const base = 'https://api.themoviedb.org/3';
    const res = await fetch(`${base}/search/movie?api_key=${clave}&language=es-ES&include_adult=false&query=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('La búsqueda no respondió (' + res.status + ')');
    const data = await res.json();

    return (data.results ?? []).slice(0, 12).map((r: any): Pelicula => ({
        id: String(r.id),
        titulo: r.title ?? r.original_title ?? 'Sin título',
        anio: r.release_date ? String(r.release_date).slice(0, 4) : undefined,
        genero: undefined,
        sinopsis: r.overview || undefined,
        poster: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : undefined,
        verOnline: `https://www.themoviedb.org/movie/${r.id}/watch`,
        creado: Date.now(),
    }));
}

/** Busca el tráiler de YouTube de una película ya guardada (bajo demanda). */
export async function buscarTrailer(tmdbId: string): Promise<string | undefined> {
    const clave = process.env.NEXT_PUBLIC_TMDB_KEY;
    if (!clave) return undefined;
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${clave}&language=es-ES`);
        if (!res.ok) return undefined;
        const data = await res.json();
        const v = (data.results ?? []).find((x: any) => x.site === 'YouTube' && x.type === 'Trailer') ?? (data.results ?? [])[0];
        return v ? `https://www.youtube.com/watch?v=${v.key}` : undefined;
    } catch { return undefined; }
}
