'use server';

import { GenerateDialogueInputSchema, GenerateDialogueOutputSchema } from './dialogue-schema';
import { z } from 'genkit';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';

type GenerateDialogueInput = z.infer<typeof GenerateDialogueInputSchema>;

export async function generateDialogue(input: GenerateDialogueInput) {
    const { ai } = await import('@/ai/genkit');
    const { characterName, astrologicalProfile, psychologicalState, userPrompt, chatHistory } = input;

    // Serialize Context
    const archetypeContext = Object.entries(ZODIAC_ARCHETYPES).map(([sign, data]) => {
        return `- ${sign}: Keywords(${data.keywords.join(', ')})`;
    }).join('\n');

    const historyText = chatHistory?.map(msg =>
        `${msg.role === 'user' ? 'User' : characterName}: ${msg.content}`
    ).join('\n') || "No previous history.";

    const systemPrompt = `
    You are a Method Acting Coach & Astrological Simulator.
    You are roleplaying as the character "${characterName}".
    
    YOUR ASTROLOGICAL DNA:
    - SUN (Essence/Ego): ${astrologicalProfile.sun}
    - MOON (Emotional Core/Instincts): ${astrologicalProfile.moon}
    - ASCENDANT (Mask/First Impression): ${astrologicalProfile.ascendant}
    ${astrologicalProfile.mercury ? `- MERCURY (Communication Style): ${astrologicalProfile.mercury}` : ''}
    ${astrologicalProfile.venus ? `- VENUS (Love/Values): ${astrologicalProfile.venus}` : ''}
    ${astrologicalProfile.mars ? `- MARS (Aggression/Drive): ${astrologicalProfile.mars}` : ''}

    YOUR CURRENT PSYCHOLOGY (The Scene Context):
    - Hidden Thoughts (The Unsaid): "${psychologicalState.unsaid || 'N/A'}"
    - Emotional State: "${psychologicalState.emotions || 'N/A'}"
    - Desired Outcome: "${psychologicalState.outcome || 'N/A'}"

    ARCHETYPE REFERENCE:
    ${archetypeContext}

    INSTRUCTIONS:
    1. Respond to the User's prompt strictly in character.
    2. Your "Dialogue" must reflect your Mercury sign (e.g., Mercury in Scorpio is secretive/probing, Mercury in Gemini is chatty/witty).
    3. Your "Internal Monologue" must reflect your Moon sign and the "Unsaid" context.
    4. Your "Action" should reflect your Mars/Ascendant energy.
    5. Do not break character.
    `;

    const prompt = `
    CHAT HISTORY:
    ${historyText}

    USER INPUT:
    "${userPrompt}"

    Generate the next response.
    `;

    try {
        const { output } = await ai.generate({
            system: systemPrompt,
            prompt: prompt,
            output: { schema: GenerateDialogueOutputSchema }
        });

        if (!output) {
            throw new Error('No output generated');
        }

        return output;
    } catch (error) {
        console.error("Dialogue Generation Error:", error);
        throw error;
    }
}
