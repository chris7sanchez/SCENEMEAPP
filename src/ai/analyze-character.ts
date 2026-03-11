'use server';

import { AnalyzeCharacterInput, AnalyzeCharacterOutput } from './schemas';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';

// ============================================
// CHARACTER ANALYZER v3.13.0 — ULTRA RESILIENT
// ============================================

const PRIMARY_MODEL = 'gemini-flash-lite-latest'; // El mas estable para tu cuenta

export async function analyzeCharacter(input: AnalyzeCharacterInput): Promise<AnalyzeCharacterOutput> {
    const { scriptSegment, characterName, otherCharacters } = input;
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) return generateCharacterFallback(characterName, scriptSegment, 'Falta API Key');

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            console.log(`[analyzeCharacter] Intento ${attempts + 1} con ${PRIMARY_MODEL} para ${characterName}`);
            const result = await callGeminiAPI(PRIMARY_MODEL, apiKey, input);
            return result;

        } catch (error: any) {
            attempts++;
            const msg = error.message;
            console.warn(`[analyzeCharacter] Intento ${attempts} falló: ${msg}`);

            // Si es un error de "High Demand" o "Rate Limit", esperamos y reintentamos
            if (msg.includes('429') || msg.includes('demand') || msg.includes('quota')) {
                if (attempts < maxAttempts) {
                    const waitTime = attempts * 2000; // 2s, 4s...
                    console.log(`[analyzeCharacter] Reintentando en ${waitTime}ms...`);
                    await new Promise(r => setTimeout(r, waitTime));
                    continue;
                }
            }
            // Si es otro error, devolvemos el fallback
            return generateCharacterFallback(characterName, scriptSegment, msg);
        }
    }

    return generateCharacterFallback(characterName, scriptSegment, 'Superado limite de reintentos');
}

async function callGeminiAPI(model: string, apiKey: string, input: AnalyzeCharacterInput): Promise<AnalyzeCharacterOutput> {
    const { scriptSegment, characterName, otherCharacters } = input;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemPrompt = `Eres un perfilador astrologico. Analiza a ${characterName.toUpperCase()} y diferencia de ${otherCharacters?.join(', ') || 'nadie'}.
    JSON structure: sunSign, moonSign, ascendant, elements:{fire,earth,air,water}, archetype, essence, analysis, threePillars:{sunReasoning,moonReasoning,ascendantReasoning}, methodActing:{psychologicalGesture,voiceQuality,animalTotem,physicalCenter,emotionalLandscape}.
    Reglas: Muy breve. Elementos suman 100. Solo JSON.`;

    const userPrompt = `GUION:\n${scriptSegment.substring(0, 3000)}\n\nPERFIL DE ${characterName}:`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
        })
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`[${response.status}] ${txt}`);
    }

    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
}

function generateCharacterFallback(characterName: string, text: string, reason: string): AnalyzeCharacterOutput {
    console.error(`FALLBACK para ${characterName}: ${reason}`);
    return {
        sunSign: 'Aries', moonSign: 'Leo', ascendant: 'Sagitario',
        elements: { fire: 100, earth: 0, air: 0, water: 0 },
        archetype: 'Error de Conexion',
        essence: 'Sistema en mantenimiento tecnico.',
        analysis: `No pudimos conectar con la IA: ${reason.substring(0, 50)}`,
        threePillars: { sunReasoning: '...', moonReasoning: '...', ascendantReasoning: '...' },
        methodActing: { psychologicalGesture: '...', voiceQuality: '...', animalTotem: '...', physicalCenter: '...', emotionalLandscape: '...' }
    };
}
