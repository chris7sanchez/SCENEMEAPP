import { NextRequest } from 'next/server';

// Genera voz con OpenAI (gpt-4o-mini-tts). Acepta texto + voz + instrucción de
// interpretación por personaje. Devuelve audio MP3. Si no hay clave configurada,
// responde 503 para que el cliente caiga a la voz del navegador.

export const runtime = 'nodejs';

const OPENAI_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer'];

export async function POST(req: NextRequest) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return Response.json({ error: 'no_key', message: 'Falta OPENAI_API_KEY' }, { status: 503 });
    }

    let body: any;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: 'bad_request' }, { status: 400 });
    }

    const text: string = (body?.text || '').toString().slice(0, 800);
    const voice: string = OPENAI_VOICES.includes(body?.voice) ? body.voice : 'alloy';
    const instructions: string = (body?.instructions || '').toString().slice(0, 400);

    if (!text.trim()) return Response.json({ error: 'empty_text' }, { status: 400 });

    try {
        const r = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini-tts',
                voice,
                input: text,
                instructions: instructions || undefined,
                response_format: 'mp3',
            }),
        });

        if (!r.ok) {
            const detail = await r.text();
            return Response.json({ error: 'openai_error', status: r.status, detail: detail.slice(0, 300) }, { status: 502 });
        }

        const audio = await r.arrayBuffer();
        return new Response(audio, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (e: any) {
        return Response.json({ error: 'fetch_failed', message: e?.message || String(e) }, { status: 502 });
    }
}
