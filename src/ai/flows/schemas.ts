import { z } from 'genkit';

export const GenerateVideoScriptInputSchema = z.object({
    genre: z.string().describe('The primary genre of the video.'),
    secondaryGenre: z.string().optional().describe('The secondary optional genre.'),
    numActors: z.string().describe('Number of actors.'),
    genderActors: z.string().describe('Gender of actors.'),
    tones: z.array(z.string()).describe('The tones of the video.'),
    locationPreference: z.string().optional().describe('Specific location preference.'),
    length: z.string().describe('The length of the video in seconds.'),
    logline: z.string().describe('The logline of the video.'),
    props: z.string().describe('The props used in the video.'),
    endingType: z.string().describe('The type of ending required.'),
    language: z.string().optional().describe('The language of the script (Spanish or English).'),
    userEmail: z.string().optional().describe('Email to send the script to.'),
    userName: z.string().optional().describe('Name of the user.'),
});

export type GenerateVideoScriptInput = z.infer<typeof GenerateVideoScriptInputSchema>;

export const GenerateVideoScriptOutputSchema = z.object({
    script: z.string().describe('The generated video script.'),
});

export type GenerateVideoScriptOutput = z.infer<typeof GenerateVideoScriptOutputSchema>;

export const AnalyzeCharacterInputSchema = z.object({
    scriptSegment: z.string().describe('The segment of the script or dialogue to analyze.'),
    characterName: z.string().describe('The name of the character to analyze within the text.'),
    customKnowledge: z.array(z.object({
        target: z.string(),
        category: z.string(),
        value: z.string(),
        description: z.string()
    })).optional().describe('Custom assimilated knowledge to refine the analysis.'),
});

export type AnalyzeCharacterInput = z.infer<typeof AnalyzeCharacterInputSchema>;

export const AnalyzeCharacterOutputSchema = z.object({
    sunSign: z.string().describe('The estimated Sun Sign (e.g., Aries, Taurus).'),
    moonSign: z.string().describe('The estimated Moon Sign based on emotional depth.'),
    ascendant: z.string().describe('The estimated Ascendant Sign based on outward behavior.'),
    elements: z.object({
        fire: z.number().describe('Percentage of Fire element (0-100).'),
        earth: z.number().describe('Percentage of Earth element (0-100).'),
        air: z.number().describe('Percentage of Air element (0-100).'),
        water: z.number().describe('Percentage of Water element (0-100).'),
    }),
    archetype: z.string().describe('The Jungian or literary archetype of the character.'),
    analysis: z.string().describe('A brief explanation of why these astrological placements fit the character.'),
    threePillars: z.object({
        sunReasoning: z.string().describe('Answer to: ¿Cómo soy en esencia? (Derived from key identity/drive)'),
        moonReasoning: z.string().describe('Answer to: ¿Cómo siento y cómo son mis emociones? (Derived from inner world)'),
        ascendantReasoning: z.string().describe('Answer to: ¿Cómo me modifica la vida? (Derived from obstacles/others view)'),
    }).describe('The detailed reasoning for the Big Three placements based on specific psychological questions.'),
});

export type AnalyzeCharacterOutput = z.infer<typeof AnalyzeCharacterOutputSchema>;
