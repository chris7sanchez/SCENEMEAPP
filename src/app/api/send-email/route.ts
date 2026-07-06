import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resend se inicializa de forma perezosa dentro del handler
// (evita romper el build de producción cuando no hay clave configurada).

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, to, data } = body;

        if (!to) {
            return NextResponse.json({ error: 'Missing recipient email' }, { status: 400 });
        }

        let subject = '';
        let htmlContent = '';

        // --- EMAIL TEMPLATES ---

        if (type === 'script') {
            subject = '🎬 ¡Tu Guion de Scene Me está listo!';
            htmlContent = `
                <h1>¡Hola ${data.name}!</h1>
                <p>La IA de Scene Me ha terminado de cocinar tu guion.</p>
                <p><strong>Título:</strong> ${data.title}</p>
                <p><strong>Premisa:</strong> ${data.logline}</p>
                <hr />
                <h2>Guion:</h2>
                <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${data.scriptContent}</pre>
                <hr />
                <p>¡Nos vemos en el set!</p>
            `;
        }
        else if (type === 'collab_request') {
            subject = `🤝 Nueva Solicitud de Colaboración de ${data.requesterName}`;
            htmlContent = `
                <h1>¡Hola!</h1>
                <p>Tienes una nueva solicitud de colaboración a través de Scene Me.</p>
                <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; border: 1px solid #bae6fd;">
                    <p><strong>De:</strong> ${data.requesterName} (${data.requesterEmail})</p>
                    <p><strong>Para:</strong> ${data.targetName}</p>
                    <p><strong>Mensaje:</strong></p>
                    <p style="font-style: italic;">"${data.message}"</p>
                </div>
                <p>Por favor, revisa la disponibilidad y ponte en contacto con ellos si encajan.</p>
            `;
        }
        else {
            return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        // --- SENDING LOGIC ---

        // Check if API Key is present to avoid crashing in dev without keys
        if (!process.env.RESEND_API_KEY) {
            console.log('⚠️ MOCK EMAIL SENT (No API Key found):');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            return NextResponse.json({ success: true, mock: true });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const dataRes = await resend.emails.send({
            from: 'Scene Me <onboarding@resend.dev>', // Update this with your domain later
            to: [to],
            subject: subject,
            html: htmlContent,
        });

        return NextResponse.json(dataRes);

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
