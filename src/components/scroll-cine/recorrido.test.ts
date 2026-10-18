import { describe, it, expect } from 'vitest';
import { N, FRAME_CLAVE, clamp, rampa, ventana, frameDe, tc, progreso } from './recorrido';

describe('rampa y ventana', () => {
    it('rampa es 0 antes, 1 después y lineal en medio', () => {
        expect(rampa(0.1, 0.2, 0.4)).toBe(0);
        expect(rampa(0.5, 0.2, 0.4)).toBe(1);
        expect(rampa(0.3, 0.2, 0.4)).toBeCloseTo(0.5);
    });
    it('ventana sube, se sostiene y baja', () => {
        expect(ventana(0.0, 0.1, 0.2, 0.5, 0.6)).toBe(0);
        expect(ventana(0.15, 0.1, 0.2, 0.5, 0.6)).toBeCloseTo(0.5);
        expect(ventana(0.35, 0.1, 0.2, 0.5, 0.6)).toBe(1);
        expect(ventana(0.55, 0.1, 0.2, 0.5, 0.6)).toBeCloseTo(0.5);
        expect(ventana(0.9, 0.1, 0.2, 0.5, 0.6)).toBe(0);
    });
    it('clamp acota', () => {
        expect(clamp(-3)).toBe(0);
        expect(clamp(7)).toBe(1);
    });
});

describe('frameDe', () => {
    it('empieza en el primer fotograma y acaba en el último', () => {
        expect(frameDe(0)).toBe(0);
        expect(frameDe(1)).toBe(N - 1);
    });
    it('el logo está formado al 30 % del recorrido', () => {
        expect(frameDe(0.30)).toBeCloseTo(FRAME_CLAVE);
    });
    it('el último fotograma se alcanza al 46 % y se mantiene', () => {
        expect(frameDe(0.46)).toBeCloseTo(N - 1);
        expect(frameDe(0.8)).toBe(N - 1);
    });
    it('nunca retrocede', () => {
        let ant = -1;
        for (let p = 0; p <= 1; p += 0.01) { const f = frameDe(p); expect(f).toBeGreaterThanOrEqual(ant); ant = f; }
    });
});

describe('tc', () => {
    it('da el código de tiempo del vídeo original', () => {
        expect(tc(0)).toBe('00:00:00:00');
        expect(tc(120)).toBe('00:00:10:00');   // fotograma 120 = 240 del vídeo = 10 s
        expect(tc(60)).toBe('00:00:05:00');
    });
});

describe('progreso', () => {
    it('0 al empezar la sección y 1 cuando se ha recorrido todo', () => {
        expect(progreso(0, 5000, 1000)).toBe(0);
        expect(progreso(-4000, 5000, 1000)).toBe(1);
        expect(progreso(-2000, 5000, 1000)).toBeCloseTo(0.5);
    });
    it('una sección más baja que la ventana no se divide por cero', () => {
        expect(progreso(-10, 800, 1000)).toBe(0);
    });
    it('no se sale de 0..1', () => {
        expect(progreso(300, 5000, 1000)).toBe(0);
        expect(progreso(-9999, 5000, 1000)).toBe(1);
    });
});
