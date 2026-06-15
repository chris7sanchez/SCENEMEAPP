'use client';

// Motor de voz para el Modo Ensayo. Empezamos con la Web Speech API del
// navegador (gratis, sin clave). La interfaz deja enchufar una voz IA después
// sin tocar el reproductor: solo cambiar la factory getSpeechProvider().

export interface SpeechVoice {
    id: string;
    label: string;
    lang: string;
}

export interface SpeechProvider {
    isSupported(): boolean;
    listVoices(): SpeechVoice[];
    /** Resuelve cuando termina de hablar (o si no hay soporte/texto). */
    speak(text: string, opts?: { voiceId?: string; rate?: number; pitch?: number; instructions?: string }): Promise<void>;
    cancel(): void;
}

class BrowserSpeechProvider implements SpeechProvider {
    isSupported(): boolean {
        return typeof window !== 'undefined' && 'speechSynthesis' in window;
    }

    private rawVoices(): SpeechSynthesisVoice[] {
        if (!this.isSupported()) return [];
        const all = window.speechSynthesis.getVoices() || [];
        const es = all.filter(v => /^es/i.test(v.lang));
        return es.length ? es : all;
    }

    listVoices(): SpeechVoice[] {
        return this.rawVoices().map(v => ({ id: v.voiceURI, label: v.name, lang: v.lang }));
    }

    speak(text: string, opts?: { voiceId?: string; rate?: number; pitch?: number }): Promise<void> {
        return new Promise((resolve) => {
            if (!text || !text.trim()) return resolve();
            let done = false;
            let keepAlive: ReturnType<typeof setInterval> | undefined;
            const finish = () => { if (!done) { done = true; if (keepAlive) clearInterval(keepAlive); resolve(); } };
            // Tiempo estimado de lectura: garantiza el avance aunque la voz del
            // navegador no dispare onend (sin motor/voz instalada) o falle el audio.
            const rate = opts?.rate ?? 1;
            const estimateMs = Math.min(26000, Math.max(2200, (text.length / (rate || 1)) * 95)) + 1200;
            if (!this.isSupported()) { setTimeout(finish, estimateMs); return; }
            try {
                const u = new SpeechSynthesisUtterance(text);
                u.lang = 'es-ES';
                u.rate = rate;
                u.pitch = opts?.pitch ?? 1;
                const voices = this.rawVoices();
                let v: SpeechSynthesisVoice | undefined;
                if (opts?.voiceId) v = voices.find(vv => vv.voiceURI === opts.voiceId || vv.name === opts.voiceId);
                if (!v) v = voices.find(vv => /^es/i.test(vv.lang)); // por defecto, una voz española
                if (v) u.voice = v;
                u.onend = finish;
                u.onerror = finish;
                const ss = window.speechSynthesis;
                const fire = () => { try { ss.speak(u); ss.resume(); } catch { /* */ } };
                // Bug de Chrome: cancel() justo antes de speak() puede "tragarse" la
                // locución (Safari no lo sufre). Solo cancelamos si ya hay algo sonando,
                // y damos un respiro antes de hablar.
                if (ss.speaking || ss.pending) { ss.cancel(); setTimeout(fire, 140); } else { fire(); }
                keepAlive = setInterval(() => { try { ss.resume(); } catch { /* */ } }, 4000);
                // Red de seguridad: si nunca llega onend/onerror, avanzar igual.
                setTimeout(finish, estimateMs);
            } catch {
                setTimeout(finish, estimateMs);
            }
        });
    }

    cancel(): void {
        if (this.isSupported()) {
            try { window.speechSynthesis.cancel(); } catch { /* noop */ }
        }
    }
}

// Motor IA: pide el audio a /api/tts (OpenAI) y lo reproduce. Cachea por sesión.
// Si la generación falla (p. ej. sin clave), cae a la voz del navegador.
class AiSpeechProvider implements SpeechProvider {
    private fallback = new BrowserSpeechProvider();
    private cache = new Map<string, string>();
    private current: HTMLAudioElement | null = null;
    private provider: 'openai' | 'elevenlabs' | 'cartesia';
    constructor(provider: 'openai' | 'elevenlabs' | 'cartesia' = 'openai') { this.provider = provider; }

