'use client';

// Motor de voz del Modo Ensayo.
//
// Lo que este archivo GARANTIZA al reproductor: speakChecked() siempre resuelve,
// y dice la verdad — {spoken:true} solo si el audio llegó a sonar de verdad.
// Con eso el reproductor puede escalar a otro motor o, como último recurso,
// dejar la réplica en pantalla el tiempo de leerla en vez de saltársela.
//
// Fallos reales que cubre (todos vistos en producción):
//  - Chrome: speechSynthesis se queda "atascado" tras cancel() y speak() no
//    arranca nunca (ni onstart ni onend). -> vigilante de arranque + reintento.
//  - Chrome: getVoices() vacío hasta 'voiceschanged'. -> se espera.
//  - Chrome: corta locuciones largas si no se llama a resume(). -> keepAlive.
//  - iOS/Safari: el audio de la IA no puede empezar fuera de un gesto del
//    usuario. -> unlockAudio() en EMPEZAR + un único <audio> compartido.
//  - Vercel/OpenAI: la petición de voz llega tarde y sonaba encima del turno
//    siguiente. -> AbortController por réplica + precarga de la siguiente.
//  - play() "resuelve" pero no suena (salida bloqueada, pestaña en 2º plano).
//    -> se comprueba que el tiempo avance; si no, se cae a la voz del navegador.

import { estimateReadingMs } from './speech-plan';

export interface SpeechVoice {
    id: string;
    label: string;
    lang: string;
}

export interface SpeakOpts {
    voiceId?: string;
    rate?: number;
    pitch?: number;
    instructions?: string;
    /** Motores IA: no caer a la voz del navegador si fallan (ya se probó y no sonó). */
    noFallback?: boolean;
}

export interface SpeakResult {
    /** true solo si el audio llegó a sonar. */
    spoken: boolean;
    /** Motivo cuando no sonó ('cancelled' = lo cancelamos nosotros al cambiar de turno). */
    reason?: string;
}

export interface SpeechProvider {
    isSupported(): boolean;
    listVoices(): SpeechVoice[];
    /** Compatibilidad: resuelve cuando termina (o si no hay soporte/texto). */
    speak(text: string, opts?: SpeakOpts): Promise<void>;
    /** Igual que speak(), pero cuenta si de verdad sonó. */
    speakChecked(text: string, opts?: SpeakOpts): Promise<SpeakResult>;
    /** Deja el audio listo sin reproducirlo (motores IA). */
    prefetch(text: string, opts?: SpeakOpts): Promise<void>;
    cancel(): void;
}

// ---------------------------------------------------------------------------
// Desbloqueo de audio DENTRO de un gesto del usuario (pulsar EMPEZAR).
// ---------------------------------------------------------------------------

/** WAV mudo mínimo: sirve para "estrenar" un <audio> dentro del gesto. */
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

let sharedAudio: HTMLAudioElement | null = null;
let sharedCtx: AudioContext | null = null;
let audioUnlocked = false;

/**
 * Llamar SIEMPRE desde un gesto del usuario. Prepara: la síntesis del navegador
 * (primeSpeech), un <audio> compartido ya "tocado" (iOS solo deja reproducir
 * elementos que arrancaron en un gesto) y un AudioContext reanudado (el micro
 * del avance por voz lo necesita; fuera de un gesto iOS lo deja suspendido).
 */
export function unlockAudio(): void {
    if (typeof window === 'undefined') return;
    primeSpeech();
    try {
        if (!sharedAudio) {
            sharedAudio = document.createElement('audio');
            sharedAudio.setAttribute('playsinline', '');
            sharedAudio.preload = 'auto';
        }
        sharedAudio.muted = false;
        sharedAudio.src = SILENT_WAV;
        const p = sharedAudio.play();
        if (p && p.then) p.then(() => { audioUnlocked = true; }, () => { /* se intentará igual */ });
    } catch { /* */ }
    try {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AC) {
            if (!sharedCtx) sharedCtx = new AC();
            sharedCtx?.resume?.().catch(() => {});
        }
    } catch { /* */ }
}

/** AudioContext creado en el gesto de EMPEZAR (o null si aún no se ha pulsado). */
export function getSharedAudioContext(): AudioContext | null {
    return sharedCtx;
}

export function isAudioUnlocked(): boolean {
    return audioUnlocked;
}

// ---------------------------------------------------------------------------
// Voz del navegador
// ---------------------------------------------------------------------------

class BrowserSpeechProvider implements SpeechProvider {
    private lastCancelAt = 0;
    private cancelling = false;
    private current: SpeechSynthesisUtterance | null = null;
    /** Generación de la llamada viva: una nueva speakChecked() deja obsoleta a la anterior.
     *  Evita que dos locuciones solapadas (StrictMode, REPEAT rápido) se cancelen entre sí
     *  y el reproductor se quede esperando a la que nunca sonará. */
    private gen = 0;

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

