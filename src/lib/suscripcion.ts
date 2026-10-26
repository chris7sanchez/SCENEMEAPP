// Plan de cada persona (gratis / pro), leído SIEMPRE en el servidor.
//
// El documento suscripciones/{uid} lo escribe sólo el webhook de Stripe con
// firebase-admin; las reglas de Firestore no tienen ninguna entrada para esa
// colección, así que el navegador no puede leerla ni escribirla.

import { admin, ensureAdmin, esAdmin, type UsuarioVerificado } from './firebase-admin';
import { TODO_GRATIS, type Plan } from './fotogramas';

export interface Suscripcion {
    plan: Plan;
    estado: string;          // estado de Stripe: active, trialing, past_due, canceled...
    hasta?: number;          // ms: fin del periodo ya pagado
    cliente?: string;        // id de cliente en Stripe (para el portal de facturación)
}

/** Estados en los que se conserva el Pro: pagando, en prueba, o cancelada pero con el periodo pagado por delante. */
export function sigueSiendoPro(s: Pick<Suscripcion, 'estado' | 'hasta'> | undefined, ahora = Date.now()): boolean {
    if (!s) return false;
    if (s.estado === 'active' || s.estado === 'trialing') return true;
    return !!s.hasta && s.hasta > ahora && s.estado !== 'incomplete_expired';
}

export async function suscripcionDe(uid: string): Promise<Suscripcion | undefined> {
    if (!ensureAdmin()) return undefined;
    try {
        const snap = await admin.firestore().collection('suscripciones').doc(uid).get();
        return snap.exists ? (snap.data() as Suscripcion) : undefined;
    } catch (e) {
        console.error('[suscripcion] lectura falló:', e);
        return undefined;
    }
}

/** El admin cuenta como Pro para poder probar sin pagar; en el periodo de prueba, todos los que tienen sesión. */
export async function planDe(u: UsuarioVerificado | null): Promise<Plan> {
    if (!u) return 'gratis';
    if (TODO_GRATIS || esAdmin(u)) return 'pro';
    return sigueSiendoPro(await suscripcionDe(u.uid)) ? 'pro' : 'gratis';
}
