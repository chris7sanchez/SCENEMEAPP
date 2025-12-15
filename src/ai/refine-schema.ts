import { z } from 'genkit';

export const RefineCharacterInputSchema = z.object({
    name: z.string(),
    currentProfile: z.object({
        sun: z.string(),
        moon: z.string(),
        ascendant: z.string(),
    }),
    deepAnalysis: z.object({
        unsaid: z.string().optional(),
        emotions: z.string().optional(),
        outcome: z.string().optional(),
    }),
});

export const RefineCharacterOutputSchema = z.object({
    verdict: z.string().describe('A synthesized verdict explaining the shift in astrological energy based on the deep analysis.'),
    adjective: z.string().describe('A single powerful adjective (e.g., "Volatile", "Repressed", "Magnetic") characterizing the new state.'),
    suggestedSun: z.string().describe('Refined Sun Sign.'),
    suggestedMoon: z.string().describe('Refined Moon Sign.'),
    suggestedAscendant: z.string().describe('Refined Ascendant Sign.'),
    suggestedPlanets: z.object({
        Mercury: z.string().optional(),
        Venus: z.string().optional(),
        Mars: z.string().optional(),
        Jupiter: z.string().optional(),
        Saturn: z.string().optional(),
        Uranus: z.string().optional(),
        Neptune: z.string().optional(),
        Pluto: z.string().optional(),
    }).describe('Suggested signs for other planets if relevant to the deep analysis.'),
});
