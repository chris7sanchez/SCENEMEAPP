'use server';

import { GenerateVideoScriptInput, GenerateVideoScriptOutput } from '@/ai/schemas';

/**
 * Server Action to generate a video script using direct Gemini API.
 */
export async function generateVideoScript(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
        console.error("[GenerateVideoScript] API Key not found");
        throw new Error("GOOGLE_GENAI_API_KEY no está configurada en el servidor");
    }

    const {
        genre,
        secondaryGenre,
        numActors,
        genderActors,
        tones,
        locationPreference,
        length,
        logline,
        props,
        endingType,
        language
    } = input;

    try {
        console.log("[GenerateVideoScript] Starting generation for:", logline.substring(0, 50));

        const promptText = `You are a professional screenwriter. Generate a video script based on the following detailed brief:

CORE ELEMENTS:
- Primary Genre: ${genre}
- Secondary Genre (Mix): ${secondaryGenre || '-'}
- Cast: ${numActors} actor(s) (${genderActors})
- Location: ${locationPreference || 'Any'}
- Tone: ${tones.join(', ')}
- Length: ${length}
- Key Props: ${props}
- Logline/Premise: ${logline}

REQUIRED ENDING STYLE:
- ${endingType}

LANGUAGE:
- The script MUST be written entirely in ${language || 'Spanish'}.

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
- Ensure the visual layout looks centered for dialogue and characters.

Generate the complete script now.`;

        // Use Gemini Flash Latest (stable alias with available quota)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: promptText }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        maxOutputTokens: 8192,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("[GenerateVideoScript] API Error:", errorData);
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const script = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!script) {
            console.error("[GenerateVideoScript] No script in response:", data);
            throw new Error('La IA no devolvió ningún guion. Intenta con un logline más detallado.');
        }

        console.log("[GenerateVideoScript] Script generated successfully, length:", script.length);

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
                            <p><strong>Título:</strong> Escena ${genre}</p>
                            <p><strong>Premisa:</strong> ${logline}</p>
                            <hr />
                            <h2>Guion:</h2>
                            <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${script}</pre>
                            <hr />
                            <p>¡Nos vemos en el set!</p>
                        `
                    });
                    console.log(`[GenerateVideoScript] Email sent to ${input.userEmail}`);
                }
            } catch (emailError) {
                console.error('[GenerateVideoScript] Email failed:', emailError);
                // We don't throw here to ensure the user still gets the script in the UI
            }
        }

        return { script };

    } catch (error) {
        console.error("Error generating script:", error);
        throw error;
    }
}
