import { z } from 'genkit';

export const AnalyzeJournalInputSchema = z.object({
    entry: z.string(),
    transits: z.array(z.object({
        planet1: z.string(), // Transit
        planet2: z.string(), // Natal
        type: z.string(),
        description: z.string().optional()
    })),
    userProfile: z.object({
        sun: z.string(),
        moon: z.string(),
        ascendant: z.string(),
    })
});

export const AnalyzeJournalOutputSchema = z.object({
    sentiment: z.string().describe("Overall emotional tone of the entry (e.g., Frustrated, Inspired, Melancholic)."),
    correlatedAspects: z.array(z.object({
        aspect: z.string().describe("The specific transit responsible (e.g., 'Mars Square Saturn')."),
        explanation: z.string().describe("Why this aspect matches the user's feeling.")
    })).describe("List of astrological aspects that match the journal entry."),
    alchemicalAdvice: z.string().describe("Actionable advice to transmute this energy (e.g., 'Use this anger to finish a project')."),
    elementalShift: z.object({
        element: z.enum(['Fuego', 'Tierra', 'Aire', 'Agua']),
        direction: z.enum(['Increase', 'Decrease', 'Balance']),
        reason: z.string()
    }).describe("Which element is currently out of balance based on the entry.")
});
