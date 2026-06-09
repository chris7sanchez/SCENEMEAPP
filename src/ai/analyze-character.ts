'use server';

import { AnalyzeCharacterInput, AnalyzeCharacterOutput } from './schemas';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { CHARACTER_RUBRIC, STYLE_CUES, OUTPUT_RULES, formatCustomKnowledge } from './character-rubric';

// ============================================
// CHARACTER ANALYZER v3.13.0 — ULTRA RESILIENT
// ============================================

const PRIMARY_MODEL = 'gemini-flash-lite-latest'; // El mas estable para tu cuenta

export async function analyzeCharacter(input: AnalyzeCharacterInput): Promise<AnalyzeCharacterOutput> {
    const { scriptSegment, characterName, otherCharacters } = input;
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY || process.env.GOOGLE_API_KEY;

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
    const { scriptSegment, characterName, otherCharacters, customKnowledge } = input;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const jsonSpec = `
ESTRUCTURA JSON EXACTA A DEVOLVER:
{
  "sunSign": "<signo en español>",
  "moonSign": "<signo en español>",
  "ascendant": "<signo en español>",
  "estimatedAge": <SOLO un número entero (p. ej. 35), sin texto ni rangos: edad aproximada del personaje inferida del guion (madurez, vocabulario, referencias); si no hay pistas, estima una plausible>,
  "elements": { "fire": <0-100>, "earth": <0-100>, "air": <0-100>, "water": <0-100> },
  "archetype": "<arquetipo breve, ej. 'El Estratega', 'La Rebelde'>",
  "essence": "<aforismo de menos de 15 palabras que capture su verdad nuclear>",
  "analysis": "<1 frase, máx 20 palabras: por qué estas posiciones capturan al personaje>",
  "threePillars": {
    "sunReasoning": "<por qué ese Sol + la pista textual que lo justifica>",
    "moonReasoning": "<por qué esa Luna + la pista textual (reacción bajo estrés)>",
    "ascendantReasoning": "<por qué ese Ascendente + la pista textual (cómo aparece)>"
  },
  "methodActing": {
    "psychologicalGesture": "<un gesto físico, 1 frase>",
    "voiceQuality": "<tempo, tono y textura de voz, 1 frase>",
    "animalTotem": "<un animal y su vibra>",
    "physicalCenter": "<Cabeza | Corazón | Plexo Solar | Pelvis | Pies (2-3 palabras)>",
    "emotionalLandscape": "<1 metáfora del paisaje interior>"
  }
}`;

    const systemPrompt = `${CHARACTER_RUBRIC}\n${STYLE_CUES}\n${OUTPUT_RULES}\n${jsonSpec}\n\nPersonaje a perfilar: ${characterName.toUpperCase()}. Diferéncialo de: ${otherCharacters && otherCharacters.length ? otherCharacters.join(', ') : 'nadie'}.`;

    const userPrompt = `${formatCustomKnowledge(customKnowledge)}\nGUION / ESCENA:\n${scriptSegment.substring(0, 5000)}\n\nDevuelve el JSON del PERFIL DE ${characterName.toUpperCase()} aplicando el método y citando la evidencia textual:`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.35 }
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
