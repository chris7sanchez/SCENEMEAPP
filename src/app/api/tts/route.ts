import { NextRequest } from 'next/server';
import { obtenerAdmin } from '@/lib/firebase-admin';
import { uidDeLaPeticion } from '@/lib/tts-auth';
import { almacenFirebase, cacheSegura, claveDeAudio, rutaDeAudio } from '@/lib/tts-cache';
import { consumirCaracteres, limiteDiario, registroFirestore } from '@/lib/tts-limite';
import { servirTts } from '@/lib/tts-servicio';
import { frenar, errorPublico } from '@/lib/seguridad';

// Genera voz por IA: 'openai' (gpt-4o-mini-tts), 'elevenlabs'
// (eleven_multilingual_v2) o 'cartesia' (sonic-3.5). Devuelve audio MP3.
// Exige sesión (401), respeta el límite diario (429) y reutiliza los audios ya
// generados. Si falta la clave del proveedor responde 503 y el cliente cae a
// la voz del navegador.

export const runtime = 'nodejs';

const OPENAI_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer'];

const MODELO = { openai: 'gpt-4o-mini-tts', elevenlabs: 'eleven_multilingual_v2', cartesia: 'sonic-3.5' } as const;
type Proveedor = keyof typeof MODELO;

// SEGURIDAD (18/10/2026): cada llamada cuesta dinero en OpenAI, ElevenLabs o
// Cartesia. Un ensayo pide una frase cada pocos segundos; 40 por minuto deja
// ensayar sin cortes y frena a quien la use como servicio gratis de voces.
// El id de voz va dentro de la URL del proveedor: se acepta sólo si es un id.
const ID_DE_VOZ = /^[A-Za-z0-9_-]{1,64}$/;

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

const AUDIO = { 'Content-Type': 'audio/mpeg' };

/** Sin NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, bucket() lanza: se sigue sin caché. */
function bucketSeguro(fb: NonNullable<ReturnType<typeof obtenerAdmin>>) {
    try {
        return fb.storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    } catch (e) {
        console.warn('[tts] sin bucket de Storage, se sigue sin caché:', e);
        return null;
    }
}

async function llamarProveedor(
    provider: Proveedor, text: string, voz: string, instructions: string, fullInstructions: string, rate: number,
): Promise<Response> {
    try {
        if (provider === 'cartesia') {
            const key = process.env.CARTESIA_API_KEY;
            if (!key) return Response.json({ error: 'no_key', message: 'Falta CARTESIA_API_KEY' }, { status: 503 });
            const emotion = cartesiaEmotion(instructions);
            const r = await fetch('https://api.cartesia.ai/tts/bytes', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${key}`, 'Cartesia-Version': '2026-03-01', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model_id: MODELO.cartesia,
                    transcript: text,
                    voice: { mode: 'id', id: voz },
                    language: 'es',
                    output_format: { container: 'mp3', sample_rate: 44100, bit_rate: 128000 },
                    generation_config: { speed: rate, ...(emotion ? { emotion } : {}) },
                }),
            });
            if (!r.ok) {
                console.error('[tts] cartesia', r.status, (await r.text()).slice(0, 300));
                return Response.json({ error: 'cartesia_error', status: r.status }, { status: 502 });
            }
            return new Response(await r.arrayBuffer(), { status: 200, headers: AUDIO });
        }

        if (provider === 'elevenlabs') {
            const key = process.env.ELEVENLABS_API_KEY;
            if (!key) return Response.json({ error: 'no_key', message: 'Falta ELEVENLABS_API_KEY' }, { status: 503 });
            const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz}`, {
                method: 'POST',
                headers: { 'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
                body: JSON.stringify({
                    text,
                    model_id: MODELO.elevenlabs,
                    voice_settings: { stability: 0.4, similarity_boost: 0.85, style: 0.4, use_speaker_boost: true },
                }),
            });
            if (!r.ok) {
                console.error('[tts] elevenlabs', r.status, (await r.text()).slice(0, 300));
                return Response.json({ error: 'elevenlabs_error', status: r.status }, { status: 502 });
            }
            return new Response(await r.arrayBuffer(), { status: 200, headers: AUDIO });
        }

        // OpenAI por defecto
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return Response.json({ error: 'no_key', message: 'Falta OPENAI_API_KEY' }, { status: 503 });
        const r = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: MODELO.openai, voice: voz, input: text, instructions: fullInstructions, response_format: 'mp3' }),
        });
        if (!r.ok) {
            console.error('[tts] openai', r.status, (await r.text()).slice(0, 300));
            return Response.json({ error: 'openai_error', status: r.status }, { status: 502 });
        }
        return new Response(await r.arrayBuffer(), { status: 200, headers: AUDIO });
    } catch (e) {
        return errorPublico('tts', e, 502, 'fetch_failed');
    }
}

