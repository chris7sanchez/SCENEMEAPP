// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent that refines a draft script based on user feedback.
 *
 * - improveAIScene - A function that takes the initial AI-generated script and user feedback to produce an improved script.
 * - ImproveAISceneInput - The input type for the improveAIScene function.
 * - ImproveAISceneOutput - The return type for the improveAIScene function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImproveAISceneInputSchema = z.object({
    initialScene: z.string().describe('The initial AI-generated script.'),
    feedback: z.string().describe('The user feedback on the initial script.'),
});
export type ImproveAISceneInput = z.infer<typeof ImproveAISceneInputSchema>;

const ImproveAISceneOutputSchema = z.object({
    improvedScene: z.string().describe('The improved AI-generated script based on user feedback.'),
});
export type ImproveAISceneOutput = z.infer<typeof ImproveAISceneOutputSchema>;

export async function improveAIScene(input: ImproveAISceneInput): Promise<ImproveAISceneOutput> {
    return improveAISceneFlow(input);
}

const prompt = ai.definePrompt({
    name: 'improveAIScenePrompt',
    input: { schema: ImproveAISceneInputSchema },
    output: { schema: ImproveAISceneOutputSchema },
    prompt: `You are a scriptwriting expert. The user has provided an initial AI-generated script and wants you to improve it based on their feedback.

  Initial Script:
  {{initialScene}}

  Feedback:
  {{feedback}}

  Based on the feedback, rewrite the script to make it better. Consider the user's feedback carefully and make specific changes to the script to address their concerns. The improved script should still be a scene.
  Improved Script:`, // Improved prompt instructions
});

const improveAISceneFlow = ai.defineFlow(
    {
        name: 'improveAISceneFlow',
        inputSchema: ImproveAISceneInputSchema,
        outputSchema: ImproveAISceneOutputSchema,
    },
    async input => {
        const { output } = await prompt(input);
        return output!;
    }
);
