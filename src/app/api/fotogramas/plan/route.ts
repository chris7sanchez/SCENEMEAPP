import { NextResponse } from 'next/server';
import { usuarioDe } from '@/lib/firebase-admin';
import { planDe, suscripcionDe } from '@/lib/suscripcion';

// GET /api/fotogramas/plan → { plan, hasta?, estado?, cobroListo }
// cobroListo avisa a la pantalla de si Stripe está configurado (si no, el botón
// «Hazte Pro» no promete algo que todavía no funciona).
export async function GET(req: Request) {
    const u = await usuarioDe(req);
    const plan = await planDe(u);
    const s = u ? await suscripcionDe(u.uid) : undefined;
    return NextResponse.json({
        plan,
        estado: s?.estado,
        hasta: s?.hasta,
        cobroListo: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID && process.env.STRIPE_WEBHOOK_SECRET),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
}
