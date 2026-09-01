// Disparador de "avance por voz" del Modo Ensayo. Lógica pura y testeable:
// recibe muestras de volumen (RMS) con su instante y decide cuándo has
// terminado de decir tu frase (hablaste lo suficiente y luego callaste).
//
// Reglas que lo hacen robusto:
//  - Ignora los primeros ms (cola de la voz IA saliendo por los altavoces).
//  - Exige un mínimo de habla ACUMULADA antes de armar el disparo (un golpe
//    de puerta o un chasquido no cuentan como "tu frase").
//  - Dispara una sola vez por turno.

export interface VoiceTriggerOpts {
    /** RMS por encima del cual se considera que estás hablando. */
    speakRms?: number;
    /** RMS por debajo del cual se considera silencio. */
    silenceRms?: number;
    /** Habla acumulada mínima (ms) para armar el disparo. */
    minVoicedMs?: number;
    /** Silencio continuo (ms) tras hablar para disparar el avance. */
    silenceMs?: number;
    /** Ventana inicial (ms) que se ignora al armar el turno. */
    armDelayMs?: number;
}

const DEFAULTS: Required<VoiceTriggerOpts> = {
    speakRms: 0.03,
    silenceRms: 0.02,
    minVoicedMs: 250,
    silenceMs: 1100,
    armDelayMs: 350,
};

export class VoiceTrigger {
    private opts: Required<VoiceTriggerOpts>;
    private t0: number | null = null;
    private lastT = 0;
    private voicedMs = 0;
    private silenceStart = 0;
    private fired = false;

    constructor(opts?: VoiceTriggerOpts) {
        this.opts = { ...DEFAULTS, ...opts };
    }

    /** ¿Ya te ha oído lo suficiente como para avanzar cuando calles? */
    get heard(): boolean {
        return this.voicedMs >= this.opts.minVoicedMs;
    }

    /** ¿Ya disparó el avance de este turno? */
    get done(): boolean {
        return this.fired;
    }

    /**
     * Procesa una muestra de volumen. Devuelve true UNA sola vez, en el
     * momento en que toca avanzar a la siguiente línea.
     */
    sample(rms: number, now: number): boolean {
        if (this.fired) return false;
        if (this.t0 === null) { this.t0 = now; this.lastT = now; return false; }
        if (now - this.t0 < this.opts.armDelayMs) { this.lastT = now; return false; }

        const dt = Math.max(0, now - this.lastT);
        this.lastT = now;

        if (rms > this.opts.speakRms) {
            this.voicedMs += dt;
            this.silenceStart = 0;
            return false;
        }

        if (this.heard && rms < this.opts.silenceRms) {
            if (!this.silenceStart) this.silenceStart = now;
            else if (now - this.silenceStart >= this.opts.silenceMs) {
                this.fired = true;
                return true;
            }
        }
        return false;
    }
}
