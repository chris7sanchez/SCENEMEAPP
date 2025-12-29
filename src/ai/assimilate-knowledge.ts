'use server';

import { ai } from './genkit';
import { AssimilateKnowledgeInputSchema, AssimilateKnowledgeOutputSchema } from './knowledge-schema';
import { z } from 'genkit';

type AssimilateKnowledgeInput = z.infer<typeof AssimilateKnowledgeInputSchema>;

export async function assimilateKnowledge(input: AssimilateKnowledgeInput) {
    const { content } = input;

    const systemPrompt = `
    ROLE: Senior Astrological Data Analyst & Systematizer.
    TASK: Convert raw text inputs (PDFs, notes) into structured, high-logic database entries.
    LANGUAGE: ALWAYS OUTPUT IN SPANISH. TRANSLATE IF SOURCE IS ENGLISH.
    
    USER REQUIREMENT: "The info must be concrete, concise, easy to assimilate, and logical."
    
    INSTRUCTIONS:
    1. READ the text analytically. Ignore fluff. Search for HARD DATA (rules, correspondences, definitions).
    2. CATEGORIZE ruthlessly.
       - BAD: Category="About Aries", Value="It is energetic"
       - GOOD: Category="Archetype Keyword", Value="Warrior", Description="Represents raw initialization energy."
    3. TARGET MAPPING:
       - Assign every piece of data to a specific Node (e.g., 'Aries', 'Sun', 'House 1', 'Mercury').
    4. OUTPUT FORMATTING:
       - Value: Short, punchy strings (1-5 words).
       - Description: One clear sentence explaining the 'Why' or 'How'. No poetry.
    5. SUMMARY:
       - Provide a summary that reads like a changelog or executive brief. "Extracted 5 key traits for Scorpio and updated Venus mapping."
    `;

    const userPrompt = `
    NEW KNOWLEDGE FRAGMENT:
    """
    ${content.substring(0, 20000)}
    """
    
    EXTRACT DATA NOW. FOCUS ON LOGIC AND CLARITY.
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
        console.error("Knowledge Assimilation Error (AI Failed):", error);
        console.log("Engaging Deterministic Fallback Protocols...");

        // DETERMINISTIC FALLBACK (For PDF Tables/Raw Text)
        return fallbackDeterministicAssimilation(content);
    }
}

function fallbackDeterministicAssimilation(text: string) {
    const knowledge: any[] = [];

    // 1. Split by lines
    const lines = text.split('\n');
    let currentTarget = "General";

    // 2. Simple Heuristic Parser for Tables/Lists
    lines.forEach(line => {
        const clean = line.trim();
        if (!clean) return;

        // Detect Sign Headings (Aries, Tauro, etc)
        const signMatch = clean.match(/^(Aries|Tauro|Taurus|Géminis|Gemini|Cáncer|Cancer|Leo|Virgo|Libra|Escorpio|Scorpio|Sagitario|Sagittarius|Capricornio|Capricorn|Acuario|Aquarius|Piscis|Pisces)/i);
        if (signMatch && clean.length < 50) {
            currentTarget = signMatch[1];
            return;
        }

        // Detect Table Row (Separator | )
        if (clean.includes('|')) {
            const parts = clean.split('|').map(s => s.trim());
            if (parts.length >= 2) {
                knowledge.push({
                    target: parts[0] || currentTarget,
                    category: "General Attributes",
                    value: parts[1],
                    description: parts.slice(2).join(' ') || "Extracted from table"
                });
            }
        }
        // Detect Colon Key: Value
        else if (clean.includes(':')) {
            const [key, val] = clean.split(':').map(s => s.trim());
            if (key && val) {
                knowledge.push({
                    target: currentTarget,
                    category: key,
                    value: val,
                    description: "Manual entry extraction"
                });
            }
        }
    });

    // If no structure found, just dump huge chunks? No, better to return nothing than garbage.
    // Allow at least one entry if list is empty
    if (knowledge.length === 0) {
        knowledge.push({
            target: "General",
            category: "Unstructured Notes",
            value: "Raw Text Segment",
            description: text.substring(0, 100) + "..."
        });
    }

    return {
        summary: "Conocimiento asimilado mediante Algoritmo Determinista (AI Bypass). Se ha extraído la estructura base.",
        knowledge: knowledge.slice(0, 50) // Limit to 50 items to be safe
    };
}
