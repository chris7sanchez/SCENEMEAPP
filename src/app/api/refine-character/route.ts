import { NextRequest, NextResponse } from 'next/server';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { RefineCharacterOutputSchema } from '@/ai/flows/refine-schema';

// --- MOCK GENERATOR FOR FALLBACK ---
function generateMockRefinement(name: string, error?: string) {
    return {
        verdict: "Análisis Simulado (Fallo de Conexión)",
        adjective: "Resiliente",
        sunSign: "Scorpio",
        moonSign: "Pisces",
        ascendant: "Capricorn",
        suggestedPlacements: [
            { planet: "Mars", sign: "Aries", reasoning: "Simulated drive due to connection error." }
        ],
        reasoning: `[MODO SIMULACIÓN] El sistema no pudo conectar con la IA de refinamiento (${error || 'Unknown Error'}). Se mantienen valores arquetípicos por defecto para permitir continuar.`
    };
}

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    let charName = "Desconocido";

    try {
        const body = await req.json();
        const { name, currentProfile, deepAnalysis } = body;
        charName = name || "Desconocido";

        // 1. Explicit Key Check
        if (!process.env.GOOGLE_GENAI_API_KEY) {
            console.warn("API Route: Missing GOOGLE_GENAI_API_KEY");
            return NextResponse.json(generateMockRefinement(charName, "Falta API Key en Vercel"));
        }

        // 2. Dynamic Import
        const { ai } = await import('@/ai/genkit');

        if (!ai) throw new Error("Genkit instance not initialized");

        // 3. Logic
        const archetypeContext = Object.entries(ZODIAC_ARCHETYPES).map(([sign, data]) => {
            return `- ${sign}: Keywords(${data.keywords.join(', ')})`;
        }).join('\n');

        const systemPrompt = `
        You are an Expert Astrological Technician & Psychologist.
        The user has performed a "Deep Analysis" of a character, revealing hidden thoughts (Lo No Dicho), emotional landscapes, and outcomes.
        
        YOUR TASK:
        Re-evaluate the character's Astrological Profile based strictly on this new psychological depth.
        The current profile might be superficial. You must determine if the "True Essence" (Sun), "Emotional Core" (Moon), or "Mask/Path" (Ascendant) changes given the new data.
        
        Also, consider if specific planets (Mercury, Venus, Mars, Pluto, etc.) should be emphasized in specific signs to explain the psychological nuance (e.g., "Violent repressed anger" -> Mars in Scorpio).

        REFERENCE ARCHETYPES:
        ${archetypeContext}

        INSTRUCTIONS:
        1. Analyze the "Unsaid", "Emotions", and "Outcome" inputs.
        2. Assign a "Verdict" summarizing the shift in energy.
        3. Choose a single "Adjective" that captures this new state.
        4. Provide the REFINED signs. If they match the current profile, keep them. If the deep analysis contradicts the surface, CHANGE THEM.
        5. Suggest specific placements for other planets if they are critical to the "Verdict" (e.g., Pluto for obsession, Saturn for restriction).
        `;

        const userPrompt = `
        CHARACTER: ${name}
        
        CURRENT PROFILE:
        - Sun: ${currentProfile.sun}
        - Moon: ${currentProfile.moon}
        - Ascendant: ${currentProfile.ascendant}

        DEEP ANALYSIS INPUTS:
        - Lo No Dicho (The Unsaid/Subtext): "${deepAnalysis.unsaid || 'N/A'}"
        - Mundo Emocional (Emotions): "${deepAnalysis.emotions || 'N/A'}"
        - Desenlace (Outcome): "${deepAnalysis.outcome || 'N/A'}"
        
        Based on this deep psychological data, refine the profile.
        `;

        const { output } = await ai.generate({
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: RefineCharacterOutputSchema }
        });

        if (!output) throw new Error('AI returned null output');

        return NextResponse.json(output);

    } catch (error: any) {
        console.error("Refine API Route Error:", error);
        return NextResponse.json(generateMockRefinement(charName, error.message));
    }
}
