'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IdentifyCharactersSchema = z.object({
    characters: z.array(z.string()).describe('List of character names found in the script.'),
});

export async function identifyCharacters(scriptText: string): Promise<string[]> {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) return [];

    const promptText = `
    Eres un asistente de guion. Identifica los PERSONAJES del siguiente texto (roles con diálogo o foco narrativo).
    Devuelve SOLO un array JSON de nombres en mayúsculas, p. ej. ["JUAN", "MARIA", "DETECTIVE"].
    Reglas:
    - Ignora personajes con una sola línea irrelevante.
    - Si el texto es prosa, un monólogo o una descripción de un solo personaje, devuelve al menos al protagonista.
    - Si no hay nombres propios, usa un descriptor breve (ej. ["PROTAGONISTA"]).
    - No expliques nada, solo el array JSON.

    TEXTO:
    "${scriptText.substring(0, 10000)}"
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return [];

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const names = JSON.parse(text);
        return Array.isArray(names) ? names : [];
    } catch (e) {
        console.error("Identify Characters Failed", e);
        return [];
    }
}
