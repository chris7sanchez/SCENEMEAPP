import { NextResponse } from 'next/server';
import { admin, ensureAdmin } from '@/lib/firebase-admin';
import { firmaStripeValida } from '@/lib/stripe-firma';

// Avisos de Stripe → suscripciones/{uid}. Es lo único que escribe esa colección.
// En el panel de Stripe: Developers → Webhooks → endpoint
//   https://<tu-dominio>/api/fotogramas/webhook
// con los eventos checkout.session.completed, customer.subscription.updated y
// customer.subscription.deleted. El secreto que da Stripe va en STRIPE_WEBHOOK_SECRET.

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const secreto = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secreto) return NextResponse.json({ error: 'sin_secreto' }, { status: 503 });

    // El cuerpo tiene que ser el texto exacto: la firma se calcula sobre él.
    const cuerpo = await req.text();
    if (!firmaStripeValida(cuerpo, req.headers.get('stripe-signature'), secreto)) {
        return NextResponse.json({ error: 'firma' }, { status: 400 });
    }
    if (!ensureAdmin()) return NextResponse.json({ error: 'sin_admin' }, { status: 503 });

    const evento = JSON.parse(cuerpo);
    const obj = evento?.data?.object ?? {};
    const col = admin.firestore().collection('suscripciones');

    try {
        if (evento.type === 'checkout.session.completed' && obj.mode === 'subscription') {
            const uid = obj.client_reference_id;
            if (typeof uid === 'string' && uid) {
                await col.doc(uid).set({ plan: 'pro', estado: 'active', cliente: obj.customer ?? null, actualizado: Date.now() }, { merge: true });
            }
        } else if (evento.type === 'customer.subscription.updated' || evento.type === 'customer.subscription.deleted') {
            const uid = obj.metadata?.uid;
            if (typeof uid === 'string' && uid) {
                const estado = evento.type === 'customer.subscription.deleted' ? 'canceled' : String(obj.status ?? 'canceled');
                const fin = obj.current_period_end ?? obj.items?.data?.[0]?.current_period_end;
                await col.doc(uid).set({
                    plan: 'pro',
                    estado,
                    hasta: typeof fin === 'number' ? fin * 1000 : null,
                    cliente: obj.customer ?? null,
                    actualizado: Date.now(),
                }, { merge: true });
            }
        }
    } catch (e) {
        // 500 para que Stripe reintente el aviso.
        console.error('[webhook-stripe]', e);
        return NextResponse.json({ error: 'guardado' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
