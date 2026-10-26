import { NextResponse } from 'next/server';
import { frenar } from '@/lib/seguridad';
import { usuarioDe } from '@/lib/firebase-admin';
import { suscripcionDe } from '@/lib/suscripcion';

// POST /api/fotogramas/checkout          → { url } de Stripe Checkout (suscripción)
// POST /api/fotogramas/checkout?portal=1 → { url } del portal para cambiar tarjeta o cancelar
//
// Sin librería de Stripe: su API es REST con cuerpo de formulario. El precio NO
// está en el código: viene de STRIPE_PRICE_ID (se crea en el panel de Stripe).

const STRIPE = 'https://api.stripe.com/v1';

async function stripe(ruta: string, cuerpo: URLSearchParams, clave: string) {
    const res = await fetch(`${STRIPE}${ruta}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: cuerpo,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`stripe ${res.status}: ${data?.error?.message ?? ''}`);
    return data;
}

export async function POST(req: Request) {
    const frenado = frenar(req, 'fotogramas-pago', 10);
    if (frenado) return frenado;

    const clave = process.env.STRIPE_SECRET_KEY;
    const precio = process.env.STRIPE_PRICE_ID;
    if (!clave || !precio) return NextResponse.json({ error: 'sin_stripe' }, { status: 503 });

    const u = await usuarioDe(req);
    if (!u) return NextResponse.json({ error: 'sesion' }, { status: 401 });

    const origen = new URL(req.url).origin;
    const portal = new URL(req.url).searchParams.get('portal');

    try {
        if (portal) {
            const s = await suscripcionDe(u.uid);
            if (!s?.cliente) return NextResponse.json({ error: 'sin_cliente' }, { status: 404 });
            const p = await stripe('/billing_portal/sessions', new URLSearchParams({
                customer: s.cliente, return_url: `${origen}/fotogramas`,
            }), clave);
            return NextResponse.json({ url: p.url });
        }

        const cuerpo = new URLSearchParams({
            mode: 'subscription',
            'line_items[0][price]': precio,
            'line_items[0][quantity]': '1',
            client_reference_id: u.uid,
            // La suscripción lleva el uid para que los avisos de renovación/baja sepan de quién son.
            'subscription_data[metadata][uid]': u.uid,
            success_url: `${origen}/fotogramas?pro=ok`,
            cancel_url: `${origen}/fotogramas`,
            allow_promotion_codes: 'true',
        });
        if (u.email) cuerpo.set('customer_email', u.email);
        const sesion = await stripe('/checkout/sessions', cuerpo, clave);
        return NextResponse.json({ url: sesion.url });
    } catch (e) {
        console.error('[fotogramas-pago]', e);
        return NextResponse.json({ error: 'stripe' }, { status: 502 });
    }
}
