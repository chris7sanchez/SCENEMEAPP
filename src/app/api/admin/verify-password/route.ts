import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize firebase-admin only once
if (!admin.apps.length) {
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    // Replace \n string with actual newline if needed
    const formattedPrivateKey = privateKey ? privateKey.replace(/\\n/g, '\n') : undefined;

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            privateKey: formattedPrivateKey,
        }),
    });
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
            // Generar un token personalizado para Firebase
            // Esto permite que el cliente se autentique en Firestore con permisos
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
