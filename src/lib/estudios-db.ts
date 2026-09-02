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

/**
 * Búsqueda de películas con la API de iTunes: no necesita clave, permite CORS y
 * devuelve póster, sinopsis, tráiler y una ficha donde verla.
 */
export async function buscarPeliculas(termino: string): Promise<Pelicula[]> {
    const q = termino.trim();
    if (!q) return [];
    const url = 'https://itunes.apple.com/search?media=movie&limit=12&country=ES&term=' + encodeURIComponent(q);
    const res = await fetch(url);
    if (!res.ok) throw new Error('La búsqueda no respondió (' + res.status + ')');
    const data = await res.json();
    return (data.results ?? []).map((r: any): Pelicula => ({
        id: String(r.trackId ?? nuevoId()),
        titulo: r.trackName ?? 'Sin título',
        anio: r.releaseDate ? String(r.releaseDate).slice(0, 4) : undefined,
        genero: r.primaryGenreName ?? undefined,
        sinopsis: r.longDescription ?? r.shortDescription ?? undefined,
        // el artwork viene a 100px; pedir 600 da un póster decente
        poster: r.artworkUrl100 ? String(r.artworkUrl100).replace('100x100', '600x600') : undefined,
        trailer: r.previewUrl ?? undefined,
        verOnline: r.trackViewUrl ?? undefined,
        creado: Date.now(),
    }));
}
