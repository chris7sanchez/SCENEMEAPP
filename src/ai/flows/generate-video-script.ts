'use server';

import { getAI } from '@/ai/genkit';

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
 * SERVICIO PROFESIONAL DE GENERACIÓN (Genkit Native)
 * Restaurado con diagnósticos avanzados para producción.
 */
export async function generateVideoScript(input: ScriptInput): Promise<{ script?: string, error?: string }> {
    try {
        console.log("[AI Flow] Iniciando generación con Genkit Engine...");

        // 1. Verificación de Seguridad
        if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GEMINI_API_KEY) {
            return { error: "CONFIGURACIÓN: No se detectó ninguna API Key en el servidor (Vercel)." };
        }

        // 2. Obtener instancia de AI de forma segura
        const ai = getAI();

        // 3. Generación con Genkit
        const result = await ai.generate({
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
            return { error: "La IA respondió pero no generó texto. Comprueba que el logline no viole políticas de seguridad." };
        }

        return { script };

    } catch (e: any) {
        console.error("[AI Flow] Error Crítico:", e);

        // Devolvemos el error detallado para localizar el fallo (Cuota, API Key, o Red)
        return {
            error: `Fallo de Engine AI: ${e.message || "Error desconocido en el servidor de Genkit."}`
        };
    }
}




