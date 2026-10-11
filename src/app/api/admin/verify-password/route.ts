import { NextResponse } from 'next/server';
import { obtenerAdmin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { password } = body;

        const masterPassword = process.env.ADMIN_PASSWORD;

        if (!masterPassword) {
            return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 });
        }

        if (password === masterPassword) {
            const fb = obtenerAdmin();
            if (!fb) {
                return NextResponse.json({ error: 'Firebase admin no configurado' }, { status: 500 });
            }
            // Token personalizado para que el cliente se autentique en Firestore con permisos
            const customToken = await fb.auth().createCustomToken('admin-dashboard');
            return NextResponse.json({ success: true, token: customToken });
        } else {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
    } catch (error: any) {
        console.error("Auth error:", error);
        return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
    }
}
