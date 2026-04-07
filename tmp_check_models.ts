import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "");
    const results = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Checking API key...");
    
    try {
        const response = await results.generateContent("Test");
        console.log("Success with gemini-1.5-flash!");
    } catch (e) {
        console.error("Error with gemini-1.5-flash:", e.message);
        console.log("Listing available models...");
        // Actually, there is a better way to list models but let's try gemini-1.5-flash-8b as fallback
        try {
           const model8b = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
           await model8b.generateContent("Test");
           console.log("Success with gemini-1.5-flash-8b!");
        } catch (e2) {
           console.error("Error with gemini-1.5-flash-8b:", e2.message);
        }
    }
}

listModels();
