import { z } from 'genkit';

export const AssimilateKnowledgeInputSchema = z.object({
    content: z.string().describe('The text content to analyze and assimilate.'),
});

export const AssimilateKnowledgeOutputSchema = z.object({
    summary: z.string().describe('A brief summary of what was learned.'),
    knowledge: z.array(z.object({
        target: z.string().describe('The astrological entity this applies to (e.g., "Aries", "Venus", "Fire").'),
        category: z.string().describe('The category of this new knowledge (e.g., "Aromas", "Crystals", "Power Animals").'),
        value: z.string().describe('The specific item or concept (e.g., "Black Pepper", "Ruby").'),
        description: z.string().describe('Context or explanation of why this fits.'),
    })).describe('Structured knowledge extracted from the text.'),
});
