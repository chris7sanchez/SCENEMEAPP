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
    speak(text: string, opts?: { voiceId?: string; rate?: number }): Promise<void>;
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

    speak(text: string, opts?: { voiceId?: string; rate?: number }): Promise<void> {
        return new Promise((resolve) => {
            if (!this.isSupported() || !text || !text.trim()) return resolve();
            try {
                const u = new SpeechSynthesisUtterance(text);
                u.lang = 'es-ES';
                u.rate = opts?.rate ?? 1;
                if (opts?.voiceId) {
                    const v = this.rawVoices().find(vv => vv.voiceURI === opts.voiceId || vv.name === opts.voiceId);
                    if (v) u.voice = v;
                }
                u.onend = () => resolve();
                u.onerror = () => resolve();
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(u);
            } catch {
                resolve();
            }
        });
    }

    cancel(): void {
        if (this.isSupported()) {
            try { window.speechSynthesis.cancel(); } catch { /* noop */ }
        }
    }
}

let instance: SpeechProvider | null = null;

/** Devuelve el proveedor de voz activo (navegador por defecto). */
export function getSpeechProvider(): SpeechProvider {
    if (!instance) instance = new BrowserSpeechProvider();
    return instance;
}

/** Asigna una voz distinta a cada personaje (round-robin sobre las disponibles). */
export function assignVoices(speakers: string[], voices: SpeechVoice[]): Record<string, string | undefined> {
    const map: Record<string, string | undefined> = {};
    speakers.forEach((s, i) => {
        map[s] = voices.length ? voices[i % voices.length].id : undefined;
    });
    return map;
}
