'use client';

// Decks (tableros de planos) del actor. Mismo patrón que estudios-db: con sesión
// van a users/{uid}/estudios/decks (las reglas ya los dejan sólo a su dueño) y
// siempre quedan una copia en localStorage.
//
// El tope de decks/planos del plan gratis se aplica en la pantalla; las reglas de
// Firestore no conocen el plan. Compartir (lo único que sale a otras personas)
// sí se comprueba en el servidor: /api/fotogramas/deck.

import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Deck, Plan } from './fotogramas';

const CLAVE_LOCAL = 'sceneme:fotogramas:decks';

export async function tokenSesion(): Promise<string | undefined> {
    try { return await auth?.currentUser?.getIdToken(); } catch { return undefined; }
}

export async function conSesion(init: RequestInit = {}): Promise<RequestInit> {
    const t = await tokenSesion();
    return { ...init, headers: { ...(init.headers as Record<string, string>), ...(t ? { Authorization: `Bearer ${t}` } : {}) } };
}

function leerLocal(): Deck[] {
    try { return JSON.parse(localStorage.getItem(CLAVE_LOCAL) || '[]'); } catch { return []; }
}

export async function listarDecks(uid: string | null): Promise<Deck[]> {
    if (uid && db) {
        try {
            const snap = await getDoc(doc(db, 'users', uid, 'estudios', 'decks'));
            if (snap.exists()) return (snap.data().items ?? []) as Deck[];
        } catch (e) {
            console.warn('[fotogramas] lectura remota falló (uso local):', e);
        }
    }
    return leerLocal();
}

export async function guardarDecks(uid: string | null, decks: Deck[]): Promise<void> {
    try { localStorage.setItem(CLAVE_LOCAL, JSON.stringify(decks)); } catch { /* sin cuota */ }
    if (!uid || !db) return;
    try {
        await setDoc(doc(db, 'users', uid, 'estudios', 'decks'), { items: decks, actualizado: Date.now() });
    } catch (e) {
        console.warn('[fotogramas] guardado remoto falló (queda en local):', e);
    }
}

export async function leerPlan(): Promise<{ plan: Plan; cobroListo: boolean; hasta?: number }> {
    try {
        const res = await fetch('/api/fotogramas/plan', await conSesion());
        if (res.ok) return await res.json();
    } catch { /* cae al gratis */ }
    return { plan: 'gratis', cobroListo: false };
}
