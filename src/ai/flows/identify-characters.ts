'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IdentifyCharactersSchema = z.object({
    characters: z.array(z.string()).describe('List of character names found in the script.'),
});

export async function identifyCharacters(scriptText: string): Promise<string[]> {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) return [];

    const promptText = `
    Analyze the following script segment and identify the names of the MAIN characters (speaking roles).
    Return ONLY a JSON array of strings, e.g. ["JUAN", "MARIA", "DETECTIVE"].
    Ignore minor characters with 1 line.
    
    SCRIPT:
    "${scriptText.substring(0, 10000)}..."
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
