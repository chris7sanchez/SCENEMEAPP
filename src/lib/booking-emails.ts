import { Resend } from 'resend';

export interface BookingSummary {
    name: string;
    email: string;
    phone: string;
    service: string;
    dateLabel: string;   // ej: "viernes, 10 de julio de 2026"
    timeLabel: string;   // ej: "16:00 – 17:00"
}

// Envío directo (no vía fetch a la propia API). Nunca lanza: devuelve ok/error.
export async function sendBookingEmail(to: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`⚠️ MOCK EMAIL (sin RESEND_API_KEY) → ${to}: ${subject}`);
        return { ok: true, mock: true };
    }
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const res = await resend.emails.send({
            from: 'Scene Me <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
        });
        if (res.error) { console.error('Resend error:', res.error); return { ok: false }; }
        return { ok: true };
    } catch (err) {
        console.error('Error enviando email:', err);
        return { ok: false };
    }
}

const box = (inner: string) =>
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:12px">${inner}</div>`;

const summaryTable = (b: BookingSummary) => `
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 0;color:#888">Servicio</td><td style="padding:6px 0"><strong>${b.service}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#888">Fecha</td><td style="padding:6px 0"><strong>${b.dateLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#888">Hora</td><td style="padding:6px 0"><strong>${b.timeLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#888">Nombre</td><td style="padding:6px 0">${b.name}</td></tr>
        <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0">${b.email}</td></tr>
        <tr><td style="padding:6px 0;color:#888">Teléfono</td><td style="padding:6px 0">${b.phone}</td></tr>
    </table>`;

export function adminNewBookingEmail(b: BookingSummary, acceptUrl: string, rejectUrl: string) {
    return {
        subject: `🎬 Nuevo pedido de reserva: ${b.service} — ${b.dateLabel} ${b.timeLabel}`,
        html: box(`
            <h2 style="margin-top:0">Nuevo pedido de reserva</h2>
            <p>Ha llegado una solicitud desde Scene Me. Ya aparece como <strong>⏳ PENDIENTE</strong> en tu calendario (no bloquea la fecha).</p>
            ${summaryTable(b)}
            <div style="margin:24px 0;text-align:center">
                <a href="${acceptUrl}" style="background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-right:12px">✅ ACEPTAR</a>
                <a href="${rejectUrl}" style="background:#dc2626;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">✖ RECHAZAR</a>
            </div>
            <p style="color:#888;font-size:12px">Al aceptar, la fecha queda bloqueada en tu calendario y el cliente recibe la confirmación.</p>
        `),
    };
}

export function clientReceivedEmail(b: BookingSummary) {
    return {
        subject: '🎬 Hemos recibido tu solicitud de reserva — Scene Me',
        html: box(`
            <h2 style="margin-top:0">¡Solicitud recibida, ${b.name}!</h2>
            <p>Tu petición está <strong>pendiente de confirmación</strong>. Te avisaremos en cuanto quede confirmada.</p>
            ${summaryTable(b)}
        `),
    };
}

export function clientConfirmedEmail(b: BookingSummary) {
    return {
        subject: '✅ Reserva confirmada — Scene Me',
        html: box(`
            <h2 style="margin-top:0">¡Reserva confirmada, ${b.name}!</h2>
            <p>Tu sesión queda reservada. ¡Nos vemos!</p>
            ${summaryTable(b)}
        `),
    };
}

export function clientRejectedEmail(b: BookingSummary) {
    return {
        subject: 'Sobre tu solicitud de reserva — Scene Me',
        html: box(`
            <h2 style="margin-top:0">Hola, ${b.name}</h2>
            <p>No podemos atender tu reserva en esa fecha y hora. Elige otro hueco en la web cuando quieras; disculpa las molestias.</p>
            ${summaryTable(b)}
        `),
    };
}
