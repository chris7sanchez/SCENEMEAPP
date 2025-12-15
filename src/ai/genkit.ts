import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Safely initialize plugins purely to prevent top-level crash on import
let plugins: any[] = [];
try {
    // Only attempt to init plugin if key exists to avoid throws
    if (process.env.GOOGLE_GENAI_API_KEY) {
        plugins.push(googleAI());
    } else {
        console.warn("GOOGLE_GENAI_API_KEY missing in environment variables.");
    }
} catch (error) {
    console.error("Failed to initialize Google AI plugin:", error);
}

export const ai = genkit({
    plugins,
    model: 'googleai/gemini-2.5-flash',
});
