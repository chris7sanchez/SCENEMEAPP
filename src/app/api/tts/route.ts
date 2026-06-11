import { NextRequest } from 'next/server';

// Genera voz por IA. provider 'openai' (gpt-4o-mini-tts) o 'elevenlabs'
// (eleven_multilingual_v2). Devuelve audio MP3. Si falta la clave del proveedor,
// responde 503 para que el cliente caiga a la voz del navegador.

export const runtime = 'nodejs';

const OPENAI_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer'];

export async function POST(req: NextRequest) {
    let body: any;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: 'bad_request' }, { status: 400 });
    }

    const provider: string = body?.provider === 'elevenlabs' ? 'elevenlabs' : 'openai';
    const text: string = (body?.text || '').toString().slice(0, 800);
    const instructions: string = (body?.instructions || '').toString().slice(0, 400);
    if (!text.trim()) return Response.json({ error: 'empty_text' }, { status: 400 });

    const baseStyle = 'Habla en español de España con voz humana y natural, ritmo conversacional realista, entonación expresiva y emoción acorde a la escena; nada de tono de locutor de anuncio.';
    const fullInstructions = instructions ? `${baseStyle} ${instructions}` : baseStyle;

    try {
        if (provider === 'elevenlabs') {
            const key = process.env.ELEVENLABS_API_KEY;
            if (!key) return Response.json({ error: 'no_key', message: 'Falta ELEVENLABS_API_KEY' }, { status: 503 });
            const voiceId: string = (body?.voice || 'EXAVITQu4vr4xnSDxMaL').toString();
            const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: { 'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: { stability: 0.4, similarity_boost: 0.85, style: 0.4, use_speaker_boost: true },
                }),
            });
            if (!r.ok) {
                const detail = await r.text();
                return Response.json({ error: 'elevenlabs_error', status: r.status, detail: detail.slice(0, 300) }, { status: 502 });
            }
            const audio = await r.arrayBuffer();
            return new Response(audio, { status: 200, headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' } });
        }

        // OpenAI por defecto
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return Response.json({ error: 'no_key', message: 'Falta OPENAI_API_KEY' }, { status: 503 });
        const voice: string = OPENAI_VOICES.includes(body?.voice) ? body.voice : 'alloy';
        const r = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice, input: text, instructions: fullInstructions, response_format: 'mp3' }),
        });
        if (!r.ok) {
            const detail = await r.text();
            return Response.json({ error: 'openai_error', status: r.status, detail: detail.slice(0, 300) }, { status: 502 });
        }
        const audio = await r.arrayBuffer();
        return new Response(audio, { status: 200, headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' } });
    } catch (e: any) {
        return Response.json({ error: 'fetch_failed', message: e?.message || String(e) }, { status: 502 });
    }
}
