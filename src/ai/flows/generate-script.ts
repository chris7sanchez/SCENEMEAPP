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
 * SERVICIO DE GENERACIÓN DE GUIONES (Antigravity AI Engine)
 * Genera guiones escritos profesionales para actores.
 * Optimizado para usar Vertex AI si está configurado (evita errores 429).
 */
export async function generateScript(input: ScriptInput): Promise<{ script?: string, error?: string }> {
    try {
        console.log("[AI Flow] Iniciando generación de guion con Engine centralizado...");
        
        const ai = getAI();

        const result = await ai.generate({
            // El modelo se hereda del Engine (Vertex AI Flash o Gemini Studio 2.0 Flash)
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
