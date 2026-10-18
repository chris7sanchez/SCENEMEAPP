import { NextRequest, NextResponse } from 'next/server';
import { usuarioDe, esAdmin } from '@/lib/firebase-admin';
import { frenar, errorPublico } from '@/lib/seguridad';

export const runtime = 'nodejs';
export const maxDuration = 60;

// SEGURIDAD (18/10/2026): sólo la llama el panel de administración, así que
// sólo la puede usar el admin (antes cualquiera gastaba la cuota de Gemini).

const corto = (v: unknown, max = 500) => (v == null ? v : String(v).slice(0, max));

export async function POST(req: NextRequest) {
    const frenado = frenar(req, 'generate-script', 10);
    if (frenado) return frenado;
    if (!esAdmin(await usuarioDe(req))) {
        return NextResponse.json({ error: 'Sólo el administrador puede generar guiones aquí. Vuelve a entrar en el panel.' }, { status: 401 });
    }
    try {
        const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'CONFIGURACIÓN: No se encontró GOOGLE_GENAI_API_KEY en las variables de entorno de Vercel.' },
                { status: 500 }
            );
        }

        const bruto = await req.json();
        const input = {
            ...bruto,
            genre: corto(bruto?.genre, 80), secondaryGenre: corto(bruto?.secondaryGenre, 80),
            numActors: corto(bruto?.numActors, 10), genderActors: corto(bruto?.genderActors, 300),
            tones: Array.isArray(bruto?.tones) ? bruto.tones.slice(0, 10).map((t: unknown) => corto(t, 60)) : corto(bruto?.tones, 300),
            locationPreference: corto(bruto?.locationPreference, 200), length: corto(bruto?.length, 80),
            logline: corto(bruto?.logline, 3000), props: corto(bruto?.props, 500),
            endingType: corto(bruto?.endingType, 200), language: corto(bruto?.language, 40),
        };
        const {
            genre, secondaryGenre, numActors, genderActors,
            tones, locationPreference, length, logline,
            props, endingType, language
        } = input;

        const promptText = `You are a professional screenwriter. Generate a video script based on the following detailed brief:

CORE ELEMENTS:
- Primary Genre: ${genre}
- Secondary Genre (Mix): ${secondaryGenre || '-'}
- Cast: ${numActors} actor(s) (${genderActors})
- Location: ${locationPreference || 'Any'}
- Tone: ${Array.isArray(tones) ? tones.join(', ') : tones}
- Length: ${length}
- Key Props: ${props}
- Logline/Premise: ${logline}

REQUIRED ENDING STYLE:
- ${endingType}

LANGUAGE:
- The script MUST be written entirely in ${language || 'Spanish'}.

SCRIPT STRUCTURE & FORMATTING (STRICT PROFESSIONAL LAYOUT):
1) SCENE HEADING (INT/EXT...) -> Left Aligned (0 spaces).
2) ACTION -> Left Aligned (0 spaces).
3) CHARACTER NAMES -> Indented 37 spaces (Center).
4) DIALOGUE -> Indented 25 spaces (Center block).
5) PARENTHETICALS -> Indented 31 spaces.
6) TRANSITIONS -> Indented 60 spaces (Right).

IMPORTANT:
- Do NOT use Markdown.
- USE ONLY SPACES for indentation.

Generate the complete script now.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: {
                        temperature: 0.9,
                        maxOutputTokens: 8192,
                    }
                })
            }
        );

        if (!response.ok) {
            const errBody = await response.text();
            console.error('[generate-script] Gemini API error:', response.status, errBody);

            if (response.status === 429) {
                return NextResponse.json(
                    { error: 'Has superado la cuota de la API Key de Gemini. Añade una tarjeta de crédito en Google AI Studio o usa una API Key nueva.' },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                { error: `Error de la API de Gemini (${response.status}). Inténtalo de nuevo en un momento.` },
                { status: 500 }
            );
        }

        const data = await response.json();
        const script = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!script) {
            return NextResponse.json(
                { error: 'Gemini respondió pero no generó texto. Revisa el logline.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ script });

    } catch (e) {
        return errorPublico('generate-script', e);
    }
}
