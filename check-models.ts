import dotenv from 'dotenv';
dotenv.config();

async function checkModels() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
        console.error("❌ No API Key found in .env");
        return;
    }

    console.log(`🔑 Testing API Key: ${apiKey.substring(0, 5)}...`);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error(`❌ API Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(errorText);
            return;
        }

        const data = await response.json();
        console.log("✅ Available Models:");
        data.models.forEach((m: any) => {
            if (m.name.includes('gemini')) {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
            }
        });

    } catch (error) {
        console.error("❌ Network Error:", error);
    }
}

checkModels();
