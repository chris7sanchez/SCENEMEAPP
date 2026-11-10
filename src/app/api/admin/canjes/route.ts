import { NextResponse } from 'next/server';
import { frenar, errorPublico } from '@/lib/seguridad';
import { ensureAdmin, tieneCredenciales, usuarioDe, esAdmin } from '@/lib/firebase-admin';
import { listarCanjesAdmin, cambiarEstadoCanje } from '@/lib/puntos-servidor';
import type { EstadoCanje } from '@/lib/puntos';

// Los canjes de puntos, para el panel de administración.
//   GET  /api/admin/canjes                 → los últimos canjes
//   POST /api/admin/canjes { id, estado }  → marcarlo usado, anularlo o devolverlo a pendiente
// Sólo el administrador (token comprobado en el servidor).

const ESTADOS: EstadoCanje[] = ['pendiente', 'usado', 'anulado'];

async function soloAdmin(req: Request): Promise<NextResponse | null> {
    if (!esAdmin(await usuarioDe(req))) return NextResponse.json({ error: 'admin' }, { status: 403 });
    if (!tieneCredenciales() || !ensureAdmin()) return NextResponse.json({ error: 'sin_admin' }, { status: 503 });
    return null;
}

export async function GET(req: Request) {
    const frenado = frenar(req, 'admin-canjes', 60);
    if (frenado) return frenado;
    const no = await soloAdmin(req);
    if (no) return no;
    try {
        return NextResponse.json({ canjes: await listarCanjesAdmin() }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (e) {
        return errorPublico('admin/canjes', e);
    }
}

export async function POST(req: Request) {
    const frenado = frenar(req, 'admin-canjes', 60);
    if (frenado) return frenado;
    const no = await soloAdmin(req);
    if (no) return no;

    let body: any;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'cuerpo' }, { status: 400 }); }
    const id = typeof body?.id === 'string' ? body.id.slice(0, 200) : '';
    const estado = body?.estado as EstadoCanje;
    if (!id || id.includes('/') || !ESTADOS.includes(estado)) return NextResponse.json({ error: 'datos' }, { status: 400 });

    try {
        if (!(await cambiarEstadoCanje(id, estado))) return NextResponse.json({ error: 'no_existe' }, { status: 404 });
        return NextResponse.json({ canjes: await listarCanjesAdmin() }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (e) {
        return errorPublico('admin/canjes', e);
    }
}
