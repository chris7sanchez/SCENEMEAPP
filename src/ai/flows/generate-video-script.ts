'use server';

import { ai } from '@/ai/genkit';
import { GenerateVideoScriptInput, GenerateVideoScriptOutput } from '@/ai/schemas';

/**
 * Server Action to generate a video script.
 */
export async function generateVideoScript(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_GENAI_API_KEY is not set");
    }

    // DEBUG: List available models
    try {
        const modelsParams = new URLSearchParams({ key: apiKey });
        const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?${modelsParams}`);
        const modelsData = await modelsResponse.json();
        console.log("AVAILABLE MODELS:", JSON.stringify(modelsData, null, 2));
    } catch (e) {
        console.error("Error listing models:", e);
    }

    const promptText = `You are a professional screenwriter. Generate a video script based on the following detailed brief:

CORE ELEMENTS:
- Primary Genre: ${input.genre}
- Secondary Genre (Mix): ${input.secondaryGenre || '-'}
- Cast: ${input.numActors} actor(s) (${input.genderActors})
- Location: ${input.locationPreference || 'Any'}
- Tone: ${input.tones.join(', ')}
- Length: ${input.length}
- Key Props: ${input.props}
- Logline/Premise: ${input.logline}

REQUIRED ENDING STYLE:
- ${input.endingType}

LANGUAGE:
- The script MUST be written entirely in ${input.language || 'Spanish'}.

SCRIPT STRUCTURE & FORMATTING (STRICT PROFESSIONAL LAYOUT):
The output must be formatted exactly like a screenplay page (Courier font standard).
Assume a page width of roughly 60-80 characters.

1) SCENE HEADING (INT/EXT...) -> Left Aligned (0 spaces).
2) ACTION -> Left Aligned (0 spaces).
3) CHARACTER NAMES -> Indented 37 spaces (Center).
4) DIALOGUE -> Indented 25 spaces (Center block).
5) PARENTHETICALS -> Indented 31 spaces.
6) TRANSITIONS -> Indented 60 spaces (Right).

IMPORTANT:
- Do NOT use Markdown.
- USE ONLY SPACES for indentation.
- Ensure the visual layout looks centered for dialogue and characters.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: promptText }]
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const script = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!script) {
        throw new Error('Failed to generate script: No output from API');
    }

    // --- EMAIL NOTIFICATION ---
    if (input.userEmail) {
        try {
            const { Resend } = await import('resend');
            const resendApiKey = process.env.RESEND_API_KEY;

            if (resendApiKey) {
                const resend = new Resend(resendApiKey);
                await resend.emails.send({
                    from: 'Scene Me <onboarding@resend.dev>',
                    to: [input.userEmail],
                    subject: '🎬 ¡Tu Guion de Scene Me está listo!',
                    html: `
                        <h1>¡Hola ${input.userName || 'Actor'}!</h1>
                        <p>La IA de Scene Me ha terminado de cocinar tu guion.</p>
                        <p><strong>Título:</strong> Escena ${input.genre}</p>
                        <p><strong>Premisa:</strong> ${input.logline}</p>
                        <hr />
                        <h2>Guion:</h2>
                        <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${script}</pre>
                        <hr />
                        <p>¡Nos vemos en el set!</p>
                    `
                });
                console.log(`Script email sent to ${input.userEmail}`);
            } else {
                console.log('Skipping email: No RESEND_API_KEY found');
            }
        } catch (emailError) {
            console.error('Failed to send script email:', emailError);
            // We don't throw here to ensure the user still gets the script in the UI
        }
    }

    return { script };
}
