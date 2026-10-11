import { describe, it, expect, vi } from 'vitest';
import { servirTts, type DepsTts } from './tts-servicio';
import { LimiteSuperado } from './tts-limite';

const MP3 = new Uint8Array([1, 2, 3]);

function deps(over: Partial<DepsTts> = {}): DepsTts {
    return {
        uid: 'u1',
        leer: vi.fn(async () => null),
        guardar: vi.fn(async () => {}),
        consumir: vi.fn(async () => 10),
        generar: vi.fn(async () => new Response(MP3, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } })),
        ...over,
    };
}

describe('servirTts', () => {
    it('sin sesión → 401 y no gasta nada', async () => {
        const d = deps({ uid: null });
        const r = await servirTts('Hola', d);
        expect(r.status).toBe(401);
        expect(await r.json()).toEqual({ error: 'login_requerido' });
        expect(d.generar).not.toHaveBeenCalled();
    });

    it('audio guardado → lo sirve sin consumir límite ni llamar al proveedor', async () => {
        const d = deps({ leer: vi.fn(async () => MP3) });
        const r = await servirTts('Hola', d);
        expect(r.status).toBe(200);
        expect(r.headers.get('X-TTS-Cache')).toBe('hit');
        expect(Array.from(new Uint8Array(await r.arrayBuffer()))).toEqual([1, 2, 3]);
        expect(d.consumir).not.toHaveBeenCalled();
        expect(d.generar).not.toHaveBeenCalled();
    });

    it('audio nuevo → consume la longitud del texto, genera y guarda', async () => {
        const d = deps();
        const r = await servirTts('Hola, Ana.', d);
        expect(r.status).toBe(200);
        expect(r.headers.get('X-TTS-Cache')).toBe('miss');
        expect(d.consumir).toHaveBeenCalledWith('u1', 10);
        expect(d.guardar).toHaveBeenCalledWith(MP3);
    });

    it('límite superado → 429 sin llamar al proveedor', async () => {
        const d = deps({ consumir: vi.fn(async () => { throw new LimiteSuperado(5000, 5000); }) });
        const r = await servirTts('Hola', d);
        expect(r.status).toBe(429);
        expect(await r.json()).toEqual({ error: 'limite_diario', restante: 0 });
        expect(d.generar).not.toHaveBeenCalled();
    });

    it('si el registro de uso falla por otra cosa, el ensayo sigue', async () => {
        const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const d = deps({ consumir: vi.fn(async () => { throw new Error('firestore caído'); }) });
        const r = await servirTts('Hola', d);
        expect(r.status).toBe(200);
        expect(d.generar).toHaveBeenCalled();
        aviso.mockRestore();
    });

    it('error del proveedor → se devuelve tal cual y no se guarda', async () => {
        const d = deps({ generar: vi.fn(async () => Response.json({ error: 'no_key' }, { status: 503 })) });
        const r = await servirTts('Hola', d);
        expect(r.status).toBe(503);
        expect(d.guardar).not.toHaveBeenCalled();
    });
});
