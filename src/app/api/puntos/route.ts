import { NextResponse } from 'next/server';
import { frenar, errorPublico } from '@/lib/seguridad';
import { ensureAdmin, tieneCredenciales, usuarioDe } from '@/lib/firebase-admin';
import { resumenDe, canjear, NoSePuedeCanjear } from '@/lib/puntos-servidor';

// Los puntos de los Estudios (reglas y números en lib/puntos.ts).
//   GET  /api/puntos              → el resumen de quien llama: saldo, actividad y canjes
//   POST /api/puntos { premio }   → canjea un premio y devuelve el resumen nuevo
// Siempre con sesión: el uid sale del token, nunca de lo que mande el navegador.

function listo(): boolean {
    return tieneCredenciales() && ensureAdmin();
}

export async function GET(req: Request) {
    const frenado = frenar(req, 'puntos', 30);
    if (frenado) return frenado;

    const u = await usuarioDe(req);
    if (!u) return NextResponse.json({ error: 'sesion' }, { status: 401 });
    if (!listo()) return NextResponse.json({ error: 'sin_admin' }, { status: 503 });

    try {
        return NextResponse.json(await resumenDe(u.uid), { headers: { 'Cache-Control': 'no-store' } });
    } catch (e) {
        return errorPublico('puntos', e);
    }
}

export async function POST(req: Request) {
    const frenado = frenar(req, 'puntos-canjear', 6, 10 * 60_000);
    if (frenado) return frenado;

    const u = await usuarioDe(req);
    if (!u) return NextResponse.json({ error: 'sesion' }, { status: 401 });
    if (!listo()) return NextResponse.json({ error: 'sin_admin' }, { status: 503 });

    let body: any;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'cuerpo' }, { status: 400 }); }
    const premio = typeof body?.premio === 'string' ? body.premio.slice(0, 20) : '';

    try {
        return NextResponse.json(await canjear(u, premio), { headers: { 'Cache-Control': 'no-store' } });
    } catch (e) {
        if (e instanceof NoSePuedeCanjear) return NextResponse.json({ error: e.motivo }, { status: 409 });
        // Dos toques a la vez: el segundo choca al crear el mismo canje.
        if ((e as { code?: number })?.code === 6) return NextResponse.json({ error: 'pendiente' }, { status: 409 });
        return errorPublico('puntos/canjear', e);
    }
}
