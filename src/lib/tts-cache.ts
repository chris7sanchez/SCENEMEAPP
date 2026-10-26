import { createHash } from 'node:crypto';

// Guarda cada audio de voz IA para no pagarlo dos veces. La clave sale de TODO
// lo que cambia el sonido: proveedor, modelo, voz, ajustes y texto.

export interface DatosClave {
    proveedor: string;
    modelo: string;
    voz: string;
    ajustes: string;
    texto: string;
}

/** El separador \u0000 impide que "a"+"bc" choque con "ab"+"c". */
export function claveDeAudio(d: DatosClave): string {
    return createHash('sha256')
        .update([d.proveedor, d.modelo, d.voz, d.ajustes, d.texto].join('\u0000'))
        .digest('hex');
}

export function rutaDeAudio(proveedor: string, clave: string): string {
    return `tts-cache/${proveedor}/${clave}.mp3`;
}

export interface AlmacenAudio {
    /** `<ArrayBuffer>` porque Response no acepta bytes sobre memoria compartida (TS 5.9). */
    leer(ruta: string): Promise<Uint8Array<ArrayBuffer> | null>;
    guardar(ruta: string, audio: Uint8Array): Promise<void>;
}

/** Nunca lanza: si el almacén falla, es "no está" o "no se guardó" y el ensayo sigue. */
export function cacheSegura(almacen: AlmacenAudio | null): AlmacenAudio {
    return {
        async leer(ruta) {
            if (!almacen) return null;
            try { return await almacen.leer(ruta); } catch (e) {
                console.warn('[tts-cache] no se pudo leer:', e);
                return null;
            }
        },
        async guardar(ruta, audio) {
            if (!almacen) return;
            try { await almacen.guardar(ruta, audio); } catch (e) {
                console.warn('[tts-cache] no se pudo guardar:', e);
            }
        },
    };
}

interface FicheroBucket {
    exists(): Promise<[boolean]>;
    download(): Promise<[Buffer]>;
    save(datos: Buffer, opts: object): Promise<void>;
}

/** Adaptador a Firebase Storage (bucket de firebase-admin). Ficheros privados. */
export function almacenFirebase(bucket: { file(ruta: string): FicheroBucket }): AlmacenAudio {
    return {
        async leer(ruta) {
            const f = bucket.file(ruta);
            const [existe] = await f.exists();
            if (!existe) return null;
            const [datos] = await f.download();
            return new Uint8Array(datos);
        },
        async guardar(ruta, audio) {
            await bucket.file(ruta).save(Buffer.from(audio), { contentType: 'audio/mpeg', resumable: false });
        },
    };
}
