'use client';

// Almacén de "conocimiento propio" (Bibliotheca) que alimenta el análisis de personajes.
// Persiste en localStorage (instantáneo, funciona para invitados y en producción)
// y, si hay sesión, también en Firestore (multi-dispositivo).

import { loadAntigravityState, saveAntigravityState } from './antigravity-db';

export interface KnowledgeEntry {
    target: string;
    category: string;
    value: string;
    description: string;
}

const LS_KEY = 'sceneme_customKnowledge';

export async function loadCustomKnowledge(): Promise<KnowledgeEntry[]> {
    let local: KnowledgeEntry[] = [];
    try {
        const s = localStorage.getItem(LS_KEY);
        if (s) local = JSON.parse(s);
    } catch (e) { /* ignore */ }

    // Si hay nube y tiene al menos tanto como local, la nube manda (multi-dispositivo).
    try {
        const cloud = await loadAntigravityState();
        const ck = cloud?.customKnowledge;
        if (Array.isArray(ck) && ck.length >= local.length) {
            try { localStorage.setItem(LS_KEY, JSON.stringify(ck)); } catch (e) { /* ignore */ }
            return ck as KnowledgeEntry[];
        }
    } catch (e) { /* ignore */ }

    return local;
}

export async function saveCustomKnowledge(entries: KnowledgeEntry[]): Promise<void> {
    try { localStorage.setItem(LS_KEY, JSON.stringify(entries)); } catch (e) { /* ignore */ }
    try { await saveAntigravityState({ customKnowledge: entries }); } catch (e) { /* ignore */ }
}
