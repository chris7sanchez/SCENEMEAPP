import { LimiteSuperado } from './tts-limite';

// Orden de /api/tts: sesión → audio guardado (gratis) → límite → proveedor → guardar.
// Las piezas llegan inyectadas para poder probarlo sin Firebase ni proveedores.

export interface DepsTts {
    uid: string | null;
    leer(): Promise<Uint8Array<ArrayBuffer> | null>;
    guardar(audio: Uint8Array): Promise<void>;
    consumir(uid: string, n: number): Promise<unknown>;
    generar(): Promise<Response>;
}

const CABECERAS_AUDIO = { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=86400' };

export async function servirTts(texto: string, d: DepsTts): Promise<Response> {
    if (!d.uid) return Response.json({ error: 'login_requerido' }, { status: 401 });

    const guardado = await d.leer();
    if (guardado) {
        return new Response(guardado, { status: 200, headers: { ...CABECERAS_AUDIO, 'X-TTS-Cache': 'hit' } });
    }

    try {
        await d.consumir(d.uid, texto.length);
    } catch (e) {
        if (e instanceof LimiteSuperado) return Response.json({ error: 'limite_diario', restante: 0 }, { status: 429 });
        // Sin registro de uso no se castiga al actor: se genera igual y queda en el log.
        console.warn('[tts] no se pudo apuntar el uso:', e);
    }

    const r = await d.generar();
    if (!r.ok) return r;
    const audio = new Uint8Array(await r.arrayBuffer());
    await d.guardar(audio);
    return new Response(audio, { status: 200, headers: { ...CABECERAS_AUDIO, 'X-TTS-Cache': 'miss' } });
}
