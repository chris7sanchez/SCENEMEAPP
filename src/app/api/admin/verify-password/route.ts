import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { admin, ensureAdmin, tieneCredenciales } from '@/lib/firebase-admin';
import { frenar, errorPublico } from '@/lib/seguridad';

// La contraseña maestra del panel de administración.
//
// SEGURIDAD (18/10/2026):
// - Tope de 8 intentos cada 15 minutos por persona: antes se podían probar
//   contraseñas sin fin, y acertar da acceso de administrador a toda la base.
// - Comparación en tiempo constante (timingSafeEqual sobre el hash), para que
//   el tiempo de respuesta no dé pistas de cuántas letras se han acertado.
// - Los errores ya no devuelven el detalle interno.

function igualesEnTiempoConstante(a: string, b: string): boolean {
    const ha = createHash('sha256').update(a).digest();
    const hb = createHash('sha256').update(b).digest();
    return timingSafeEqual(ha, hb);
}

export async function POST(req: Request) {
    const frenado = frenar(req, 'admin-password', 8, 15 * 60_000);
    if (frenado) return frenado;

    try {
        const body = await req.json();
        const password = typeof body?.password === 'string' ? body.password.slice(0, 256) : '';

        const masterPassword = process.env.ADMIN_PASSWORD;

        if (!masterPassword) {
            return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 });
        }

        if (password && igualesEnTiempoConstante(password, masterPassword)) {
            if (!tieneCredenciales() || !ensureAdmin()) {
                return NextResponse.json({ error: 'Firebase admin no configurado' }, { status: 500 });
            }
            // Token personalizado para que el cliente se autentique en Firestore con permisos
            const customToken = await admin.auth().createCustomToken('admin-dashboard');
            return NextResponse.json({ success: true, token: customToken });
        }
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    } catch (error) {
        return errorPublico('admin/verify-password', error);
    }
}
