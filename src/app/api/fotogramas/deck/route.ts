import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { frenar } from '@/lib/seguridad';
import { admin, ensureAdmin, usuarioDe } from '@/lib/firebase-admin';
import { planDe } from '@/lib/suscripcion';
import { limpiarPlanosPublicos } from '@/lib/fotogramas';

// Compartir un deck por enlace (sólo Pro).
//   POST /api/fotogramas/deck  { nombre, planos, id? } → { id }   (crea o actualiza el enlace)
//   GET  /api/fotogramas/deck?id=abc → { nombre, planos } (lo ve quien tenga el enlace; no se indexa)
// Si alguien lo denuncia (/api/fotogramas/denuncia) queda retirado y deja de verse.
// Se guarda una COPIA en decksPublicos/{id}; el deck original sigue siendo privado.

const ID = /^[a-f0-9]{16}$/;

export async function POST(req: Request) {
    const frenado = frenar(req, 'fotogramas-deck', 20);
    if (frenado) return frenado;

    const u = await usuarioDe(req);
    if (!u) return NextResponse.json({ error: 'sesion' }, { status: 401 });
    if ((await planDe(u)) !== 'pro') return NextResponse.json({ error: 'pro' }, { status: 402 });
    if (!ensureAdmin()) return NextResponse.json({ error: 'sin_admin' }, { status: 503 });

    let body: any;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'cuerpo' }, { status: 400 }); }
    const planos = limpiarPlanosPublicos(body?.planos);
    if (planos.length === 0) return NextResponse.json({ error: 'vacio' }, { status: 400 });
    const nombre = String(body?.nombre ?? '').trim().slice(0, 80) || 'Deck sin nombre';

    const col = admin.firestore().collection('decksPublicos');
    let id = typeof body?.id === 'string' && ID.test(body.id) ? body.id : '';
    if (id) {
        // Sólo el dueño del enlace puede reescribirlo.
        const previo = await col.doc(id).get();
        if (previo.exists && previo.data()?.uid !== u.uid) id = '';
        // Un enlace retirado por denuncia no lo reabre su dueño: lo revisa el admin.
        else if (previo.exists && previo.data()?.retirado) return NextResponse.json({ error: 'retirado' }, { status: 403 });
    }
    if (!id) id = randomBytes(8).toString('hex');

    // Firestore no admite undefined: se limpia con un viaje por JSON.
    await col.doc(id).set({ uid: u.uid, nombre, planos: JSON.parse(JSON.stringify(planos)), actualizado: Date.now() });
    return NextResponse.json({ id });
}

export async function GET(req: Request) {
    const frenado = frenar(req, 'fotogramas-deck-ver', 60);
    if (frenado) return frenado;

    const id = new URL(req.url).searchParams.get('id') || '';
    if (!ID.test(id)) return NextResponse.json({ error: 'id' }, { status: 400 });
    if (!ensureAdmin()) return NextResponse.json({ error: 'sin_admin' }, { status: 503 });

    const snap = await admin.firestore().collection('decksPublicos').doc(id).get();
    const d = snap.data();
    if (!d || d.retirado) return NextResponse.json({ error: 'no_existe' }, { status: 404 });
    // El uid del dueño no sale nunca.
    return NextResponse.json({ nombre: d.nombre, planos: d.planos }, { headers: { 'Cache-Control': 'public, s-maxage=60' } });
}
