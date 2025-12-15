'use server';

import { generateVideoScript, type GenerateVideoScriptInput } from '@/ai/flows/generate-video-script';

export async function generateScriptAction(data: GenerateVideoScriptInput) {
    try {
        const result = await generateVideoScript(data);
        return { success: true, script: result.script };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to generate script: ${errorMessage}` };
    }
}
