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
 * SERVICIO DE GENERACIÓN DE GUIONES (Genkit AI)
 * Genera guiones escritos profesionales para actores.
 */
export async function generateScript(input: ScriptInput): Promise<{ script?: string, error?: string }> {
    try {
        console.log("[AI Flow] Iniciando generación de guion con Genkit Engine...");
        
        // Obtenemos el motor de forma segura
        const ai = getAI();

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
        return {
            error: e.message.includes("ERROR_CONFIG") 
                ? "Fallo de Configuración: Falta la API Key en el servidor (Vercel)." 
                : `Error del servidor de Genkit: ${e.message}`
        };
    }
}

// Alias de compatibilidad — evita romper imports existentes durante la transición
export { generateScript as generateVideoScript };