    /** Chrome devuelve [] hasta que dispara 'voiceschanged': esperamos un poco. */
    private ensureVoices(maxMs = 900): Promise<void> {
        return new Promise(resolve => {
            if (!this.isSupported() || window.speechSynthesis.getVoices().length) return resolve();
            let done = false;
            const fin = () => { if (!done) { done = true; resolve(); } };
            const prev = window.speechSynthesis.onvoiceschanged;
            window.speechSynthesis.onvoiceschanged = (ev) => { try { (prev as any)?.call(window.speechSynthesis, ev); } catch { /* */ } fin(); };
            setTimeout(fin, maxMs);
        });
    }

    async speak(text: string, opts?: SpeakOpts): Promise<void> {
        await this.speakChecked(text, opts);
    }

    async prefetch(): Promise<void> { /* nada que precargar */ }

    async speakChecked(text: string, opts?: SpeakOpts): Promise<SpeakResult> {
        if (!text || !text.trim()) return { spoken: false, reason: 'empty' };
        const rate = opts?.rate ?? 1;
        const estimateMs = estimateReadingMs(text, rate);
        if (!this.isSupported()) {
            await wait(estimateMs);
            return { spoken: false, reason: 'unsupported' };
        }
        // Esta llamada pasa a ser LA viva: cualquier otra en curso queda obsoleta.
        const myGen = ++this.gen;
        await this.ensureVoices();
        if (myGen !== this.gen) return { spoken: false, reason: 'cancelled' };
        // Pestaña oculta: Chrome deja la locución en cola sin arrancarla nunca.
        // El reproductor ya espera a que se vea; aquí solo un pequeño colchón.
        const visible = await waitVisible(2500);
        if (myGen !== this.gen) return { spoken: false, reason: 'cancelled' };
        if (!visible) return { spoken: false, reason: 'hidden-tab' };

        // Hasta dos intentos: si el motor está atascado (no dispara onstart),
        // se cancela y se vuelve a lanzar una vez.
        for (let attempt = 0; attempt < 2; attempt++) {
            const r = await this.once(text, opts, rate, estimateMs, myGen);
            if (r.spoken || r.reason === 'cancelled') return r;
            if (myGen !== this.gen) return { spoken: false, reason: 'cancelled' };
            if (attempt === 0) {
                try { window.speechSynthesis.cancel(); } catch { /* */ }
                await wait(220);
                if (myGen !== this.gen) return { spoken: false, reason: 'cancelled' };
            }
        }
        return { spoken: false, reason: 'no-start' };
    }

    private once(text: string, opts: SpeakOpts | undefined, rate: number, estimateMs: number, myGen: number): Promise<SpeakResult> {
        return new Promise(resolve => {
            let done = false;
            let started = false;
            const stale = () => myGen !== this.gen;
            let keepAlive: ReturnType<typeof setInterval> | undefined;
            let watchdog: ReturnType<typeof setTimeout> | undefined;
            let cap: ReturnType<typeof setTimeout> | undefined;
            const finish = (res: SpeakResult) => {
                if (done) return;
                done = true;
                if (keepAlive) clearInterval(keepAlive);
                if (watchdog) clearTimeout(watchdog);
                if (cap) clearTimeout(cap);
                resolve(res);
            };
            try {
                const ss = window.speechSynthesis;
                const u = new SpeechSynthesisUtterance(text);
                u.lang = 'es-ES';
                u.rate = rate;
                u.pitch = opts?.pitch ?? 1;
                const voices = this.rawVoices();
                let v: SpeechSynthesisVoice | undefined;
                if (opts?.voiceId) v = voices.find(vv => vv.voiceURI === opts.voiceId || vv.name === opts.voiceId);
                if (!v) v = voices.find(vv => /^es/i.test(vv.lang));
                if (v) u.voice = v;
                u.onstart = () => { started = true; };
                u.onend = () => finish({ spoken: started, reason: started ? undefined : 'ended-without-start' });
                u.onerror = (e: any) => {
                    const err = String(e?.error || 'error');
                    if (stale() || this.cancelling) {
                        // Lo cancelamos nosotros (cambio de turno) o llegó otra llamada más nueva.
                        finish({ spoken: started, reason: 'cancelled' });
                    } else if (err === 'interrupted' || err === 'canceled') {
                        // Nos lo ha cancelado el navegador (otra pestaña, el sistema...): reintentar.
                        finish({ spoken: started, reason: started ? undefined : 'no-start' });
                    } else {
                        finish({ spoken: started, reason: 'error:' + err });
                    }
                };
                this.current = u;
                this.cancelling = false;
                const fire = () => {
                    if (stale()) return finish({ spoken: false, reason: 'cancelled' });
                    try { ss.speak(u); ss.resume(); } catch { finish({ spoken: false, reason: 'throw' }); }
                };
                // Bug de Chrome: speak() pegado a un cancel() se pierde. Respiro.
                if (ss.speaking || ss.pending) { ss.cancel(); this.lastCancelAt = Date.now(); setTimeout(fire, 160); }
                else if (Date.now() - this.lastCancelAt < 250) { setTimeout(fire, 180); }
                else { fire(); }
                // Chrome corta locuciones largas si no se le "recuerda" que siga.
                keepAlive = setInterval(() => { try { ss.resume(); } catch { /* */ } }, 4000);
                // Vigilante de arranque: si en 1,5 s no ha empezado, el motor está atascado.
                watchdog = setTimeout(() => { if (!started) finish({ spoken: false, reason: stale() ? 'cancelled' : 'no-start' }); }, 1500 + 200);
                // Tope absoluto: si empezó pero onend nunca llega, damos la línea por dicha.
                cap = setTimeout(() => finish({ spoken: started, reason: started ? undefined : 'no-start' }), estimateMs * 2 + 2000);
            } catch {
                finish({ spoken: false, reason: 'throw' });
            }
        });
    }

