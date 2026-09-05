import { describe, it, expect } from 'vitest';
import { estimateReadingMs, fallbackEngine, nextPartnerIndex, delayAfterReply } from './speech-plan';

describe('speech-plan (decisiones puras del motor de voz)', () => {
    it('estima un tiempo de lectura acotado', () => {
        expect(estimateReadingMs('Hola.')).toBe(2200 + 1200);           // mínimo
        expect(estimateReadingMs('a'.repeat(1000))).toBe(26000 + 1200); // máximo
        const corto = estimateReadingMs('Una frase normal de una réplica.');
        expect(corto).toBeGreaterThan(3400);
        expect(corto).toBeLessThan(27200);
        // más rápido de habla -> menos tiempo
        expect(estimateReadingMs('a'.repeat(100), 1.5)).toBeLessThan(estimateReadingMs('a'.repeat(100), 1));
    });

    it('el navegador escala a la IA; los motores IA ya caen al navegador por dentro', () => {
        expect(fallbackEngine('browser')).toBe('ai');
        expect(fallbackEngine('ai')).toBeNull();
        expect(fallbackEngine('eleven')).toBeNull();
        expect(fallbackEngine('cartesia')).toBeNull();
    });

    it('encuentra el siguiente turno de la réplica saltando los míos', () => {
        const turns = [{ speaker: 'LUIS' }, { speaker: 'ANA' }, { speaker: 'ANA' }, { speaker: 'LUIS' }];
        expect(nextPartnerIndex(turns, 0, 'ANA')).toBe(3);
        expect(nextPartnerIndex(turns, 3, 'ANA')).toBe(-1);
        expect(nextPartnerIndex(turns, -1, 'ANA')).toBe(0);
    });

    it('si la voz no sonó, no salta la línea: deja tiempo de leerla', () => {
        expect(delayAfterReply(true, 350, 'Lo que sea.')).toBe(350);
        expect(delayAfterReply(false, 350, 'Lo que sea.')).toBe(estimateReadingMs('Lo que sea.'));
    });
});
