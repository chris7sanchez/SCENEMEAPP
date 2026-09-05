// Decisiones PURAS del motor de voz del ensayo (sin DOM), para poder testearlas.

export type EngineId = 'browser' | 'ai' | 'eleven' | 'cartesia';

/** Tiempo razonable de lectura de una réplica, en ms (sirve de red de seguridad). */
export function estimateReadingMs(text: string, rate = 1): number {
    const r = rate > 0 ? rate : 1;
    const base = (text.trim().length / r) * 95;
    return Math.min(26000, Math.max(2200, base)) + 1200;
}

/** Con qué motor se reintenta si el elegido no llega a sonar. */
export function fallbackEngine(engine: EngineId): EngineId | null {
    // Los motores IA ya caen a la voz del navegador por dentro; si la voz del
    // navegador falla, el único plan B es la IA (si hay clave, sonará).
    return engine === 'browser' ? 'ai' : null;
}

/** Índice del siguiente turno de la RÉPLICA a partir de `from` (exclusivo). */
export function nextPartnerIndex(
    turns: { speaker: string }[],
    from: number,
    myRole: string,
): number {
    for (let i = from + 1; i < turns.length; i++) {
        if (turns[i].speaker !== myRole) return i;
    }
    return -1;
}

/** Cuánto esperar antes de pasar al turno siguiente tras una réplica. */
export function delayAfterReply(spoken: boolean, pauseMs: number, text: string, rate = 1): number {
    // Si la voz sonó: la pausa dramática configurada. Si NO sonó, no se salta la
    // línea en silencio: se deja en pantalla el tiempo de leerla.
    return spoken ? pauseMs : estimateReadingMs(text, rate);
}
