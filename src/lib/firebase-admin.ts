import * as admin from 'firebase-admin';

// firebase-admin se inicializa de forma perezosa: sin service account (un clon
// sin secretos, un preview de Vercel) devuelve null en vez de romper el build.
export function obtenerAdmin(): typeof admin | null {
    if (admin.apps.length) return admin;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!privateKey || !clientEmail || !projectId) return null;
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    return admin;
}
