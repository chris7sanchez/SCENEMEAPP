'use server';

import { AnalyzeCharacterInput, AnalyzeCharacterOutput, AnalyzeCharacterOutputSchema } from './schemas';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';

// --- MOCK GENERATOR FOR FALLBACK ---
function generateMockProfile(name: string, error?: string): AnalyzeCharacterOutput {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const randomSign = () => signs[Math.floor(Math.random() * signs.length)];

    return {
        sunSign: randomSign(),
        moonSign: randomSign(),
        ascendant: randomSign(),
        elements: { fire: 25, earth: 25, air: 25, water: 25 },
        archetype: "El Superviviente (Simulación)",
        analysis: `[MODO SIMULACIÓN] No se pudo conectar con la IA Real (${error || 'Clave API faltante o error interno'}). Se ha generado un perfil arquetípico basado en la estructura del guion para permitirte continuar trabajando.`,
        threePillars: {
            sunReasoning: "Energía proyectada simulada.",
            moonReasoning: "Respuesta emocional inferida por el sistema.",
            ascendantReasoning: "Máscara social predeterminada."
        }
    };
}

export async function analyzeCharacter(input: AnalyzeCharacterInput): Promise<AnalyzeCharacterOutput> {
    const { scriptSegment, characterName, customKnowledge } = input;

    try {
        // 1. Dynamic Import to isolate crashes
        const { ai } = await import('@/ai/genkit');

        // 2. Explicit Key Check
        if (!process.env.GOOGLE_GENAI_API_KEY) {
            console.warn("GOOGLE_GENAI_API_KEY missing. Using Mock.");
            return generateMockProfile(characterName, "Falta API Key en Vercel");
        }

        // 3. Serialize Context
        let archetypeContext = Object.entries(ZODIAC_ARCHETYPES).map(([sign, data]) => {
            return `- ${sign}: Sun(${data.sun}), Moon(${data.moon}), Asc(${data.ascendant}), Shadow(${data.shadow})`;
        }).join('\n');

        // Append Custom Knowledge if available
        if (customKnowledge && customKnowledge.length > 0) {
            const customContext = customKnowledge.map(k => `[NEW KNOWLEDGE] Target: ${k.target} | Category: ${k.category} | Info: ${k.value} (${k.description})`).join('\n');
            archetypeContext += `\n\nADDITIONAL ASSIMILATED WISDOM (PRIORITIZE THIS):\n${customContext}`;
        }

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

        return output;

    } catch (error: any) {
        console.error("CRITICAL AI FAILURE (Safely caught):", error);
        // RETURN MOCK DATA INSTEAD OF CRASHING
        return generateMockProfile(characterName, error.message);
    }
}
