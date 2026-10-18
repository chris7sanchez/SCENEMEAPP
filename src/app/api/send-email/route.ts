import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escaparHtml as e, frenar, textoLimpio, errorPublico } from '@/lib/seguridad';

// Resend se inicializa de forma perezosa dentro del handler
// (evita romper el build de producción cuando no hay clave configurada).
//
// SEGURIDAD (18/10/2026): antes el destinatario `to` lo decidía el navegador y
// el texto entraba tal cual en el HTML, así que cualquiera podía usar esta ruta
// para mandar correos con la firma de Scene Me a quien quisiera. Ahora:
// - el único tipo es la solicitud de colaboración de /talents;
// - va SIEMPRE al email del administrador (variable del servidor);
// - todo lo que escribe el visitante se escapa y se corta de largo;
// - tope de 3 envíos cada 10 minutos por persona.

export async function POST(req: Request) {
    const frenado = frenar(req, 'send-email', 3, 10 * 60_000);
    if (frenado) return frenado;

    try {
        const body = await req.json();
        if (body?.type !== 'collab_request') {
            return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        const data = body?.data || {};
        const requesterName = textoLimpio(data.requesterName, 100);
        const requesterEmail = textoLimpio(data.requesterEmail, 254);
        const targetName = textoLimpio(data.targetName, 100);
        const message = textoLimpio(data.message, 2000);
        if (!message) {
            return NextResponse.json({ error: 'Falta el mensaje' }, { status: 400 });
        }

        const to = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        if (!to) {
            console.warn('⚠️ ADMIN_EMAIL no configurado: no se envía la solicitud de colaboración');
            return NextResponse.json({ success: true, mock: true });
        }

        const subject = `🤝 Nueva Solicitud de Colaboración de ${requesterName || 'un visitante'}`;
        const htmlContent = `
                <h1>¡Hola!</h1>
                <p>Tienes una nueva solicitud de colaboración a través de Scene Me.</p>
                <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; border: 1px solid #bae6fd;">
                    <p><strong>De:</strong> ${e(requesterName)} (${e(requesterEmail)})</p>
                    <p><strong>Para:</strong> ${e(targetName)}</p>
                    <p><strong>Mensaje:</strong></p>
                    <p style="font-style: italic; white-space: pre-wrap;">"${e(message)}"</p>
                </div>
                <p>Por favor, revisa la disponibilidad y ponte en contacto con ellos si encajan.</p>
            `;

        // Check if API Key is present to avoid crashing in dev without keys
        if (!process.env.RESEND_API_KEY) {
            console.log('⚠️ MOCK EMAIL SENT (No API Key found):', subject);
            return NextResponse.json({ success: true, mock: true });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const res = await resend.emails.send({
            from: 'Scene Me <onboarding@resend.dev>', // Update this with your domain later
            to: [to],
            subject,
            html: htmlContent,
        });
        if (res.error) {
            console.error('Resend error:', res.error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 502 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return errorPublico('send-email', error);
    }
}
