'use server';

import type { DailyScene } from '@/lib/daily-scene';
import { isValidScene } from '@/lib/daily-scene';

// ============================================
// GENERADOR DE LA ESCENA DEL DÍA (REST directo a Gemini)
// Modelo estable verificado para esta cuenta; evita el gotcha de genkit.
// ============================================

const PRIMARY_MODEL = 'gemini-flash-lite-latest';

// Variedad diaria: el tono/género rota según la fecha (determinista).
const VIBES = [
    'una discusión de pareja al borde de la ruptura',
    'una reconciliación incómoda entre dos hermanos',
    'una confesión inesperada entre dos amigos',
    'una negociación tensa entre jefe y empleado',
    'un reencuentro después de muchos años',
    'una despedida en una estación de tren',
    'una traición que sale a la luz en una cena',
    'dos desconocidos atrapados en un ascensor',
    'una pareja decidiendo si mudarse juntos',
    'un padre y su hija adulta saldando cuentas del pasado',
];

function vibeForKey(dateKey: string): string {
    // Suma de los códigos de los dígitos de la fecha → índice estable.
    let sum = 0;
    for (const ch of dateKey) sum += ch.charCodeAt(0);
    return VIBES[sum % VIBES.length];
}

export async function generateDailyScene(dateKey: string): Promise<DailyScene> {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) return fallbackScene('Falta API Key');

    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
        try {
            const scene = await callGemini(PRIMARY_MODEL, apiKey, dateKey);
            if (isValidScene(scene)) return scene;
            throw new Error('Escena con forma inválida');
        } catch (error: any) {
            attempts++;
            const msg = error?.message || String(error);
            if ((msg.includes('429') || msg.includes('quota') || msg.includes('demand')) && attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, attempts * 2000));
                continue;
            }
            if (attempts >= maxAttempts) return fallbackScene(msg);
        }
    }
    return fallbackScene('Superado el límite de reintentos');
}

async function callGemini(model: string, apiKey: string, dateKey: string): Promise<DailyScene> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const vibe = vibeForKey(dateKey);

    const systemPrompt = `Eres un guionista que crea escenas CORTAS y FÁCILES para que un actor las ensaye en casa.
Reglas:
- Escena breve: EXACTAMENTE 2 personajes y entre 8 y 12 réplicas en total.
- Diálogo natural en ESPAÑOL de España, frases no muy largas, fáciles de memorizar.
- Tono apropiado para todos los públicos: SIN violencia explícita, SIN sexo, SIN lenguaje soez. Apto para menores.
- Da emoción y subtexto para que el actor tenga algo que interpretar, pero mantenlo limpio.
- Nombres de personaje en MAYÚSCULAS.
ESTRUCTURA JSON EXACTA A DEVOLVER:
{
  "title": "<título corto de la escena>",
  "synopsis": "<1 frase de contexto y qué busca cada personaje>",
  "characters": ["NOMBRE1", "NOMBRE2"],
  "lines": [ { "character": "NOMBRE1", "text": "..." }, { "character": "NOMBRE2", "text": "..." } ]
}`;

    const userPrompt = `Crea la escena del día sobre: ${vibe}. Devuelve SOLO el JSON.`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
        }),
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`[${response.status}] ${txt}`);
    }
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text);
}

function fallbackScene(reason: string): DailyScene {
    console.error('[generateDailyScene] fallback:', reason);
    return {
        title: 'La llamada',
        synopsis: 'Dos viejos amigos retoman una conversación pendiente (escena de reserva).',
        characters: ['ALEX', 'SAM'],
        lines: [
            { character: 'ALEX', text: 'No esperaba que contestaras.' },
            { character: 'SAM', text: 'Yo tampoco esperaba llamarte.' },
            { character: 'ALEX', text: 'Han pasado muchas cosas.' },
            { character: 'SAM', text: 'Demasiadas. ¿Por dónde empezamos?' },
            { character: 'ALEX', text: 'Por el principio. Por lo que no te dije.' },
            { character: 'SAM', text: 'Te escucho. Esta vez de verdad.' },
            { character: 'ALEX', text: 'Tenía miedo de perderte. Y te perdí igual.' },
            { character: 'SAM', text: 'Aún estoy aquí, ¿no?' },
        ],
    };
}
