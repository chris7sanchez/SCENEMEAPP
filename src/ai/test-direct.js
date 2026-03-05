
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

async function testDirect() {
    console.log("Starting Direct Google AI test...");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

    // We try gemini-1.5-flash which is the most common
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Say hi");
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (error) {
        console.error("DIRECT ERROR:", error.message);
    }
}

testDirect();
