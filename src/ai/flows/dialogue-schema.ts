import { z } from 'genkit';

export const GenerateDialogueInputSchema = z.object({
    characterName: z.string(),
    astrologicalProfile: z.object({
        sun: z.string(),
        moon: z.string(),
        ascendant: z.string(),
        mercury: z.string().optional(),
        venus: z.string().optional(),
        mars: z.string().optional(),
    }),
    psychologicalState: z.object({
        unsaid: z.string().optional(),
        emotions: z.string().optional(),
        outcome: z.string().optional(),
    }),
    userPrompt: z.string(),
    chatHistory: z.array(z.object({
        role: z.enum(['user', 'character']),
        content: z.string()
    })).optional()
});

export const GenerateDialogueOutputSchema = z.object({
    dialogue: z.string().describe("The actual spoken words by the character."),
    internalMonologue: z.string().describe("The character's internal thought process, hidden from the interlocutor."),
    emotionalTone: z.string().describe("A 1-2 word description of the emotional delivery (e.g. 'Coldly Detached', 'Burning with Envy')."),
    action: z.string().describe("A physical action or micro-expression accompanying the line (e.g. 'Lights a cigarette', 'Avoids eye contact').")
});