    isSupported(): boolean { return typeof window !== 'undefined' && typeof Audio !== 'undefined'; }
    listVoices(): SpeechVoice[] {
        if (this.provider === 'elevenlabs') return ELEVENLABS_VOICES;
        if (this.provider === 'cartesia') return []; // dinámicas: las trae el reproductor de /api/tts/voices
        return OPENAI_TTS_VOICES;
    }

    async speak(text: string, opts?: { voiceId?: string; rate?: number; instructions?: string }): Promise<void> {
        if (!text || !text.trim()) return;
        const defaultVoice = this.provider === 'elevenlabs' ? ELEVENLABS_VOICES[0].id : (this.provider === 'cartesia' ? '' : 'alloy');
        const voice = opts?.voiceId || defaultVoice;
        const instructions = opts?.instructions || '';
        const rate = opts?.rate ?? 1;
        const key = `${this.provider}|${voice}|${instructions}|${rate}|${text}`;
        try {
            let url = this.cache.get(key);
            if (!url) {
                const res = await fetch('/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, voice, instructions, provider: this.provider, rate }),
                });
                if (!res.ok) throw new Error('tts_' + res.status);
                const blob = await res.blob();
                url = URL.createObjectURL(blob);
                this.cache.set(key, url);
            }
            await new Promise<void>((resolve) => {
                const audio = new Audio(url);
                // Cartesia ya aplica la velocidad en el servidor; no la dupliques aquí.
                if (opts?.rate && this.provider !== 'cartesia') audio.playbackRate = opts.rate;
                this.current = audio;
                audio.onended = () => resolve();
                audio.onerror = () => resolve();
                audio.play().catch(() => resolve());
            });
        } catch {
            // Sin clave o error de red -> voz del navegador para no bloquear.
            await this.fallback.speak(text, { voiceId: undefined, rate: opts?.rate });
        }
    }

    cancel(): void {
        try { if (this.current) { this.current.pause(); this.current.currentTime = 0; } } catch { /* */ }
        this.fallback.cancel();
    }
}

let browserInstance: SpeechProvider | null = null;
let aiInstance: SpeechProvider | null = null;
let elevenInstance: SpeechProvider | null = null;
let cartesiaInstance: SpeechProvider | null = null;

/** Proveedor de voz: 'browser' (def.), 'ai' (OpenAI), 'eleven' (ElevenLabs) o 'cartesia'. */
export function getSpeechProvider(mode: 'browser' | 'ai' | 'eleven' | 'cartesia' = 'browser'): SpeechProvider {
    if (mode === 'ai') {
        if (!aiInstance) aiInstance = new AiSpeechProvider('openai');
        return aiInstance;
    }
    if (mode === 'eleven') {
        if (!elevenInstance) elevenInstance = new AiSpeechProvider('elevenlabs');
        return elevenInstance;
    }
    if (mode === 'cartesia') {
        if (!cartesiaInstance) cartesiaInstance = new AiSpeechProvider('cartesia');
        return cartesiaInstance;
    }
    if (!browserInstance) browserInstance = new BrowserSpeechProvider();
    return browserInstance;
}

/**
 * Desbloquea la síntesis de voz DENTRO de un gesto del usuario (pulsar EMPEZAR).
 * Chrome silencia la voz si el primer speak() ocurre fuera de un gesto (en un
 * efecto); este "calentamiento" silencioso la habilita para todo el ensayo.
 * Safari no lo necesita, pero llamarlo no molesta.
 */
export function primeSpeech(): void {
    try {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        window.speechSynthesis.speak(u);
        window.speechSynthesis.resume();
    } catch { /* */ }
}

/** Asigna una voz distinta a cada personaje (round-robin sobre las disponibles). */
export function assignVoices(speakers: string[], voices: SpeechVoice[]): Record<string, string | undefined> {
    const map: Record<string, string | undefined> = {};
    speakers.forEach((s, i) => {
        map[s] = voices.length ? voices[i % voices.length].id : undefined;
    });
    return map;
}

