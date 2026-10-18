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
    /** Qué escena del guion es este fragmento ("12. INT. COCINA - NOCHE"). */
    escena?: string;
    /** De qué hemeroteca salió (bloguionistas, aprendercine…). */
    fuente?: string;
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

/** Corta una promesa que se eterniza. Firestore no siempre rechaza: a veces
 *  simplemente no responde (sin red, permisos raros), y sin esto la página se
 *  quedaría cargando para siempre. */
function conLimite<T>(promesa: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promesa,
        new Promise<T>((_, rechaza) => setTimeout(() => rechaza(new Error('tiempo agotado')), ms)),
    ]);
}

/** Lee una colección. Con uid intenta Firestore; si falla o tarda, cae a local sin romper. */
export async function listar<T extends Ficha>(uid: string | null, c: Coleccion): Promise<T[]> {
    if (uid && db) {
        try {
            const snap = await conLimite(getDoc(doc(db, 'users', uid, 'estudios', c)), 6000);
            if (snap.exists()) {
                const items = (snap.data()?.items ?? []) as T[];
                guardarLocal(c, items); // copia local para arrancar rápido la próxima vez
                return items;
            }
            return [];
        } catch (e) {
            console.warn('[estudios] lectura remota falló o tardó demasiado, uso local:', e);
        }
    }
    return leerLocal<T>(c);
}

/** Guarda la colección entera (son listas cortas: una escritura es más simple y barata). */
export async function guardar<T extends Ficha>(uid: string | null, c: Coleccion, items: T[]): Promise<void> {
    guardarLocal(c, items);
    if (!uid || !db) return;
    try {
        await conLimite(setDoc(doc(db, 'users', uid, 'estudios', c), { items, actualizado: Date.now() }), 8000);
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

    // La clave de TMDB vive en el servidor (/api/peliculas): ya no viaja al navegador.
    const res = await fetch(`/api/peliculas?q=${encodeURIComponent(q)}`);
    if (res.status === 503) throw new SinClaveError();
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
    try {
        const res = await fetch(`/api/peliculas?trailer=${encodeURIComponent(tmdbId)}`);
        if (!res.ok) return undefined;
        const data = await res.json();
        return data?.url || undefined;
    } catch { return undefined; }
}
