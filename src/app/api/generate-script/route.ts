import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'CONFIGURACIÓN: No se encontró GOOGLE_GENAI_API_KEY en las variables de entorno de Vercel.' },
                { status: 500 }
            );
        }

        const input = await req.json();
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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                { error: `Error de la API de Gemini: ${response.status}. ${errBody}` },
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

    } catch (e: any) {
        console.error('[generate-script] Error crítico:', e);
        return NextResponse.json(
            { error: `Error interno del servidor: ${e.message}` },
            { status: 500 }
        );
    }
}
