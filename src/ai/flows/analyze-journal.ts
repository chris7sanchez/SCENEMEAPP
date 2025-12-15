'use server';

import { AnalyzeJournalInputSchema, AnalyzeJournalOutputSchema } from './journal-schema';
import { z } from 'genkit';

type AnalyzeJournalInput = z.infer<typeof AnalyzeJournalInputSchema>;

export async function analyzeJournalEntry(input: AnalyzeJournalInput) {
    const { ai } = await import('@/ai/genkit');
    const { entry, transits, userProfile } = input;

    const transitsContext = transits.map(t => `- ${t.planet1} ${t.type} ${t.planet2}`).join('\n');

    const systemPrompt = `
    You are an Alchemical Guide and Astrological Psychologist.
    The user has written a journal entry about their current feelings.
    Your task is to correlate their subjective experience with the objective astrological weather (Transits).

    USER PROFILE:
    - Sun: ${userProfile.sun}
    - Moon: ${userProfile.moon}
    - Ascendant: ${userProfile.ascendant}

    ACTIVE TRANSITS (The Weather):
    ${transitsContext}

    INSTRUCTIONS:
    1. Analyze the "Sentiment" of the text.
    2. Look for matches in the "Active Transits". 
       - Example: If they feel blocked or tired, look for Saturn.
       - Example: If they feel angry or driven, look for Mars.
       - Example: If they feel dreamy or confused, look for Neptune.
       - Example: If they feel expansive or lucky, look for Jupiter.
    3. If no obvious transit matches, look at the Moon sign's current mood (implied).
    4. Provide "Alchemical Advice": How can they turn this lead (heavy feeling) into gold (wisdom/action)?
    5. Determine the "Elemental Shift" needed.
    `;

    const userPrompt = `
    JOURNAL ENTRY:
    "${entry}"

    Analyze this entry.
    `;

    try {
        const { output } = await ai.generate({
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: AnalyzeJournalOutputSchema }
        });

        if (!output) {
            throw new Error('No output generated');
        }

        return output;
    } catch (error) {
        console.error("Journal Analysis Error:", error);
        throw error;
    }
}