export async function POST(req: NextRequest) {
    const frenado = frenar(req, 'tts', 40);
    if (frenado) return frenado;

    let body: any;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: 'bad_request' }, { status: 400 });
    }

    const provider: Proveedor = ['elevenlabs', 'cartesia'].includes(body?.provider) ? body.provider : 'openai';
    const text: string = (body?.text || '').toString().slice(0, 800);
    const instructions: string = (body?.instructions || '').toString().slice(0, 400);
    const rate: number = Math.min(1.5, Math.max(0.6, Number(body?.rate) || 1));
    if (!text.trim()) return Response.json({ error: 'empty_text' }, { status: 400 });

    const baseStyle = 'Habla en español de España con voz humana y natural, ritmo conversacional realista, entonación expresiva y emoción acorde a la escena; nada de tono de locutor de anuncio.';
    const fullInstructions = instructions ? `${baseStyle} ${instructions}` : baseStyle;

    let voz: string;
    if (provider === 'cartesia') {
        voz = (body?.voice || '').toString();
        if (!ID_DE_VOZ.test(voz)) return Response.json({ error: 'no_voice', message: 'Falta voz de Cartesia' }, { status: 400 });
    } else if (provider === 'elevenlabs') {
        const pedida = (body?.voice || '').toString();
        voz = ID_DE_VOZ.test(pedida) ? pedida : 'EXAVITQu4vr4xnSDxMaL';
    } else {
        voz = OPENAI_VOICES.includes(body?.voice) ? body.voice : 'alloy';
    }

    // En la clave entra solo lo que cambia el audio de ESE proveedor:
    // ElevenLabs ignora instrucciones y velocidad; OpenAI ignora la velocidad.
    const ajustes = provider === 'cartesia' ? `${cartesiaEmotion(instructions) ?? ''}|${rate}`
        : provider === 'openai' ? fullInstructions
        : '';
    const ruta = rutaDeAudio(provider, claveDeAudio({ proveedor: provider, modelo: MODELO[provider], voz, ajustes, texto: text }));

    const fb = obtenerAdmin();
    const bucket = fb ? bucketSeguro(fb) : null;
    const cache = cacheSegura(bucket ? almacenFirebase(bucket) : null);
    const uid = await uidDeLaPeticion(req, fb ? t => fb.auth().verifyIdToken(t) : null);

    const res = await servirTts(text, {
        uid,
        leer: () => cache.leer(ruta),
        guardar: audio => cache.guardar(ruta, audio),
        consumir: (u, n) => (fb ? consumirCaracteres(registroFirestore(fb.firestore()), u, n, limiteDiario()) : Promise.resolve(0)),
        generar: () => llamarProveedor(provider, text, voz, instructions, fullInstructions, rate),
    });
    // Para medir el ahorro: proporción de "hit" sobre el total en los logs de Vercel.
    console.info(`[tts] ${provider} ${res.status} cache=${res.headers.get('X-TTS-Cache') ?? '-'}`);
    return res;
}
