// Llamada directa a Gemini que devuelve JSON, con tope de tiempo.
//
// Por qué no Genkit aquí (26/10/2026): en Fotogramas, Gemini 2.5 Flash se ponía
// a «pensar» antes de contestar y pasaba de los 30 s; Vercel cortaba y al
// navegador le llegaba un texto de error en vez de JSON (Safari: «The string did
// not match the expected pattern»). Aquí el pensamiento va apagado
// (thinkingBudget 0), hay un tope propio y, si falla, el error dice por qué.

const MODELO = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export type Parte = { text: string } | { inlineData: { mimeType: string; data: string } };

export class ErrorGemini extends Error {
    constructor(message: string, readonly codigo: 'sin_clave' | 'tiempo' | 'api' | 'respuesta') {
        super(message); this.name = 'ErrorGemini';
    }
}

/** Saca el JSON de la respuesta de generateContent (el modelo a veces lo envuelve en ```json). */
export function extraerJson(respuesta: any): unknown {
    const texto: string = (respuesta?.candidates?.[0]?.content?.parts ?? [])
        .map((p: any) => (typeof p?.text === 'string' ? p.text : '')).join('').trim();
    if (!texto) throw new ErrorGemini(`respuesta vacía (${respuesta?.candidates?.[0]?.finishReason ?? 'sin candidato'})`, 'respuesta');
    const limpio = texto.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    try { return JSON.parse(limpio); } catch { throw new ErrorGemini('la respuesta no es JSON', 'respuesta'); }
}

/** Una parte de imagen a partir de un dataURL (data:image/jpeg;base64,...). */
export function parteImagen(dataUrl: string): Parte {
    const coma = dataUrl.indexOf(',');
    return { inlineData: { mimeType: dataUrl.slice(5, dataUrl.indexOf(';')), data: dataUrl.slice(coma + 1) } };
}

export async function generarJson(partes: Parte[], esquema: object, { tiempoMs = 22_000, temperatura = 0.7 } = {}): Promise<unknown> {
    const clave = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!clave) throw new ErrorGemini('falta GOOGLE_GENAI_API_KEY', 'sin_clave');

    const corte = new AbortController();
    const reloj = setTimeout(() => corte.abort(), tiempoMs);
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: partes }],
                generationConfig: {
                    temperature: temperatura,
                    responseMimeType: 'application/json',
                    responseSchema: esquema,
                    thinkingConfig: { thinkingBudget: 0 },
                },
            }),
            signal: corte.signal,
        });
        const datos = await res.json().catch(() => null);
        if (!res.ok) throw new ErrorGemini(`${MODELO} ${res.status}: ${datos?.error?.message ?? 'sin detalle'}`, 'api');
        return extraerJson(datos);
    } catch (e) {
        if ((e as Error)?.name === 'AbortError') throw new ErrorGemini(`${MODELO} tardó más de ${tiempoMs} ms`, 'tiempo');
        throw e;
    } finally {
        clearTimeout(reloj);
    }
}
