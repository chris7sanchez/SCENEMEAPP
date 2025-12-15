'use server';

import { ai } from '@/ai/genkit';
import { AssimilateKnowledgeInputSchema, AssimilateKnowledgeOutputSchema } from './knowledge-schema';
import { z } from 'genkit';

type AssimilateKnowledgeInput = z.infer<typeof AssimilateKnowledgeInputSchema>;

export async function assimilateKnowledge(input: AssimilateKnowledgeInput) {
    const { content } = input;

    const systemPrompt = `
    You are an Ancient Librarian of the Akashic Records.
    Your task is to read new esoteric texts provided by the user and ASSIMILATE them into structured astrological knowledge.
    
    The user wants to UPDATE the database used for detecting and determining character signs.
    
    OUTPUT:
    - Extract distinct pieces of lore, rules, or psychological traits.
    - Map them to the correct Target (Aries, Taurus, Sun, Moon, etc.).
    - Category examples: "Detection Rule", "Psychological Trait", "Myth", "Crystal", "Aroma".
    - If the text contains specific instructions on how to identify a sign (e.g., "Aries people always walk fast"), categorize it as "Detection Rule".
    - Provide a short summary of the input document.
    `;

    const userPrompt = `
    NEW KNOWLEDGE FRAGMENT:
    ${content.substring(0, 20000)}
    """
    
    Extract and structure this wisdom.
    `;

    try {
        const { output } = await ai.generate({
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: AssimilateKnowledgeOutputSchema }
        });

        if (!output) throw new Error('Assimilation failed.');

        return output;
    } catch (error) {
        console.error("Knowledge Assimilation Error:", error);
        throw error;
    }
}
