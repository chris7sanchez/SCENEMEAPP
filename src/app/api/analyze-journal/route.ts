import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeJournalOutputSchema } from '@/ai/flows/journal-schema';

// --- MOCK GENERATOR FOR FALLBACK ---
function generateMockAnalysis(error?: string) {
    return {
        sentiment: "Introspective",
        correlatedAspects: [
            { aspect: "Moon in Pisces", explanation: "Your emotional sensitivity is heightened today." }
        ],
        alchemicalAdvice: "Use this time for creative writing or meditation.",
        elementalShift: {
            element: "Agua",
            direction: "Balance",
            reason: "You are swimming deep in emotions."
        },
        error: error
    };
}

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { entry, transits, userProfile } = body;

        // 1. Explicit Key Check
        if (!process.env.GOOGLE_GENAI_API_KEY) {
            console.warn("API Route: Missing GOOGLE_GENAI_API_KEY");
            return NextResponse.json(generateMockAnalysis("Falta API Key"));
        }

        // 2. Dynamic Import
        const { ai } = await import('@/ai/genkit');
        if (!ai) throw new Error("Genkit instance not initialized");

        // 3. Logic
        const transitsContext = transits.map((t: any) => `- ${t.planet1} ${t.type} ${t.planet2}`).join('\n');

        const systemPrompt = `
        You are an Alchemical Guide and Astrological Psychologist.
        The user has written a journal entry about their current feelings.
        Your task is to correlate their subjective experience with the objective astrological weather (Transits).

        USER PROFILE:
        - Sun: ${userProfile.sun}
        - Moon: ${userProfile.moon}
        - Ascendant: ${userProfile.ascendant}

        ACTIVE TRANSITS (The Weather):
        ${transitsContext}

        INSTRUCTIONS:
        1. Analyze the "Sentiment" of the text.
        2. Look for matches in the "Active Transits". 
           - Example: If they feel blocked or tired, look for Saturn.
           - Example: If they feel angry or driven, look for Mars.
           - Example: If they feel dreamy or confused, look for Neptune.
           - Example: If they feel expansive or lucky, look for Jupiter.
        3. If no obvious transit matches, look at the Moon sign's current mood (implied).
        4. Provide "Alchemical Advice": How can they turn this lead (heavy feeling) into gold (wisdom/action)?
        5. Determine the "Elemental Shift" needed.
        `;

        const userPrompt = `
        JOURNAL ENTRY:
        "${entry}"

        Analyze this entry.
        `;

        const { output } = await ai.generate({
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: AnalyzeJournalOutputSchema }
        });

        if (!output) throw new Error('AI returned null output');

        return NextResponse.json(output);

    } catch (error: any) {
        console.error("Journal API Route Error:", error);
        return NextResponse.json(generateMockAnalysis(error.message));
    }
}
