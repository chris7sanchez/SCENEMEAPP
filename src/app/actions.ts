'use server';

import { generateVideoScript } from '@/ai/flows/generate-video-script';
import { type GenerateVideoScriptInput } from '@/ai/schemas';
import { frenarAccionIA } from '@/lib/seguridad-acciones';


export async function generateScriptAction(data: GenerateVideoScriptInput) {
    await frenarAccionIA();
    try {
        const result = await generateVideoScript(data);
        return { success: true, script: result.script };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to generate script: ${errorMessage}` };
    }
}
