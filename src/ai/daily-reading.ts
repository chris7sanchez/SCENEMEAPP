'use server';

import { ai } from './genkit';
import { DailyReadingInput, DailyReadingOutput, DailyReadingOutputSchema } from './schemas';

import { ANTIGRAVITY_SYSTEM_PROMPT } from './system-prompt';

export async function generateDailyReading(input: DailyReadingInput): Promise<DailyReadingOutput> {
    const { birthData, aspects, userName } = input;

    const systemPrompt = `
    ${ANTIGRAVITY_SYSTEM_PROMPT}

    TAREA ESPECÍFICA (LECTURA DIARIA):
    Interpreta los tránsitos planetarios actuales para este individuo.
    
    INSTRUCCIONES ADICIONALES:
    1. Analiza los aspectos proporcionados. Busca los temas más fuertes (ej. Plutón=Transformación, Saturno=Restricción).
    2. Sintetiza estos aspectos en una narrativa coherente. No hagas una lista. TÉJELOS.
    3. Si hay aspectos contradictorios, explica la tensión psicológica.
    4. Crea un "Titular" que capture la esencia alquímica del día.
    5. Proporciona un "Tema" (2-3 palabras).
    6. Escribe la "Lectura" (párrafo profundo, usando el Marco Teórico del Héroe).
    7. Da un "Consejo" práctico basado en el Nodo Norte o el tránsito principal.

    DATOS DE ENTRADA:
    - Usuario: ${userName || 'El Alquimista'}
    - Fecha Nacimiento: ${birthData.date}
    - Ciudad: ${birthData.city || 'Desconocida'}
    `;

    const userPrompt = `
    CURRENT TRANSITS (ASPECTS):
    ${JSON.stringify(aspects, null, 2)}
    
    Please generate the Daily Alchemical Reading.
    `;

    try {
        const { output } = await ai.generate({
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: DailyReadingOutputSchema }
        });

        if (!output) {
            throw new Error('No output generated from AI model.');
        }

        return output;
    } catch (error) {
        console.error("AI Daily Reading Error:", error);
        return {
            headline: "El Silencio de las Estrellas",
            theme: "Introspección",
            reading: "Las estrellas parecen guardar silencio hoy, o quizás la niebla impide ver con claridad. Es un buen momento para mirar hacia adentro sin buscar señales externas.",
            advice: "Medita en el silencio."
        };
    }
}
