// Analiza la toma grabada por el actor: la transcribe y la compara con el texto
// de la escena para devolver notas concretas de interpretación.
//
// Cierra el bucle del Studio: hasta ahora el actor grababa y subía la toma, pero
// no recibía nada de vuelta.
//
// Transcripción con Whisper (OpenAI, la misma clave que ya usa el TTS) y las
// notas con Gemini vía Genkit, como el resto de flujos de la app.

import { getAI, withRetry } from '@/ai/genkit';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Nota { momento: string; observacion: string; sugerencia: string }

export async function POST(req: Request) {
    let form: FormData;
    try {
        form = await req.formData();
    } catch {
        return Response.json({ error: 'bad_request', message: 'Se esperaba un formulario con la toma.' }, { status: 400 });
    }

    const media = form.get('media');
    const guion = String(form.get('guion') ?? '').trim();
    const personaje = String(form.get('personaje') ?? '').trim();

    if (!(media instanceof File) || media.size === 0) {
        return Response.json({ error: 'sin_toma', message: 'No llegó ningún archivo de vídeo o audio.' }, { status: 400 });
    }
    if (media.size > 25 * 1024 * 1024) {
        return Response.json({ error: 'muy_grande', message: 'La toma supera los 25 MB. Graba un fragmento más corto.' }, { status: 413 });
    }
    if (!guion) {
        return Response.json({ error: 'sin_guion', message: 'Falta el texto de la escena con el que comparar.' }, { status: 400 });
    }

    // 1) Transcribir
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return Response.json({ error: 'no_key', message: 'Falta OPENAI_API_KEY para transcribir la toma.' }, { status: 503 });
    }

    let transcripcion = '';
    try {
        const envio = new FormData();
        envio.append('file', media, media.name || 'toma.webm');
        envio.append('model', 'whisper-1');
        envio.append('language', 'es');
        const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}` },
            body: envio,
        });
        if (!r.ok) {
            const detalle = await r.text();
            console.warn('[analyze-take] whisper falló:', r.status, detalle.slice(0, 200));
            return Response.json({ error: 'transcripcion', message: 'No se pudo transcribir la toma.' }, { status: 502 });
        }
        transcripcion = String((await r.json())?.text ?? '').trim();
    } catch (e) {
        console.warn('[analyze-take] error de transcripción:', e);
        return Response.json({ error: 'transcripcion', message: 'No se pudo transcribir la toma.' }, { status: 502 });
    }

    if (!transcripcion) {
        return Response.json({
            error: 'sin_voz',
            message: 'No se oye ninguna voz en la toma. Revisa el micrófono y vuelve a grabarla.',
        }, { status: 422 });
    }

    // 2) Comparar con el guion y sacar notas
    const prompt = `Eres un director de actores con oficio, exigente pero útil. Hablas español de España, de tú, sin florituras.

ESCENA (texto original):
"""${guion}"""

${personaje ? `El actor interpreta a: ${personaje}. Fíjate solo en SUS líneas.` : ''}

LO QUE EL ACTOR HA DICHO EN SU TOMA (transcripción automática, puede tener erratas):
"""${transcripcion}"""

Compara ambas cosas y devuelve SOLO un JSON válido, sin markdown ni texto alrededor, con esta forma:
{
  "fidelidad": <entero 0-100: cuánto se ajusta al texto; ignora erratas de transcripción>,
  "resumen": "<dos frases: qué has visto en esta toma>",
  "fuerte": "<lo mejor de la toma, concreto>",
  "notas": [
    {"momento": "<cita breve de la línea afectada>", "observacion": "<qué pasa>", "sugerencia": "<qué probar en la siguiente toma>"}
  ],
  "siguientePaso": "<una sola instrucción para la próxima toma>"
}

Reglas: entre 2 y 4 notas, ninguna genérica. Si se ha saltado o cambiado texto, dilo en una nota. No comentes la calidad del audio ni de la transcripción. No inventes lo que no puedas deducir del texto.`;

    try {
        const ai = getAI();
        const { text } = await withRetry(() => ai.generate({ prompt }));
        const limpio = String(text ?? '').replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
        const desde = limpio.indexOf('{');
        const hasta = limpio.lastIndexOf('}');
        if (desde < 0 || hasta < 0) throw new Error('respuesta sin JSON');
        const datos = JSON.parse(limpio.slice(desde, hasta + 1));

        return Response.json({
            transcripcion,
            fidelidad: Math.max(0, Math.min(100, Number(datos.fidelidad) || 0)),
            resumen: String(datos.resumen ?? ''),
            fuerte: String(datos.fuerte ?? ''),
            notas: (Array.isArray(datos.notas) ? datos.notas : []).slice(0, 4).map((n: any): Nota => ({
                momento: String(n?.momento ?? ''),
                observacion: String(n?.observacion ?? ''),
                sugerencia: String(n?.sugerencia ?? ''),
            })),
            siguientePaso: String(datos.siguientePaso ?? ''),
        });
    } catch (e: any) {
        console.warn('[analyze-take] análisis falló:', e?.message ?? e);
        // La transcripción ya vale por sí sola: la devolvemos aunque falle el análisis.
        return Response.json({
            transcripcion,
            error: 'analisis',
            message: 'He transcrito la toma pero no he podido analizarla. Inténtalo otra vez.',
        }, { status: 200 });
    }
}
