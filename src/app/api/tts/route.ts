import { NextRequest } from 'next/server';

// Genera voz por IA. provider 'openai' (gpt-4o-mini-tts) o 'elevenlabs'
// (eleven_multilingual_v2). Devuelve audio MP3. Si falta la clave del proveedor,
// responde 503 para que el cliente caiga a la voz del navegador.

export const runtime = 'nodejs';

const OPENAI_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer'];

// Mapea una instrucción libre ("con rabia", "triste"...) a una emoción de Cartesia.
function cartesiaEmotion(instr: string): string | undefined {
    const t = (instr || '').toLowerCase();
    if (/rabia|enfad|furi|ira|grit/.test(t)) return 'angry';
    if (/triste|llanto|llor|deprim|dolor/.test(t)) return 'sad';
    if (/fr[ií]o|cortante|distante|seco/.test(t)) return 'distant';
    if (/c[áa]lid|cariñ|tern|cerca|amable/.test(t)) return 'affectionate';
    if (/nervios|ansa|ansied|inquiet/.test(t)) return 'anxious';
    if (/ir[óo]nic|sarcas|burl/.test(t)) return 'sarcastic';
    if (/asust|miedo|temor|p[áa]nic/.test(t)) return 'scared';
    if (/calm|sereno|tranquil|susurr/.test(t)) return 'calm';
    if (/alegr|feliz|content|entusias/.test(t)) return 'happy';
    return undefined;
}

export async function POST(req: NextRequest) {
    let body: any;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: 'bad_request' }, { status: 400 });
    }

    const provider: string = ['elevenlabs', 'cartesia'].includes(body?.provider) ? body.provider : 'openai';
    const text: string = (body?.text || '').toString().slice(0, 800);
    const instructions: string = (body?.instructions || '').toString().slice(0, 400);
    const rate: number = Math.min(1.5, Math.max(0.6, Number(body?.rate) || 1));
    if (!text.trim()) return Response.json({ error: 'empty_text' }, { status: 400 });

    const baseStyle = 'Habla en español de España con voz humana y natural, ritmo conversacional realista, entonación expresiva y emoción acorde a la escena; nada de tono de locutor de anuncio.';
    const fullInstructions = instructions ? `${baseStyle} ${instructions}` : baseStyle;

    try {
        if (provider === 'cartesia') {
            const key = process.env.CARTESIA_API_KEY;
            if (!key) return Response.json({ error: 'no_key', message: 'Falta CARTESIA_API_KEY' }, { status: 503 });
            const voiceId: string = (body?.voice || '').toString();
            if (!voiceId) return Response.json({ error: 'no_voice', message: 'Falta voz de Cartesia' }, { status: 400 });
            const emotion = cartesiaEmotion(instructions);
            const r = await fetch('https://api.cartesia.ai/tts/bytes', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${key}`, 'Cartesia-Version': '2026-03-01', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model_id: 'sonic-3.5',
                    transcript: text,
                    voice: { mode: 'id', id: voiceId },
                    language: 'es',
                    output_format: { container: 'mp3', sample_rate: 44100, bit_rate: 128000 },
                    generation_config: { speed: rate, ...(emotion ? { emotion } : {}) },
                }),
            });
            if (!r.ok) {
                const detail = await r.text();
                return Response.json({ error: 'cartesia_error', status: r.status, detail: detail.slice(0, 300) }, { status: 502 });
            }
            const audio = await r.arrayBuffer();
            return new Response(audio, { status: 200, headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' } });
        }

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
