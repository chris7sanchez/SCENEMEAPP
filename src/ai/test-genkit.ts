
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import * as dotenv from 'dotenv';
dotenv.config();

async function testAI() {
    console.log("Testing gemini-flash-latest...");
    const ai = genkit({
        plugins: [googleAI()],
    });

    try {
        const { text } = await ai.generate({
            model: 'googleai/gemini-flash-latest',
            prompt: "Say hi"
        });
        console.log("Response:", text);
    } catch (error: any) {
        console.error("ERROR:", error.message);
    }
}

testAI();
