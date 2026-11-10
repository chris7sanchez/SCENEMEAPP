// EL TABLÓN DE LOS ESTUDIOS: quién está entrenando aquí.
//
// 10/11/2026 (Christian): Talentos deja de ser una pestaña con perfiles de
// ejemplo (nombres inventados y fotos de banco de imágenes) y pasa a ser el
// tablón de los Estudios, hecho sólo con gente real.
//
// No hay colección nueva ni reglas nuevas: un actor entra en el tablón cuando
// comparte una toma en la Sala de visionado (colección `comunidad`, que ya es
// legible con sesión). Su ficha se saca de lo que él mismo ha publicado. Quien
// retira todas sus tomas, sale del tablón.

import type { Publicacion } from './comunidad-db';

export interface ActorTablon {
    uid: string;
    /** Con el que firmó su toma más reciente. */
    nombre: string;
    /** Tomas que tiene compartidas ahora mismo. */
    tomas: number;
    /** Bravos que suman todas. */
    bravos: number;
    /** Cuándo compartió la última (ms). */
    ultima: number;
    /** Título de esa última toma. */
    ultimoTitulo: string;
}

/** Lo que se guarda en el pedido cuando se elige compañero en el paso de reparto. */
export interface Companero {
    uid: string;
    nombre: string;
}

/** Agrupa el muro por actor, del que compartió hace menos al que hace más. */
export function actoresDelTablon(publicaciones: Publicacion[]): ActorTablon[] {
    const porUid = new Map<string, ActorTablon>();
    for (const p of publicaciones) {
        if (!p.uid) continue;
        const ficha = porUid.get(p.uid);
        if (!ficha) {
            porUid.set(p.uid, {
                uid: p.uid,
                nombre: p.autor || 'Actor de los Estudios',
                tomas: 1,
                bravos: p.bravos || 0,
                ultima: p.creado || 0,
                ultimoTitulo: p.titulo || '',
            });
            continue;
        }
        ficha.tomas += 1;
        ficha.bravos += p.bravos || 0;
        if ((p.creado || 0) > ficha.ultima) {
            ficha.ultima = p.creado || 0;
            ficha.ultimoTitulo = p.titulo || '';
            if (p.autor) ficha.nombre = p.autor;
        }
    }
    return Array.from(porUid.values()).sort((a, b) => b.ultima - a.ultima);
}

/** «Ana García» → «AG». Para la ficha: no se enseña foto que no sea suya. */
export function iniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '·';
    const letras = partes.length === 1 ? partes[0].slice(0, 2) : partes[0][0] + partes[partes.length - 1][0];
    return letras.toUpperCase();
}

/** Las dinámicas de escena en las que no hay compañero que elegir. */
export function llevaCompanero(dinamica: string): boolean {
    return dinamica !== '' && dinamica !== 'solo';
}
