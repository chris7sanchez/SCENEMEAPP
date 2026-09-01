import { describe, it, expect } from 'vitest';
import { VoiceTrigger } from './voice-advance';

// Simula una secuencia [rms, duraciónMs] alimentando muestras cada 16 ms.
function run(trigger: VoiceTrigger, segments: [number, number][], startAt = 0): number | null {
    let t = startAt;
    for (const [rms, ms] of segments) {
        const end = t + ms;
        while (t < end) {
            if (trigger.sample(rms, t)) return t;
            t += 16;
        }
    }
    return null;
}

describe('VoiceTrigger (avance por voz del ensayo)', () => {
    it('dispara tras hablar y callar el silencio requerido', () => {
        const tr = new VoiceTrigger();
        const firedAt = run(tr, [
            [0.005, 600],  // silencio inicial
            [0.08, 900],   // tu frase
            [0.005, 2000], // callas -> debe disparar a los ~1100ms de silencio
        ]);
        expect(firedAt).not.toBeNull();
        expect(tr.done).toBe(true);
    });

    it('NO dispara sin haber hablado (silencio infinito)', () => {
        const tr = new VoiceTrigger();
        expect(run(tr, [[0.005, 10000]])).toBeNull();
        expect(tr.heard).toBe(false);
    });

    it('ignora un ruido breve (golpe) que no llega al mínimo de habla', () => {
        const tr = new VoiceTrigger();
        expect(run(tr, [
            [0.005, 500],
            [0.2, 100],    // golpe de 100ms < minVoicedMs
            [0.005, 5000],
        ])).toBeNull();
    });

    it('ignora la ventana inicial (cola de la voz IA en los altavoces)', () => {
        const tr = new VoiceTrigger();
        // Sonido fuerte solo durante la ventana de armado: no cuenta como habla.
        expect(run(tr, [
            [0.2, 300],    // dentro de armDelayMs (350)
            [0.005, 5000],
        ])).toBeNull();
    });

    it('dispara UNA sola vez por turno', () => {
        const tr = new VoiceTrigger();
        const firedAt = run(tr, [[0.08, 800], [0.005, 3000]]);
        expect(firedAt).not.toBeNull();
        // Tras disparar, más habla+silencio no vuelve a disparar.
        expect(run(tr, [[0.08, 800], [0.005, 3000]], (firedAt as number) + 16)).toBeNull();
    });

    it('acumula habla aunque haya pausas cortas entre palabras', () => {
        const tr = new VoiceTrigger();
        const firedAt = run(tr, [
            [0.005, 600],  // silencio inicial (pasa la ventana de armado)
            [0.08, 150],   // palabra
            [0.005, 300],  // pausa corta (no dispara: aún no hay habla mínima)
            [0.08, 150],   // otra palabra -> acumulado 300ms >= 250
            [0.005, 2000], // silencio final -> dispara
        ]);
        expect(firedAt).not.toBeNull();
    });
});
