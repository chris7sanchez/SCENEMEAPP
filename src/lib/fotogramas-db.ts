'use client';

// Decks (tableros de capturas) del actor. Mismo patrón que estudios-db: con sesión
// van a users/{uid}/estudios/decks (las reglas ya los dejan sólo a su dueño) y
// siempre queda una copia en localStorage. Las imágenes van a Storage, en
// users/{uid}/fotogramas/ (storage.rules ya lo deja sólo a su dueño).
//
// El tope de decks/planos del plan gratis se aplica en la pantalla; las reglas de
// Firestore no conocen el plan. Compartir (lo único que sale a otras personas)
// sí se comprueba en el servidor: /api/fotogramas/deck.

import { auth, db, storage } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
        // Firestore rechaza los campos undefined: el viaje por JSON los quita.
        await setDoc(doc(db, 'users', uid, 'estudios', 'decks'), { items: JSON.parse(JSON.stringify(decks)), actualizado: Date.now() });
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

/**
 * Reduce la captura a JPEG: `lado` píxeles como mucho en el lado largo.
 * Una captura de pantalla de un móvil puede pesar 5 MB; así queda en ~300 KB.
 */
export async function comprimir(archivo: Blob, lado: number, calidad = 0.85): Promise<Blob> {
    const bmp = await createImageBitmap(archivo);
    const k = Math.min(1, lado / Math.max(bmp.width, bmp.height));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(bmp.width * k);
    lienzo.height = Math.round(bmp.height * k);
    lienzo.getContext('2d')!.drawImage(bmp, 0, 0, lienzo.width, lienzo.height);
    bmp.close();
    return new Promise((ok, mal) => lienzo.toBlob(b => (b ? ok(b) : mal(new Error('No se pudo leer la imagen'))), 'image/jpeg', calidad));
}

export function aDataUrl(b: Blob): Promise<string> {
    return new Promise((ok, mal) => {
        const lector = new FileReader();
        lector.onload = () => ok(String(lector.result));
        lector.onerror = () => mal(lector.error);
        lector.readAsDataURL(b);
    });
}

export async function subirCaptura(uid: string, id: string, imagen: Blob): Promise<{ imagen: string; ruta: string }> {
    if (!storage) throw new Error('Storage no configurado');
    const ruta = `users/${uid}/fotogramas/${id}.jpg`;
    const r = ref(storage, ruta);
    await uploadBytes(r, imagen, { contentType: 'image/jpeg' });
    return { imagen: await getDownloadURL(r), ruta };
}

export async function borrarCaptura(ruta: string): Promise<void> {
    if (!storage || !ruta) return;
    try { await deleteObject(ref(storage, ruta)); } catch (e) { console.warn('[fotogramas] no se pudo borrar la captura:', e); }
}

export async function etiquetar(dataUrl: string) {
    const res = await fetch('/api/fotogramas/etiquetar', await conSesion({
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imagen: dataUrl }),
    }));
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()).etiquetas;
}
