import { generateScript } from './src/ai/flows/generate-script';
import dotenv from 'dotenv';
dotenv.config();

async function testGeneration() {
    console.log("Testing Genkit Script Generation...");
    const result = await generateScript({
        language: "Spanish",
        genre: "Sci-Fi",
        numActors: 2,
        logline: "A space traveler discovers a portal in their locker.",
        length: "30 seconds"
    });

    if (result.error) {
        console.error("Generation failed:", result.error);
    } else {
        console.log("Generation successful!");
        console.log("Script snippet:", result.script?.substring(0, 200) + "...");
    }
}

testGeneration();
