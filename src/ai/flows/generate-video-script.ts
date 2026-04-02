'use server';

import { ai } from '@/ai/genkit';

/**
 * SERVICIO PROFESIONAL DE GENERACIÓN (Genkit Native)
 * Restaurado con diagnósticos avanzados para producción.
 */
export async function generateVideoScript(input: any): Promise<{ script?: string, error?: string }> {
    try {
        console.log("[AI Flow] Iniciando generación con Genkit Engine...");

        // 1. Verificación de Seguridad
        if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GEMINI_API_KEY) {
            return { error: "CONFIGURACIÓN: No se detectó ninguna API Key en el servidor (Vercel)." };
        }

        // 2. Generación con Genkit
        const result = await ai.generate({
            prompt: `You are a professional screenwriter. Generate a complete screenplay in ${input.language || 'Spanish'}.
            
            CONTEXT:
            - Genre: ${input.genre}
            - Logline: ${input.logline}
            - Cast: ${input.numActors}
            
            FORMATTING:
            - Professional Courier style (0 spaces for scenery, 35 for characters, 25 for dialogue).
            - NO MARKDOWN. 
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




