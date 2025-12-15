'use server';

import { ai } from './genkit';
import { RefineCharacterInputSchema, RefineCharacterOutputSchema } from './refine-schema';
import { z } from 'genkit';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';

type RefineCharacterInput = z.infer<typeof RefineCharacterInputSchema>;

export async function refineCharacter(input: RefineCharacterInput) {
    const { name, currentProfile, deepAnalysis } = input;

    // Serialize Context
    const archetypeContext = Object.entries(ZODIAC_ARCHETYPES).map(([sign, data]) => {
        return `- ${sign}: Keywords(${data.keywords.join(', ')})`;
    }).join('\n');

    const systemPrompt = `
    You are an Expert Astrological Technician & Psychologist.
    The user has performed a "Deep Analysis" of a character, revealing hidden thoughts (Lo No Dicho), emotional landscapes, and outcomes.
    
    YOUR TASK:
    Re-evaluate the character's Astrological Profile based strictly on this new psychological depth.
    The current profile might be superficial. You must determine if the "True Essence" (Sun), "Emotional Core" (Moon), or "Mask/Path" (Ascendant) changes given the new data.
    
    Also, consider if specific planets (Mercury, Venus, Mars, Pluto, etc.) should be emphasized in specific signs to explain the psychological nuance (e.g., "Violent repressed anger" -> Mars in Scorpio).

    REFERENCE ARCHETYPES:
    ${archetypeContext}

    INSTRUCTIONS:
    1. Analyze the "Unsaid", "Emotions", and "Outcome" inputs.
    2. Assign a "Verdict" summarizing the shift in energy.
    3. Choose a single "Adjective" that captures this new state.
    4. Provide the REFINED signs. If they match the current profile, keep them. If the deep analysis contradicts the surface, CHANGE THEM.
    5. Suggest specific placements for other planets if they are critical to the "Verdict" (e.g., Pluto for obsession, Saturn for restriction).
    `;

    const userPrompt = `
    CHARACTER: ${name}
    
    CURRENT PROFILE:
    - Sun: ${currentProfile.sun}
    - Moon: ${currentProfile.moon}
    - Ascendant: ${currentProfile.ascendant}

    DEEP ANALYSIS INPUTS:
    - Lo No Dicho (The Unsaid/Subtext): "${deepAnalysis.unsaid || 'N/A'}"
    - Mundo Emocional (Emotions): "${deepAnalysis.emotions || 'N/A'}"
    - Desenlace (Outcome): "${deepAnalysis.outcome || 'N/A'}"
    
    Based on this deep psychological data, refine the profile.
    `;

    try {
        const { output } = await ai.generate({
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: RefineCharacterOutputSchema }
        });

        if (!output) {
            throw new Error('No output generated');
        }

        return output;
    } catch (error) {
        console.error("Refine Analysis Error:", error);
        throw error;
    }
}