    cancel(): void {
        this.gen++; // la locución viva queda obsoleta
        if (this.isSupported()) {
            try {
                this.cancelling = true;
                window.speechSynthesis.cancel();
                this.lastCancelAt = Date.now();
            } catch { /* noop */ }
        }
        this.current = null;
    }
}

// ---------------------------------------------------------------------------
// Voz IA (OpenAI / ElevenLabs / Cartesia) vía /api/tts
// ---------------------------------------------------------------------------

class AiSpeechProvider implements SpeechProvider {
    private fallback = new BrowserSpeechProvider();
    private cache = new Map<string, string>();
    private inflight = new Map<string, Promise<string>>();
    private controller: AbortController | null = null;
    private currentEl: HTMLAudioElement | null = null;
    private provider: 'openai' | 'elevenlabs' | 'cartesia';

    constructor(provider: 'openai' | 'elevenlabs' | 'cartesia' = 'openai') { this.provider = provider; }

    isSupported(): boolean { return typeof window !== 'undefined' && typeof Audio !== 'undefined'; }

    listVoices(): SpeechVoice[] {
        if (this.provider === 'elevenlabs') return ELEVENLABS_VOICES;
        if (this.provider === 'cartesia') return []; // dinámicas: las trae el reproductor de /api/tts/voices
        return OPENAI_TTS_VOICES;
    }

    private key(text: string, opts?: SpeakOpts): { key: string; body: any } {
        const defaultVoice = this.provider === 'elevenlabs' ? ELEVENLABS_VOICES[0].id : (this.provider === 'cartesia' ? '' : 'alloy');
        const voice = opts?.voiceId || defaultVoice;
        const instructions = opts?.instructions || '';
        const rate = opts?.rate ?? 1;
        return {
            key: `${this.provider}|${voice}|${instructions}|${rate}|${text}`,
            body: { text, voice, instructions, provider: this.provider, rate },
        };
    }

