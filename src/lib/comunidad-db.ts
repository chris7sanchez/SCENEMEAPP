'use client';

// LA SALA DE VISIONADO: lo que los actores deciden enseñar a los demás.
//
// La regla que manda aquí: NADA es público por accidente. Las tomas siguen
// viviendo privadas en users/{uid}/submissions, y sólo cuando el actor pulsa
// «Compartir en la Sala» se crea una copia de sus DATOS en `comunidad`, que sí
// es legible por cualquiera con sesión. Retirarla borra esa copia; el vídeo
// original no se toca nunca.
//
// Un aviso honesto sobre el vídeo en sí: la downloadURL de Firebase Storage
// lleva un token y funciona para cualquiera que la tenga. Es imposible de
// adivinar, pero no caduca al retirar la publicación: quien ya la copió puede
// seguir abriéndola. Para que retirar borre también el acceso habría que servir
// el vídeo por una URL firmada temporal, y eso es otro trabajo.

import { db } from './firebase';
import {
    collection, doc, addDoc, setDoc, deleteDoc, getDoc, getDocs,
    query, orderBy, where, limit as qLimit, runTransaction, serverTimestamp,
} from 'firebase/firestore';

export interface Publicacion {
    id: string;
    uid: string;
    /** Nombre con el que firma; si no hay perfil, algo digno y no el email. */
    autor: string;
    /** Clave del día (y de la escena): permite juntar todas las versiones de una misma escena. */
    fecha: string;
    titulo: string;
    downloadURL: string;
    /** De dónde salió, para poder borrar la publicación desde la propia toma. */
    submissionId?: string;
    nota?: string;
    creado: number;
    /** Cuántos bravos lleva. Se mantiene al día en una transacción. */
    bravos: number;
}

export interface Comentario {
    id: string;
    uid: string;
    autor: string;
    texto: string;
    creado: number;
}

const COL = 'comunidad';

/** El muro, de lo más nuevo a lo más viejo. Con `fecha`, sólo esa escena. */
export async function listarPublicaciones(fecha?: string, tope = 60): Promise<Publicacion[]> {
    if (!db) return [];
    const base = collection(db, COL);
    // Filtrar por fecha Y ordenar por creado pediría un índice compuesto que no
    // está creado; como son pocas por día, se ordena aquí.
    const q = fecha
        ? query(base, where('fecha', '==', fecha), qLimit(tope))
        : query(base, orderBy('creado', 'desc'), qLimit(tope));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Publicacion, 'id'>) }));
    return fecha ? items.sort((a, b) => b.creado - a.creado) : items;
}

/** Las fechas que tienen algo publicado, para el selector de escena. */
export async function fechasConPublicaciones(): Promise<string[]> {
    const items = await listarPublicaciones(undefined, 200);
    return Array.from(new Set(items.map(i => i.fecha))).sort().reverse();
}

/** Publica una toma. Devuelve el id de la publicación. */
export async function publicar(
    datos: Omit<Publicacion, 'id' | 'creado' | 'bravos'>,
): Promise<string> {
    if (!db) throw new Error('Sin base de datos');
    const ref = await addDoc(collection(db, COL), { ...datos, creado: Date.now(), bravos: 0 });
    return ref.id;
}

/** Retira una publicación. Sólo su dueño (o un admin) puede, por reglas. */
export async function retirar(id: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, COL, id));
}

/** Qué publicaciones son de este usuario, para pintar «Retirar» en su toma. */
export async function misPublicaciones(uid: string): Promise<Publicacion[]> {
    if (!db) return [];
    const snap = await getDocs(query(collection(db, COL), where('uid', '==', uid)));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Publicacion, 'id'>) }));
}

// ---------------------------------------------------------------- bravos ---

/** ¿He dado ya mi bravo a esto? */
export async function tengoBravo(postId: string, uid: string): Promise<boolean> {
    if (!db) return false;
    const snap = await getDoc(doc(db, COL, postId, 'bravos', uid));
    return snap.exists();
}

/**
 * Da o quita el bravo. Un documento por usuario (el id ES su uid), así que no
 * se puede aplaudir dos veces; el contador se mueve en la misma transacción
 * para que no se descuadre si dos personas aplauden a la vez.
 */
export async function alternarBravo(postId: string, uid: string): Promise<boolean> {
    if (!db) return false;
    const postRef = doc(db, COL, postId);
    const mio = doc(db, COL, postId, 'bravos', uid);
    return runTransaction(db, async (tx) => {
        const [post, yaEsta] = await Promise.all([tx.get(postRef), tx.get(mio)]);
        if (!post.exists()) return false;
        const actual = (post.data()?.bravos as number) ?? 0;
        if (yaEsta.exists()) {
            tx.delete(mio);
            tx.update(postRef, { bravos: Math.max(0, actual - 1) });
            return false;
        }
        tx.set(mio, { creado: Date.now() });
        tx.update(postRef, { bravos: actual + 1 });
        return true;
    });
}

// ----------------------------------------------------------- comentarios ---

export async function listarComentarios(postId: string): Promise<Comentario[]> {
    if (!db) return [];
    const snap = await getDocs(query(collection(db, COL, postId, 'comentarios'), orderBy('creado', 'asc')));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Comentario, 'id'>) }));
}

export async function comentar(postId: string, uid: string, autor: string, texto: string): Promise<Comentario> {
    if (!db) throw new Error('Sin base de datos');
    const limpio = texto.trim().slice(0, 1200);
    if (!limpio) throw new Error('Comentario vacío');
    const datos = { uid, autor, texto: limpio, creado: Date.now() };
    const ref = await addDoc(collection(db, COL, postId, 'comentarios'), datos);
    return { id: ref.id, ...datos };
}

export async function borrarComentario(postId: string, comentarioId: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, COL, postId, 'comentarios', comentarioId));
}

// -------------------------------------------------------------- reportes ---

/**
 * Denuncia. Va a una colección aparte que sólo lee el admin: el que denuncia
 * no puede ver ni borrar lo que denuncia, y el denunciado no se entera.
 */
export async function denunciar(
    postId: string,
    uid: string,
    motivo: string,
    comentarioId?: string,
): Promise<void> {
    if (!db) return;
    await setDoc(doc(collection(db, 'reportes')), {
        postId,
        comentarioId: comentarioId ?? null,
        tipo: comentarioId ? 'comentario' : 'publicacion',
        denunciante: uid,
        motivo: motivo.trim().slice(0, 500),
        creado: Date.now(),
        recibido: serverTimestamp(),
    });
}

/** Un nombre presentable a partir del perfil, sin enseñar nunca el email. */
export function nombreParaFirmar(perfil?: { firstName?: string; lastName?: string } | null): string {
    const nombre = [perfil?.firstName, perfil?.lastName].filter(Boolean).join(' ').trim();
    return nombre || 'Actor anónimo';
}
