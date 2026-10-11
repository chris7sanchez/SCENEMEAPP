import { describe, it, expect, afterEach } from 'vitest';
import { consumirCaracteres, idDeUso, limiteDiario, LimiteSuperado, type RegistroUso } from './tts-limite';

function registroEnMemoria(): RegistroUso & { datos: Map<string, number> } {
    const datos = new Map<string, number>();
    return {
        datos,
        async sumarSiCabe(id, n, limite) {
            const usados = datos.get(id) ?? 0;
            if (usados + n > limite) return { cabe: false, usados };
            datos.set(id, usados + n);
            return { cabe: true, usados: usados + n };
        },
    };
}

const DIA = new Date('2026-10-11T12:00:00Z');

describe('idDeUso', () => {
    it('uid + fecha UTC', () => {
        expect(idDeUso('u1', DIA)).toBe('u1_2026-10-11');
    });
});

describe('consumirCaracteres', () => {
    it('suma mientras cabe, también justo en el límite', async () => {
        const r = registroEnMemoria();
        expect(await consumirCaracteres(r, 'u1', 3000, 5000, DIA)).toBe(3000);
        expect(await consumirCaracteres(r, 'u1', 2000, 5000, DIA)).toBe(5000);
    });

    it('al pasarse lanza LimiteSuperado y no suma', async () => {
        const r = registroEnMemoria();
        await consumirCaracteres(r, 'u1', 4990, 5000, DIA);
        await expect(consumirCaracteres(r, 'u1', 20, 5000, DIA)).rejects.toBeInstanceOf(LimiteSuperado);
        expect(r.datos.get('u1_2026-10-11')).toBe(4990);
    });

    it('un día nuevo empieza de cero', async () => {
        const r = registroEnMemoria();
        await consumirCaracteres(r, 'u1', 5000, 5000, DIA);
        const manana = new Date('2026-10-12T00:00:01Z');
        expect(await consumirCaracteres(r, 'u1', 100, 5000, manana)).toBe(100);
    });

    it('cada usuario tiene su propio contador', async () => {
        const r = registroEnMemoria();
        await consumirCaracteres(r, 'u1', 5000, 5000, DIA);
        expect(await consumirCaracteres(r, 'u2', 100, 5000, DIA)).toBe(100);
    });
});

describe('limiteDiario', () => {
    afterEach(() => { delete process.env.TTS_LIMITE_DIARIO; });

    it('5000 por defecto', () => {
        expect(limiteDiario()).toBe(5000);
    });

    it('lee TTS_LIMITE_DIARIO y descarta valores raros', () => {
        process.env.TTS_LIMITE_DIARIO = '50';
        expect(limiteDiario()).toBe(50);
        process.env.TTS_LIMITE_DIARIO = 'mucho';
        expect(limiteDiario()).toBe(5000);
        process.env.TTS_LIMITE_DIARIO = '-3';
        expect(limiteDiario()).toBe(5000);
    });
});