// --- Perfil de voz por personaje ---

export interface VoiceProfile {
    voiceId?: string;
    rate: number;   // velocidad 0.5–1.6
    pitch: number;  // gravedad/tono 0.5–1.6
    pauseMs: number; // pausa tras la frase, en ms
    manner: string;  // preset de "manera de hablar" (motor navegador)
    instructions?: string; // "cómo habla" para la voz IA (OpenAI)
}

// Voces de OpenAI gpt-4o-mini-tts (para el motor IA).
export const OPENAI_TTS_VOICES: SpeechVoice[] = [
    { id: 'alloy', label: 'Alloy (neutra)', lang: 'multi' },
    { id: 'ash', label: 'Ash (grave)', lang: 'multi' },
    { id: 'ballad', label: 'Ballad (cálida)', lang: 'multi' },
    { id: 'coral', label: 'Coral (femenina)', lang: 'multi' },
    { id: 'echo', label: 'Echo (masculina)', lang: 'multi' },
    { id: 'fable', label: 'Fable (expresiva)', lang: 'multi' },
    { id: 'onyx', label: 'Onyx (profunda)', lang: 'multi' },
    { id: 'nova', label: 'Nova (joven)', lang: 'multi' },
    { id: 'sage', label: 'Sage (serena)', lang: 'multi' },
    { id: 'shimmer', label: 'Shimmer (luminosa)', lang: 'multi' },
];

// Voces premade de ElevenLabs (multilingüe v2, hablan español). El id es el voice_id.
export const ELEVENLABS_VOICES: SpeechVoice[] = [
    { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Bella (femenina, suave)', lang: 'multi' },
    { id: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel (femenina, serena)', lang: 'multi' },
    { id: 'AZnzlk1XvdvUeBnXmlld', label: 'Domi (femenina, intensa)', lang: 'multi' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', label: 'Elli (femenina, joven)', lang: 'multi' },
    { id: 'ErXwobaYiN019PkySvjV', label: 'Antoni (masculina, cálida)', lang: 'multi' },
    { id: 'pNInz6obpgDQGcFmaJgB', label: 'Adam (masculina, profunda)', lang: 'multi' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', label: 'Josh (masculina, joven)', lang: 'multi' },
    { id: 'VR6AewLTigWG4xSOukaG', label: 'Arnold (masculina, firme)', lang: 'multi' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', label: 'Sam (masculina, neutra)', lang: 'multi' },
];

export const DEFAULT_PROFILE: VoiceProfile = { rate: 1, pitch: 1, pauseMs: 350, manner: 'neutro' };

// Presets de "manera de hablar" que mapean a velocidad + tono.
export const MANNER_PRESETS: { id: string; label: string; rate: number; pitch: number }[] = [
    { id: 'neutro', label: 'Neutro', rate: 1, pitch: 1 },
    { id: 'grave', label: 'Grave y lento', rate: 0.85, pitch: 0.7 },
    { id: 'energico', label: 'Enérgico', rate: 1.2, pitch: 1.15 },
    { id: 'frio', label: 'Frío / cortante', rate: 0.95, pitch: 0.8 },
    { id: 'calido', label: 'Cálido / cercano', rate: 0.92, pitch: 1.08 },
    { id: 'nervioso', label: 'Nervioso / rápido', rate: 1.3, pitch: 1.1 },
];

export function applyManner(profile: VoiceProfile, mannerId: string): VoiceProfile {
    const p = MANNER_PRESETS.find(m => m.id === mannerId);
    if (!p) return { ...profile, manner: mannerId };
    return { ...profile, manner: mannerId, rate: p.rate, pitch: p.pitch };
}

/** Construye un perfil por personaje, repartiendo voces distintas (round-robin). */
export function buildProfiles(speakers: string[], voices: SpeechVoice[]): Record<string, VoiceProfile> {
    const map: Record<string, VoiceProfile> = {};
    speakers.forEach((s, i) => {
        map[s] = { ...DEFAULT_PROFILE, voiceId: voices.length ? voices[i % voices.length].id : undefined };
    });
    return map;
}
