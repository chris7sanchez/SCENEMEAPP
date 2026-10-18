import { describe, it, expect, vi } from 'vitest';
import { claveDeAudio, rutaDeAudio, cacheSegura, almacenFirebase, type AlmacenAudio } from './tts-cache';

const base = { proveedor: 'elevenlabs', modelo: 'eleven_multilingual_v2', voz: 'v1', ajustes: '', texto: 'Hola, Ana.' };

describe('claveDeAudio', () => {
    it('misma entrada, misma clave (sha256 hex)', () => {
        expect(claveDeAudio(base)).toBe(claveDeAudio({ ...base }));
        expect(claveDeAudio(base)).toMatch(/^[0-9a-f]{64}$/);
    });

    it('cambiar texto, voz, ajustes o modelo cambia la clave', () => {
        const k = claveDeAudio(base);
        expect(claveDeAudio({ ...base, texto: 'Hola, Ana' })).not.toBe(k);
        expect(claveDeAudio({ ...base, voz: 'v2' })).not.toBe(k);
        expect(claveDeAudio({ ...base, ajustes: 'triste' })).not.toBe(k);
        expect(claveDeAudio({ ...base, modelo: 'otro' })).not.toBe(k);
    });

    it('los campos no se mezclan entre sí', () => {
        expect(claveDeAudio({ ...base, voz: 'a', ajustes: 'bc' }))
            .not.toBe(claveDeAudio({ ...base, voz: 'ab', ajustes: 'c' }));
    });
});

describe('rutaDeAudio', () => {
    it('tts-cache/<proveedor>/<clave>.mp3', () => {
        expect(rutaDeAudio('openai', 'abc')).toBe('tts-cache/openai/abc.mp3');
    });
});

describe('cacheSegura', () => {
    it('sin almacén: no hay nada y guardar no hace nada', async () => {
        const c = cacheSegura(null);
        expect(await c.leer('x')).toBeNull();
        await expect(c.guardar('x', new Uint8Array([1]))).resolves.toBeUndefined();
    });

    it('si el almacén falla, no lanza', async () => {
        const roto: AlmacenAudio = {
            leer: vi.fn(async () => { throw new Error('caído'); }),
            guardar: vi.fn(async () => { throw new Error('caído'); }),
        };
        const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const c = cacheSegura(roto);
        expect(await c.leer('x')).toBeNull();
        await expect(c.guardar('x', new Uint8Array([1]))).resolves.toBeUndefined();
        expect(aviso).toHaveBeenCalledTimes(2);
        aviso.mockRestore();
    });
});

describe('almacenFirebase', () => {
    it('guarda y lee de vuelta por la misma ruta', async () => {
        const ficheros = new Map<string, Buffer>();
        const bucket = {
            file: (ruta: string) => ({
                exists: async (): Promise<[boolean]> => [ficheros.has(ruta)],
                download: async (): Promise<[Buffer]> => [ficheros.get(ruta)!],
                save: async (datos: Buffer, _opts: object) => { ficheros.set(ruta, datos); },
            }),
        };
        const a = almacenFirebase(bucket);
        expect(await a.leer('tts-cache/x/1.mp3')).toBeNull();
        await a.guardar('tts-cache/x/1.mp3', new Uint8Array([7, 8]));
        expect(Array.from((await a.leer('tts-cache/x/1.mp3'))!)).toEqual([7, 8]);
    });
});
