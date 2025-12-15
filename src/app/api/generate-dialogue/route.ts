import { NextRequest, NextResponse } from 'next/server';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { GenerateDialogueOutputSchema } from '@/ai/flows/dialogue-schema';

// --- MOCK GENERATOR FOR FALLBACK ---
function generateMockDialogue(error?: string) {
    return {
        dialogue: "...",
        internalMonologue: "I can't seem to find my voice right now.",
        emotionalTone: "Confused",
        action: "Looks around, disoriented",
        error: error
    };
}

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { characterName, astrologicalProfile, psychologicalState, userPrompt, chatHistory } = body;

        // 1. Explicit Key Check
        if (!process.env.GOOGLE_GENAI_API_KEY) {
            console.warn("API Route: Missing GOOGLE_GENAI_API_KEY");
            return NextResponse.json(generateMockDialogue("Falta API Key"));
        }

        // 2. Dynamic Import
        const { ai } = await import('@/ai/genkit');
        if (!ai) throw new Error("Genkit instance not initialized");

        // 3. Logic
        const archetypeContext = Object.entries(ZODIAC_ARCHETYPES).map(([sign, data]) => {
            return `- ${sign}: Keywords(${data.keywords.join(', ')})`;
        }).join('\n');

        const historyText = chatHistory?.map((msg: any) =>
            `${msg.role === 'user' ? 'User' : characterName}: ${msg.content}`
        ).join('\n') || "No previous history.";

        const systemPrompt = `
        You are the character "${characterName}".
        You are NOT an astrologer. You do not talk about your signs. You simply ARE them.
        Your goal is to have a natural, organic conversation with the user.

        YOUR INTERNAL CONFIGURATION (The "Why" behind your words):
        - ESSENCE (Sun): ${astrologicalProfile.sun}
        - EMOTIONAL CORE (Moon): ${astrologicalProfile.moon}
        - MASK/STYLE (Ascendant): ${astrologicalProfile.ascendant}
        ${astrologicalProfile.mercury ? `- COMMUNICATION (Mercury): ${astrologicalProfile.mercury}` : ''}
        ${astrologicalProfile.venus ? `- VALUES/AFFECTION (Venus): ${astrologicalProfile.venus}` : ''}
        ${astrologicalProfile.mars ? `- DRIVE/AGGRESSION (Mars): ${astrologicalProfile.mars}` : ''}

        CURRENT PSYCHOLOGICAL CONTEXT:
        - Subtext/Secrets: "${psychologicalState.unsaid || 'None'}"
        - Mood: "${psychologicalState.emotions || 'Neutral'}"
        - Goal: "${psychologicalState.outcome || 'Just talking'}"

        ARCHETYPE DATA (For reference only - do not be a caricature):
        ${archetypeContext}

        INSTRUCTIONS:
        1. **Be Natural & Organic**: Respond to ANY topic the user raises (mundane or deep). Do not force drama if the question is simple.
        2. **Holistic Integration**: Do not "check boxes" for every planet. Let the profile blend into a cohesive personality. 
           - Example: If you have Mercury in Scorpio, you don't need to be dark, just observant and perhaps a bit guarded or insightful.
           - Example: If you have Moon in Leo, you might secretly want validation, but you might not say it out loud.
        3. **Internal vs External**: 
           - Use "Internal Monologue" for your true feelings (Moon/Unsaid).
           - Use "Dialogue" for what you actually choose to show (Ascendant/Mercury).
        4. **Avoid Astrological Jargon**: Never mention "my Mars" or "my sign". Just act it out.
        `;

        const prompt = `
        CHAT HISTORY:
        ${historyText}

        USER INPUT:
        "${userPrompt}"

        Generate the next response.
        `;

        const { output } = await ai.generate({
            system: systemPrompt,
            prompt: prompt,
            output: { schema: GenerateDialogueOutputSchema }
        });

        if (!output) throw new Error('AI returned null output');

        return NextResponse.json(output);

    } catch (error: any) {
        console.error("Dialogue API Route Error:", error);
        return NextResponse.json(generateMockDialogue(error.message));
    }
}
