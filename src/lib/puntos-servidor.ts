// La parte de los puntos que sólo corre en el servidor (firebase-admin).
// Las reglas y los números están en lib/puntos.ts.

import { randomBytes } from 'node:crypto';
import { admin, ensureAdmin, type UsuarioVerificado } from '@/lib/firebase-admin';
import {
    contarActividad, hacerResumen, motivoParaNoCanjear, codigoDesde, PREMIOS,
    type Actividad, type Canje, type DatosActividad, type EstadoCanje, type MotivoNoCanje, type Resumen,
} from '@/lib/puntos';

const COMUNIDAD = 'comunidad';
const CANJES = 'canjes';

/** Tomas de otros en las que se buscan comentarios míos: las más recientes. */
const TOMAS_A_MIRAR = 150;

/** El día en Madrid de una marca de tiempo del servidor: «2026-11-10». */
function diaDe(t: FirebaseFirestore.Timestamp | undefined): string {
    if (!t) return '';
    return t.toDate().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
}

/**
 * Lo que este actor ha hecho en la Sala de visionado.
 *
 * Todo se cuenta con datos que el navegador no puede falsear: el día sale de
 * la hora a la que el SERVIDOR creó el documento (no del campo `creado`, que
 * lo escribe el navegador), y los bravos se cuentan uno a uno en su
 * subcolección (no del contador `bravos`).
 */
export async function leerActividad(uid: string): Promise<Actividad> {
    const db = admin.firestore();
    const col = db.collection(COMUNIDAD);

    const [mias, recientes] = await Promise.all([
        col.where('uid', '==', uid).select().get(),
        col.orderBy('creado', 'desc').limit(TOMAS_A_MIRAR).select('uid').get(),
    ]);

    const votantesPorToma = await Promise.all(
        mias.docs.map(async d => (await d.ref.collection('bravos').select().get()).docs.map(b => b.id)),
    );

    const deOtros = recientes.docs.filter(d => d.get('uid') !== uid);
    const comentarios = (await Promise.all(
        deOtros.map(async d => {
            const mios = await d.ref.collection('comentarios').where('uid', '==', uid).limit(5).get();
            // Uno por toma: el más largo que haya dejado ahí.
            const mejor = mios.docs
                .map(c => ({ dia: diaDe(c.createTime), texto: String(c.get('texto') ?? '') }))
                .sort((a, b) => b.texto.length - a.texto.length)[0];
            return mejor ?? null;
        }),
    )).filter((c): c is { dia: string; texto: string } => c !== null);

    const datos: DatosActividad = {
        diasDeMisTomas: mias.docs.map(d => diaDe(d.createTime)),
        votantesPorToma,
        comentarios,
    };
    return contarActividad(uid, datos);
}

function aCanje(d: FirebaseFirestore.DocumentSnapshot): Canje {
    return {
        id: d.id,
        codigo: String(d.get('codigo') ?? ''),
        premioId: String(d.get('premioId') ?? ''),
        puntos: Number(d.get('puntos') ?? 0),
        descuento: Number(d.get('descuento') ?? 0),
        estado: (d.get('estado') as EstadoCanje) ?? 'pendiente',
        creado: Number(d.get('creado') ?? 0),
    };
}

export async function resumenDe(uid: string): Promise<Resumen> {
    const [actividad, canjes] = await Promise.all([
        leerActividad(uid),
        admin.firestore().collection(CANJES).where('uid', '==', uid).get(),
    ]);
    return hacerResumen(actividad, canjes.docs.map(aCanje));
}

export class NoSePuedeCanjear extends Error {
    constructor(public motivo: MotivoNoCanje) { super(motivo); }
}

/** Con qué nombre firma, para que en el panel no salga sólo un email. */
async function nombreDe(uid: string): Promise<string> {
    try {
        const p = (await admin.firestore().collection('users').doc(uid).get()).get('profile') as
            { firstName?: string; lastName?: string } | undefined;
        return [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim();
    } catch {
        return '';
    }
}

/**
 * Canjea un premio y devuelve el resumen ya actualizado.
 *
 * El id del canje es «uid-n», con n = cuántos canjes lleva: si llegan dos
 * peticiones a la vez (doble toque), la segunda intenta crear el mismo
 * documento y falla, así que los puntos no se gastan dos veces.
 */
export async function canjear(u: UsuarioVerificado, premioId: string): Promise<Resumen> {
    const db = admin.firestore();
    const premio = PREMIOS.find(p => p.id === premioId);
    if (!premio) throw new NoSePuedeCanjear('premio');

    const [actividad, nombre] = await Promise.all([leerActividad(u.uid), nombreDe(u.uid)]);

    await db.runTransaction(async t => {
        const previos = (await t.get(db.collection(CANJES).where('uid', '==', u.uid))).docs.map(aCanje);
        const { saldo, ganados } = hacerResumen(actividad, previos);
        const motivo = motivoParaNoCanjear(premioId, saldo, previos);
        if (motivo) throw new NoSePuedeCanjear(motivo);

        t.create(db.collection(CANJES).doc(`${u.uid}-${previos.length + 1}`), {
            uid: u.uid,
            email: u.email ?? '',
            nombre,
            premioId: premio.id,
            puntos: premio.puntos,
            descuento: premio.descuento,
            codigo: codigoDesde(randomBytes(6)),
            estado: 'pendiente' satisfies EstadoCanje,
            creado: Date.now(),
            // Foto de cómo ganó los puntos, para que el admin pueda juzgar el canje.
            actividad,
            ganados,
        });
    });

    return resumenDe(u.uid);
}

/** Lo que ve el administrador de cada canje. */
export interface CanjeAdmin extends Canje {
    email: string;
    nombre: string;
    actividad: Actividad | null;
    ganados: number;
}

export async function listarCanjesAdmin(tope = 100): Promise<CanjeAdmin[]> {
    const snap = await admin.firestore().collection(CANJES).orderBy('creado', 'desc').limit(tope).get();
    return snap.docs.map(d => ({
        ...aCanje(d),
        email: String(d.get('email') ?? ''),
        nombre: String(d.get('nombre') ?? ''),
        actividad: (d.get('actividad') as Actividad | undefined) ?? null,
        ganados: Number(d.get('ganados') ?? 0),
    }));
}

export async function cambiarEstadoCanje(id: string, estado: EstadoCanje): Promise<boolean> {
    const ref = admin.firestore().collection(CANJES).doc(id);
    if (!(await ref.get()).exists) return false;
    await ref.update({ estado, revisado: Date.now() });
    return true;
}

export { ensureAdmin };
