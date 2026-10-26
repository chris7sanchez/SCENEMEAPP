import { NextResponse } from 'next/server';
import { frenar, textoLimpio, esEmail, escaparHtml as e } from '@/lib/seguridad';
import { admin, ensureAdmin } from '@/lib/firebase-admin';
import { sendBookingEmail } from '@/lib/booking-emails';

// POST /api/fotogramas/denuncia  { deck, nombre, email, motivo }
// Un titular de derechos (o cualquiera) avisa de una imagen de un deck compartido.
// El enlace se RETIRA al momento (retirado: true) y llega un correo al admin
// para revisarlo. Así la app cumple como alojador: retira en cuanto sabe.

export async function POST(req: Request) {
    const frenado = frenar(req, 'fotogramas-denuncia', 5);
    if (frenado) return frenado;
    if (!ensureAdmin()) return NextResponse.json({ error: 'sin_admin' }, { status: 503 });

    let b: any;
    try { b = await req.json(); } catch { return NextResponse.json({ error: 'cuerpo' }, { status: 400 }); }
    const deck = textoLimpio(b?.deck, 16);
    const nombre = textoLimpio(b?.nombre, 120);
    const motivo = textoLimpio(b?.motivo, 2000);
    if (!/^[a-f0-9]{16}$/.test(deck) || !nombre || motivo.length < 10 || !esEmail(b?.email)) {
        return NextResponse.json({ error: 'datos', message: 'Rellena nombre, email y el motivo (al menos 10 caracteres).' }, { status: 400 });
    }

    const db = admin.firestore();
    const ref = db.collection('decksPublicos').doc(deck);
    if (!(await ref.get()).exists) return NextResponse.json({ error: 'no_existe' }, { status: 404 });

    await db.collection('denunciasFotogramas').add({ deck, nombre, email: b.email, motivo, creado: Date.now() });
    await ref.set({ retirado: true, retiradoEn: Date.now() }, { merge: true });

    const destino = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'chris.7sanchez@gmail.com';
    await sendBookingEmail(destino, 'Fotogramas: denuncia de un deck compartido', `
        <p>Se ha denunciado el deck compartido <b>${e(deck)}</b> y se ha retirado el enlace.</p>
        <p><b>De:</b> ${e(nombre)} &lt;${e(b.email)}&gt;</p>
        <p><b>Motivo:</b><br>${e(motivo).replace(/\n/g, '<br>')}</p>
        <p>Para volver a publicarlo, quita <code>retirado</code> del documento decksPublicos/${e(deck)} en Firebase.</p>`);

    return NextResponse.json({ ok: true });
}