    /** Pide el audio (una sola vez por réplica; las peticiones iguales se comparten). */
    private fetchUrl(text: string, opts: SpeakOpts | undefined, signal?: AbortSignal): Promise<string> {
        const { key, body } = this.key(text, opts);
        const hit = this.cache.get(key);
        if (hit) return Promise.resolve(hit);
        const going = this.inflight.get(key);
        if (going) return going;
        const p = (async () => {
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal,
            });
            if (!res.ok) throw new Error('tts_' + res.status);
            const blob = await res.blob();
            if (!blob.size) throw new Error('tts_empty');
            const url = URL.createObjectURL(blob);
            this.cache.set(key, url);
            return url;
        })();
        this.inflight.set(key, p);
        p.finally(() => this.inflight.delete(key)).catch(() => {});
        return p;
    }

    async prefetch(text: string, opts?: SpeakOpts): Promise<void> {
        if (!text || !text.trim()) return;
        try { await this.fetchUrl(text, opts); } catch { /* si falla, ya se verá al hablar */ }
    }

    async speak(text: string, opts?: SpeakOpts): Promise<void> {
        await this.speakChecked(text, opts);
    }

    async speakChecked(text: string, opts?: SpeakOpts): Promise<SpeakResult> {
        if (!text || !text.trim()) return { spoken: false, reason: 'empty' };
        // Cualquier petición anterior aún en vuelo queda cancelada: nunca sonará
        // una réplica antigua encima del turno siguiente.
        this.controller?.abort();
        const ctl = new AbortController();
        this.controller = ctl;

        let url: string;
        try {
            url = await this.fetchUrl(text, opts, ctl.signal);
        } catch (e: any) {
            if (ctl.signal.aborted) return { spoken: false, reason: 'cancelled' };
            if (opts?.noFallback) return { spoken: false, reason: 'tts-failed:' + String(e?.message || e) };
            // Sin clave, error del proveedor o de red -> voz del navegador.
            const r = await this.fallback.speakChecked(text, { rate: opts?.rate, pitch: opts?.pitch });
            return r.spoken ? r : { spoken: false, reason: 'tts-failed+' + (r.reason || '') + ':' + String(e?.message || e) };
        }
        if (ctl.signal.aborted) return { spoken: false, reason: 'cancelled' };

        const played = await this.playUrl(url, opts, ctl.signal);
        if (played.spoken || played.reason === 'cancelled') return played;
        if (opts?.noFallback) return played;
        // El audio no llegó a sonar (autoplay bloqueado, salida muda...): navegador.
        const r = await this.fallback.speakChecked(text, { rate: opts?.rate, pitch: opts?.pitch });
        return r.spoken ? r : { spoken: false, reason: 'play-failed+' + (r.reason || '') };
    }

    private playUrl(url: string, opts: SpeakOpts | undefined, signal: AbortSignal): Promise<SpeakResult> {
        return new Promise(resolve => {
            let done = false;
            let started = false;
            let starter: ReturnType<typeof setTimeout> | undefined;
            let cap: ReturnType<typeof setTimeout> | undefined;
            // Reutilizamos el <audio> desbloqueado en el gesto (iOS); si no lo hay, uno nuevo.
            const el = sharedAudio || new Audio();
            const finish = (res: SpeakResult) => {
                if (done) return;
                done = true;
                if (starter) clearTimeout(starter);
                if (cap) clearTimeout(cap);
                el.onended = null; el.onerror = null; el.onplaying = null; el.ontimeupdate = null;
                resolve(res);
            };
            const onAbort = () => { try { el.pause(); } catch { /* */ } finish({ spoken: started, reason: 'cancelled' }); };
            if (signal.aborted) return onAbort();
            signal.addEventListener('abort', onAbort, { once: true });
            try {
                this.currentEl = el;
                el.pause();
                el.src = url;
                el.currentTime = 0;
                // Cartesia ya aplica la velocidad en el servidor; no la dupliques aquí.
                el.playbackRate = (opts?.rate && this.provider !== 'cartesia') ? opts.rate : 1;
                el.onplaying = () => { started = true; };
                el.ontimeupdate = () => { if (el.currentTime > 0.05) started = true; };
                el.onended = () => finish({ spoken: true });
                el.onerror = () => finish({ spoken: started, reason: started ? undefined : 'media-error' });
                el.load();
                const p = el.play();
                if (p && p.catch) p.catch((err: any) => finish({ spoken: false, reason: 'play-rejected:' + (err?.name || 'error') }));
                // Si en 2 s no ha avanzado el tiempo, no está sonando aunque play() "resolviera".
                starter = setTimeout(() => { if (!started) { try { el.pause(); } catch { /* */ } finish({ spoken: false, reason: 'no-progress' }); } }, 2000);
                // Tope: una vez sonando, si 'ended' nunca llega, damos la línea por dicha.
                cap = setTimeout(() => finish({ spoken: started, reason: started ? undefined : 'no-progress' }), 45000);
            } catch (e: any) {
                finish({ spoken: false, reason: 'throw:' + String(e?.message || e) });
            }
        });
    }

    cancel(): void {
        try { this.controller?.abort(); } catch { /* */ }
        try { if (this.currentEl) { this.currentEl.pause(); this.currentEl.currentTime = 0; } } catch { /* */ }
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
 * Chrome silencia la voz si el primer speak() ocurre fuera de un gesto.
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

function wait(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
}

/** Espera (con tope; 0 = sin tope) a que la pestaña vuelva a estar visible. Resuelve true si lo está. */
export function waitVisible(maxMs: number): Promise<boolean> {
    return new Promise(resolve => {
        if (typeof document === 'undefined' || document.visibilityState !== 'hidden') return resolve(true);
        let done = false;
        const fin = (ok: boolean) => { if (done) return; done = true; document.removeEventListener('visibilitychange', onVis); resolve(ok); };
        const onVis = () => { if (document.visibilityState !== 'hidden') fin(true); };
        document.addEventListener('visibilitychange', onVis);
        if (maxMs > 0) setTimeout(() => fin(document.visibilityState !== 'hidden'), maxMs);
    });
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
