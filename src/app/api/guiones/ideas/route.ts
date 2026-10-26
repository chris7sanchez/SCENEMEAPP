import { NextResponse } from 'next/server';
import catalogo from '@/data/guiones-catalogo.json';
import { generarJson, ErrorGemini } from '@/ai/gemini-json';
import { frenar, limitar } from '@/lib/seguridad';
import { usuarioDe } from '@/lib/firebase-admin';
import type { GuionCatalogo } from '@/lib/guiones-catalogo';
import { limpiarGuionesIA, emparejar, type GuionIA } from '@/lib/guiones-ia';

// POST /api/guiones/ideas  { consulta: "moulin rouge" | "una escena de ruptura en una cocina" }
//   → { guiones: [{ titulo, anio, guionistas, tipo, publicado, donde, busqueda, enHemeroteca? }] }
// La IA dice si el guion está publicado y quién lo escribió. Los enlaces NO los
// pone la IA (podría inventarlos): la pantalla enlaza a la hemeroteca si
// coincide, o a una búsqueda de Google ya escrita.

export const runtime = 'nodejs';
export const maxDuration = 60;

const LISTA = catalogo as GuionCatalogo[];
const S = { type: 'STRING' };
const ESQUEMA = {
    type: 'OBJECT',
    properties: {
        guiones: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    // tipo y publicado se validan después (limpiarGuionesIA): sin enum, Gemini no rechaza nada.
                    titulo: S, anio: S, guionistas: S, donde: S, busqueda: S, tipo: S, publicado: S,
                },
                required: ['titulo', 'tipo', 'publicado', 'donde', 'busqueda'],
            },
        },
    },
    required: ['guiones'],
};

export async function POST(req: Request) {
    const frenado = frenar(req, 'guiones-ideas', 10);
    if (frenado) return frenado;

    const u = await usuarioDe(req);
    if (!u) return NextResponse.json({ error: 'sesion', message: 'Inicia sesión para buscar guiones con la IA.' }, { status: 401 });
    if (!limitar(`guiones-ideas-uid:${u.uid}`, 30, 60 * 60_000)) {
        return NextResponse.json({ error: 'demasiadas_peticiones', message: 'Has hecho muchas búsquedas seguidas. Vuelve en un rato.' }, { status: 429 });
    }

    let consulta = '';
    try { consulta = String((await req.json())?.consulta ?? '').trim().slice(0, 300); } catch { /* vacío */ }
    if (consulta.length < 2) return NextResponse.json({ error: 'vacio' }, { status: 400 });

    const prompt = `Eres documentalista de guiones de cine y series. Un actor o actriz busca un guion para trabajar una escena.
Lo que busca: """${consulta}"""

- Si nombra una película, serie u obra concreta (aunque esté mal escrita), devuelve ESA en primer lugar y, si quieres, hasta 2 relacionadas.
- Si describe un tipo de escena o de personaje, propón hasta 5 películas o series cuyo guion le sirva (prioriza guiones que se hayan publicado).
Para cada una:
- titulo: título con el que se conoce en España
- anio: año de estreno (4 cifras)
- guionistas
- tipo: pelicula, serie, corto o teatro
- publicado: "si" si el guion se ha publicado de forma legal (libro, web del estudio o de la distribuidora, campaña de premios, la Academia, el propio guionista); "no" si sabes que no; "no_se" si no estás seguro
- donde: en una o dos frases, dónde se publicó o cómo suele conseguirse (sin inventar direcciones web)
- busqueda: texto para encontrarlo en Google (título original, año y "screenplay pdf" o "guion pdf")
No inventes películas, guionistas ni publicaciones. Si dudas, usa "no_se". Responde en castellano.`;

    try {
        const guiones: GuionIA[] = limpiarGuionesIA(await generarJson([{ text: prompt }], ESQUEMA, { temperatura: 0.4 }))
            .map(g => ({ ...g, enHemeroteca: emparejar(g, LISTA) }));
        console.log('[guiones-ideas]', guiones.length, 'guiones para', JSON.stringify(consulta.slice(0, 80)));
        return NextResponse.json({ guiones });
    } catch (e) {
        console.error('[guiones-ideas]', e);
        const tiempo = e instanceof ErrorGemini && e.codigo === 'tiempo';
        return NextResponse.json({
            error: 'ia',
            message: tiempo ? 'La IA está tardando demasiado. Inténtalo de nuevo en un momento.' : 'La IA no ha respondido. Inténtalo de nuevo.',
        }, { status: 502 });
    }
}
