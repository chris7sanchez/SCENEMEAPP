import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// firebase-admin se inicializa de forma perezosa dentro del handler
// (evita romper el build cuando no hay service account configurado).
function ensureAdmin(): boolean {
    if (admin.apps.length) return true;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!privateKey || !clientEmail || !projectId) return false;
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
    });
    return true;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { password } = body;

        const masterPassword = process.env.ADMIN_PASSWORD;

        if (!masterPassword) {
            return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 });
        }

        if (password === masterPassword) {
            if (!ensureAdmin()) {
                return NextResponse.json({ error: 'Firebase admin no configurado' }, { status: 500 });
            }
            // Token personalizado para que el cliente se autentique en Firestore con permisos
            const customToken = await admin.auth().createCustomToken('admin-dashboard');
            return NextResponse.json({ success: true, token: customToken });
        } else {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
    } catch (error: any) {
        console.error("Auth error:", error);
        return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
    }
}
