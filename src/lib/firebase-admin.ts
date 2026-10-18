// firebase-admin compartido por las rutas del servidor.
//
// Se inicializa de forma perezosa (evita romper el build cuando no hay service
// account configurado). Con la service account puede firmar tokens (la entrada
// del admin con contraseña maestra); sin ella, al menos puede COMPROBAR los
// tokens de sesión que manda el navegador, que sólo necesita el id del proyecto.

import * as admin from 'firebase-admin';

export function ensureAdmin(): boolean {
    if (admin.apps.length) return true;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) return false;
    if (privateKey && clientEmail) {
        admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') }),
        });
    } else {
        admin.initializeApp({ projectId });
    }
    return true;
}

export function tieneCredenciales(): boolean {
    return !!(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
}

export { admin };

/** firebase-admin listo para usar, o null si no hay proyecto configurado. */
export function obtenerAdmin(): typeof admin | null {
    return ensureAdmin() ? admin : null;
}

export interface UsuarioVerificado { uid: string; email?: string }

/**
 * Quién llama, según el token de sesión de Firebase que manda el navegador en
 * la cabecera `Authorization: Bearer <token>`. null si no hay token o no vale.
 */
export async function usuarioDe(req: Request): Promise<UsuarioVerificado | null> {
    const cabecera = req.headers.get('authorization') || '';
    const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7).trim() : '';
    if (!token || !ensureAdmin()) return null;
    try {
        const d = await admin.auth().verifyIdToken(token);
        return { uid: d.uid, email: d.email };
    } catch {
        return null;
    }
}

/** El mismo criterio que firestore.rules: el uid de la contraseña maestra o el email del admin. */
export function esAdmin(u: UsuarioVerificado | null): boolean {
    if (!u) return false;
    if (u.uid === 'admin-dashboard') return true;
    const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'chris.7sanchez@gmail.com').toLowerCase();
    return !!u.email && u.email.toLowerCase() === adminEmail;
}
