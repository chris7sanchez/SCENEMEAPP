import { NextRequest, NextResponse } from 'next/server';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { AnalyzeCharacterOutputSchema } from '@/ai/flows/schemas';

// --- MOCK GENERATOR FOR FALLBACK ---
function generateMockProfile(name: string, error?: string) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const randomSign = () => signs[Math.floor(Math.random() * signs.length)];

    return {
        sunSign: randomSign(),
        moonSign: randomSign(),
        ascendant: randomSign(),
        elements: { fire: 25, earth: 25, air: 25, water: 25 },
        archetype: "El Superviviente (Simulación)",
        analysis: `[MODO SIMULACIÓN] No se pudo conectar con la IA Real (${error || 'Error interno'}). Perfil generado automáticamente.`,
        threePillars: {
            sunReasoning: "Energía proyectada simulada.",
            moonReasoning: "Respuesta emocional inferida por el sistema.",
            ascendantReasoning: "Máscara social predeterminada."
        }
    };
}

export const maxDuration = 60; // Allow 60 seconds for AI

export async function POST(req: NextRequest) {
    let characterName = "Desconocido";

    try {
        const body = await req.json();
        const { scriptSegment } = body;
        characterName = body.characterName || "Desconocido";

        // 1. Explicit Key Check
        if (!process.env.GOOGLE_GENAI_API_KEY) {
            console.warn("API Route: Missing GOOGLE_GENAI_API_KEY");
            return NextResponse.json(generateMockProfile(characterName, "Falta API Key en Vercel"));
        }

        // 2. Dynamic Import of AI (Genkit)
        // usage of 'require' or 'import' inside handler prevents top-level crashes
        const { ai } = await import('@/ai/genkit');

        if (!ai) throw new Error("Genkit instance not initialized");

        // 3. Serialize Context
        const archetypeContext = Object.entries(ZODIAC_ARCHETYPES).map(([sign, data]) => {
            return `- ${sign}: Sun(${data.sun}), Moon(${data.moon}), Asc(${data.ascendant}), Shadow(${data.shadow})`;
        }).join('\n');

        const systemPrompt = `
        You are an expert Astrological Profiler.
        Reference:\n${archetypeContext}\n
        Task: Analyze character dialogue/subtext to find Sun, Moon, Ascendant.
        Output: JSON matching the schema.
        `;

        const userPrompt = `
        CHARACTER: ${characterName}
        TEXT: """${scriptSegment.substring(0, 15000)}"""
        `;

        // 4. Generate
        const { output } = await ai.generate({
            system: systemPrompt,
            prompt: userPrompt,
            output: { schema: AnalyzeCharacterOutputSchema }
        });

        if (!output) throw new Error('AI returned null output');

        return NextResponse.json(output);

    } catch (error: any) {
        console.error("API Route Error:", error);
        // Fallback to Mock
        return NextResponse.json(generateMockProfile(characterName, error.message));
    }
}
