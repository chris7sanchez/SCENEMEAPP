'use server';

import { genkit } from 'genkit';
import { googleAI, gemini20Flash } from '@genkit-ai/googleai';

export interface ScriptInput {
    language?: string;
    genre?: string;
    secondaryGenre?: string;
    logline?: string;
    numActors?: string | number;
    genderActors?: string;
    locationPreference?: string;
    length?: string;
    props?: string;
    endingType?: string;
    tones?: string[];
}

/**
 * SERVICIO DE GENERACIÓN DE GUIONES (Genkit AI)
 * Genera guiones escritos profesionales para actores.
 */
export async function generateScript(input: ScriptInput): Promise<{ script?: string, error?: string }> {
    try {
        console.log("[AI Flow] Iniciando generación de guion directo...");
        
        const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { error: "Falta la API Key de Gemini en el servidor." };
        }

        const ai = genkit({
            plugins: [googleAI({ apiKey })]
        });

        const result = await ai.generate({
            model: gemini20Flash,
            prompt: `You are a professional screenwriter. Generate a complete screenplay in ${input.language || 'Spanish'}.
            
            CONTEXT:
            - Genre: ${input.genre} ${input.secondaryGenre ? ` / ${input.secondaryGenre}` : ''}
            - Logline: ${input.logline}
            - Cast: ${input.numActors} actors (${input.genderActors || 'Any'})
            - Location: ${input.locationPreference || 'Any'}
            - Estimated Length: ${input.length || '30 seconds'}
            - Props to include: ${input.props || 'None specific'}
            - Ending Type: ${input.endingType || 'Surprise me'}
            - Specific Tones: ${(input.tones || []).join(', ')}
            
            FORMATTING:
            - Professional Courier style (0 spaces for scenery, 35 for characters, 25 for dialogue).
            - NO MARKDOWN in the final text.
            - USE SPACES for indenting.`,
            config: {
                temperature: 0.9,
            }
        });

        const script = result.text;

        if (!script) {
            return { error: "La IA respondió pero no generó texto." };
        }

        return { script };

    } catch (e: any) {
        console.error("[AI Flow] Error Crítico:", e);
        return {
            error: `Fallo de Engine AI: ${e.message || "Error desconocido."}`
        };
    }
}

// Alias de compatibilidad — evita romper imports existentes durante la transición
export { generateScript as generateVideoScript };
