import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// The plugin will automatically look for GOOGLE_GENAI_API_KEY in the environment.
export const ai = genkit({
    plugins: [googleAI()],
    model: gemini15Flash,
});
