'use server';

import { ai } from './genkit';
import { DailyReadingInput, DailyReadingOutput, DailyReadingOutputSchema } from './schemas';

export async function generateDailyReading(input: DailyReadingInput): Promise<DailyReadingOutput> {
    const { birthData, aspects, userName } = input;

    const systemPrompt = `
    You are a Mystical Alchemist and Astrologer. 
    Your task is to interpret the daily planetary transits for a specific individual based on their natal chart interactions.
    
    TONE & STYLE:
    - Mystical, deep, slightly cryptic but empowering.
    - Use Alchemical metaphors (transmutation, calcination, gold, lead).
    - Speak directly to the user ("Tú").
    - Avoid generic horoscope clichés. Focus on the *energy* and *psychological/spiritual* impact.
    - Language: SPANISH (Español).

    INPUT DATA:
    - User: ${userName || 'The Alchemist'}
    - Birth Date: ${birthData.date}
    - City: ${birthData.city || 'Unknown'}
    - Key Transits (Aspects): List of how current planets interact with natal planets.

    INSTRUCTIONS:
    1. Analyze the provided aspects. Look for the strongest themes (e.g., Pluto = Transformation, Saturn = Restriction/Structure, Jupiter = Expansion).
    2. Synthesize these aspects into a coherent narrative. Don't just list them. Weave them together.
    3. If there are conflicting aspects (e.g., Saturn restricting while Jupiter expands), explain the tension.
    4. Create a "Headline" that captures the essence.
    5. Provide a "Theme" (2-3 words).
    6. Write the "Reading" (paragraph).
    7. Give a short "Advice".
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
