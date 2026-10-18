// LA HEMEROTECA, por el servidor.
//
//   GET /api/guiones?q=texto   → coincidencias del catálogo (sin tocar la red).
//   GET /api/guiones?id=xxx    → el guion entero, ya partido por escenas.
//
// Sólo se descargan URLs que estén en el catálogo (por id, nunca una URL que
// mande el navegador): así nadie puede usar esta ruta para que el servidor
// pida cualquier cosa. El texto se saca con el mismo lector de PDF que usa el
// ensayo (pdf-parse y, si falla, pdf2json con reconstrucción por geometría).

import { NextResponse } from 'next/server';
import catalogo from '@/data/guiones-catalogo.json';
import { buscarGuiones, partirEnEscenas, type GuionCatalogo } from '@/lib/guiones-catalogo';
import { parsePdfBuffer } from '@/ai/parse-pdf';

export const maxDuration = 60;

const LISTA = catalogo as GuionCatalogo[];
const POR_ID = new Map(LISTA.map(g => [g.id, g]));

/** Caché en memoria por instancia: un PDF de 60 páginas tarda segundos en leerse. */
const CACHE = new Map<string, { texto: string; cuando: number }>();
const CACHE_MAX = 40;
const TAMANO_MAX = 30 * 1024 * 1024;
const UA = 'Mozilla/5.0 (compatible; SceneMe/1.0; +https://scenemeapp.com)';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const id = searchParams.get('id');

    if (q !== null) {
        return NextResponse.json({ resultados: buscarGuiones(q.slice(0, 200), LISTA) });
    }

    if (!id) return NextResponse.json({ error: 'Falta q o id' }, { status: 400 });
    const g = POR_ID.get(id);
    if (!g) return NextResponse.json({ error: 'Ese guion no está en la hemeroteca' }, { status: 404 });
    if (g.tipo !== 'pdf') {
        return NextResponse.json({ error: 'Este guion sólo se puede ver en su visor', tipo: g.tipo, url: g.url }, { status: 409 });
    }

    try {
        const texto = await textoDe(g);
        if (!texto.trim()) {
            return NextResponse.json({ error: 'El PDF no traía texto legible (¿es un escaneo?)' }, { status: 422 });
        }
        return NextResponse.json({ guion: g, texto, escenas: partirEnEscenas(texto) });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'error desconocido';
        console.error('[guiones] no se pudo leer', g.url, msg);
        return NextResponse.json({ error: 'No se pudo descargar el guion. Prueba otra vez en un momento.' }, { status: 502 });
    }
}

async function textoDe(g: GuionCatalogo): Promise<string> {
    const hit = CACHE.get(g.id);
    if (hit) return hit.texto;

    const res = await fetch(g.url, {
        headers: { 'User-Agent': UA, Accept: 'application/pdf,*/*' },
        signal: AbortSignal.timeout(25_000),
        redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const largo = Number(res.headers.get('content-length') || 0);
    if (largo > TAMANO_MAX) throw new Error('PDF demasiado grande');
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > TAMANO_MAX) throw new Error('PDF demasiado grande');
    if (!buf.subarray(0, 5).toString('latin1').startsWith('%PDF')) throw new Error('la respuesta no es un PDF');

    const texto = await parsePdfBuffer(buf);

    if (CACHE.size >= CACHE_MAX) {
        const masViejo = [...CACHE.entries()].sort((a, b) => a[1].cuando - b[1].cuando)[0];
        if (masViejo) CACHE.delete(masViejo[0]);
    }
    CACHE.set(g.id, { texto, cuando: Date.now() });
    return texto;
}
