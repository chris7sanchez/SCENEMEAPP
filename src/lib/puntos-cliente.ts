'use client';

// EL RECUENTO PROVISIONAL DE PUNTOS, hecho en el navegador.
//
// El recuento que vale es el del servidor (lib/puntos-servidor.ts), que es
// también el único que puede canjear. Pero si el servidor no puede leer la base
// de datos, el actor no debería quedarse viendo un error: con su propia sesión
// puede leer la Sala de visionado, así que se le enseña cuánto lleva.
//
// Es sólo para ENSEÑAR. No se guarda, no canjea nada y, cuando el servidor
// responde, manda su número. Puede variar un poco respecto al del servidor
// porque aquí el día sale del campo `creado` (lo escribe el navegador) y allí
// de la hora del servidor.

import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { misPublicaciones, listarPublicaciones, listarComentarios } from './comunidad-db';
import { contarActividad, type Actividad } from './puntos';

/** Tomas de otros en las que se buscan comentarios míos: menos que en el servidor, que el móvil no va sobrado. */
const TOMAS_A_MIRAR = 60;

function diaDe(ms: number): string {
    if (!ms) return '';
    return new Date(ms).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
}

export async function actividadProvisional(uid: string): Promise<Actividad> {
    if (!db) throw new Error('Sin base de datos');
    const base = db;

    const [mias, recientes] = await Promise.all([misPublicaciones(uid), listarPublicaciones(undefined, TOMAS_A_MIRAR)]);

    const votantesPorToma = await Promise.all(
        mias.map(async p => (await getDocs(collection(base, 'comunidad', p.id, 'bravos'))).docs.map(b => b.id)),
    );

    const comentarios = (await Promise.all(
        recientes.filter(p => p.uid !== uid).map(async p => {
            const mios = (await listarComentarios(p.id)).filter(c => c.uid === uid);
            const mejor = mios.sort((a, b) => b.texto.length - a.texto.length)[0];
            return mejor ? { dia: diaDe(mejor.creado), texto: mejor.texto } : null;
        }),
    )).filter((c): c is { dia: string; texto: string } => c !== null);

    return contarActividad(uid, { diasDeMisTomas: mias.map(p => diaDe(p.creado)), votantesPorToma, comentarios });
}
