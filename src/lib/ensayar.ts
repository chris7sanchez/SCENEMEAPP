'use client';

// EL PUENTE ENTRE LA SALA DE PRODUCCIÓN Y EL PLATÓ.
//
// Una escena guardada en /estudios se convierte en un guion de ensayo (los que
// lista el Plató en "Tus guiones") y se abre directamente en el reproductor:
// /studio?ensayo=<id>. El Plató lee ese parámetro al cargar su biblioteca.

import { guardarGuion, nuevoId, type GuionEnsayo } from './rehearsal-db';

export const PARAM_ENSAYO = 'ensayo';

/** Guarda el texto como guion de ensayo y devuelve la ruta del Plató que lo abre. */
export async function prepararEnsayo(uid: string | null, titulo: string, texto: string): Promise<string> {
    const ahora = Date.now();
    const g: GuionEnsayo = {
        id: nuevoId(),
        titulo: titulo.trim() || 'Escena de la hemeroteca',
        texto: texto.trim(),
        reparto: {},
        creado: ahora,
        actualizado: ahora,
    };
    await guardarGuion(uid, g);
    return `/studio?${PARAM_ENSAYO}=${encodeURIComponent(g.id)}`;
}
