// Comprobación de la firma de los avisos (webhooks) de Stripe, sin librería.
//
// Stripe manda la cabecera `Stripe-Signature: t=<segundos>,v1=<hmac>` donde el
// hmac es HMAC-SHA256 de `${t}.${cuerpo}` con el secreto del webhook. Sin esta
// comprobación cualquiera podría llamar a la ruta y regalarse el plan Pro.

import { createHmac, timingSafeEqual } from 'node:crypto';

export function firmaStripeValida(cuerpo: string, cabecera: string | null, secreto: string, ahora = Date.now(), toleranciaS = 300): boolean {
    if (!cabecera || !secreto) return false;
    const partes = cabecera.split(',').map(s => s.trim().split('='));
    const t = partes.find(([k]) => k === 't')?.[1];
    const firmas = partes.filter(([k]) => k === 'v1').map(([, v]) => v);
    if (!t || !/^\d+$/.test(t) || firmas.length === 0) return false;
    if (Math.abs(ahora / 1000 - Number(t)) > toleranciaS) return false;

    const esperada = createHmac('sha256', secreto).update(`${t}.${cuerpo}`).digest();
    return firmas.some(f => {
        if (!/^[0-9a-f]{64}$/.test(f)) return false;
        return timingSafeEqual(esperada, Buffer.from(f, 'hex'));
    });
}
