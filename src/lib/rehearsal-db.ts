'use client';

// LOS GUIONES DEL ACTOR: el guion entero y su REPARTO DE VOCES.
//
// Lo que guarda y por qué: subir un guion de noventa páginas y repartir la voz
// y el tono de ocho personajes es trabajo. Hacerlo otra vez en cada ensayo
// sería absurdo, así que el guion y su reparto viven en la cuenta y se
// recuperan en cualquier aparato.
//
// Persistencia en dos niveles, igual que "Mis Estudios" (estudios-db.ts):
//  - Con sesión: Firestore en users/{uid}/estudios/ensayos. Las reglas ya
//    permiten leer y escribir sólo al dueño de users/{uid}/** — no hay que
//    tocar firestore.rules.
//  - Sin sesión (o si Firebase falla o tarda): localStorage, para que el
//    ensayo funcione igual y nada se pierda al recargar.

import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { VoiceProfile } from './speech';

/** Cómo suena cada personaje: nombre del personaje -> voz y tono. */
export type Reparto = Record<string, VoiceProfile>;

export interface GuionEnsayo {
    id: string;
    titulo: string;
    /** El guion entero en texto. Es la fuente: las escenas se derivan al vuelo. */
    texto: string;
    /** Voz y tono de cada personaje. */
    reparto: Reparto;
    /** Tu personaje en este guion. */
    miPersonaje?: string;
    /** Motor de voz elegido la última vez ('browser' | 'ai' | 'eleven' | 'cartesia'). */
    motor?: string;
    creado: number;
    actualizado: number;
}

const LS = 'sm_ensayo_guiones_v1';
const RUTA = (uid: string) => doc(db!, 'users', uid, 'estudios', 'ensayos');

function leerLocal(): GuionEnsayo[] {
    try {
        const raw = localStorage.getItem(LS);
        return raw ? (JSON.parse(raw) as GuionEnsayo[]) : [];
    } catch { return []; }
}

function guardarLocal(items: GuionEnsayo[]): void {
    try { localStorage.setItem(LS, JSON.stringify(items)); } catch { /* modo privado */ }
}

/** Corta una promesa que se eterniza: Firestore a veces ni resuelve ni rechaza. */
function conLimite<T>(promesa: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promesa,
        new Promise<T>((_, rechaza) => setTimeout(() => rechaza(new Error('tiempo agotado')), ms)),
    ]);
}

/** Lee los guiones guardados. Con uid intenta Firestore; si falla, local. */
export async function listarGuiones(uid: string | null): Promise<GuionEnsayo[]> {
    if (uid && db) {
        try {
            const snap = await conLimite(getDoc(RUTA(uid)), 6000);
            const items = snap.exists() ? ((snap.data()?.items ?? []) as GuionEnsayo[]) : [];
            guardarLocal(items);
            return items;
        } catch (e) {
            console.warn('[ensayo] lectura remota falló o tardó demasiado, uso local:', e);
        }
    }
    return leerLocal();
}

/** Guarda la lista entera (son pocos guiones: una escritura es más simple). */
export async function guardarGuiones(uid: string | null, items: GuionEnsayo[]): Promise<void> {
    guardarLocal(items);
    if (!uid || !db) return;
    try {
        await conLimite(setDoc(RUTA(uid), { items, actualizado: Date.now() }), 8000);
    } catch (e) {
        console.warn('[ensayo] guardado remoto falló (queda en local):', e);
    }
}

/** Añade o reemplaza un guion y devuelve la lista ya actualizada. */
export async function guardarGuion(uid: string | null, guion: GuionEnsayo): Promise<GuionEnsayo[]> {
    const previos = await listarGuiones(uid);
    const i = previos.findIndex(g => g.id === guion.id);
    const actualizado = { ...guion, actualizado: Date.now() };
    const items = i >= 0
        ? previos.map(g => (g.id === guion.id ? actualizado : g))
        : [actualizado, ...previos];
    await guardarGuiones(uid, items);
    return items;
}

export async function borrarGuion(uid: string | null, id: string): Promise<GuionEnsayo[]> {
    const items = (await listarGuiones(uid)).filter(g => g.id !== id);
    await guardarGuiones(uid, items);
    return items;
}

export function nuevoId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Un título razonable a partir del propio guion cuando el actor no pone uno:
 * la primera línea con letra que no sea un encabezado de escena.
 */
export function tituloSugerido(texto: string, respaldo = 'Guion sin título'): string {
    for (const raw of (texto || '').split('\n').slice(0, 40)) {
        const l = raw.trim();
        if (l.length < 2) continue;
        if (/^(\d{1,3}[.)\-]?\s*)?(INT\.|EXT\.|EST\.|ESCENA|SECUENCIA|FADE|CUT)/i.test(l)) continue;
        if (!/[a-zA-ZÁÉÍÓÚÑÜáéíóúñü]/.test(l)) continue;
        return l.length <= 60 ? l : l.slice(0, 59) + '…';
    }
    return respaldo;
}
