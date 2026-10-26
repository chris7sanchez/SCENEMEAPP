import { NextResponse } from 'next/server';
import { generarJson, ErrorGemini } from '@/ai/gemini-json';
import { frenar, limitar } from '@/lib/seguridad';
import { usuarioDe } from '@/lib/firebase-admin';
import { limpiarIdeas } from '@/lib/fotogramas';

// POST /api/fotogramas/ideas  { peticion: "rabia contenida, plano cerrado, luz dura" }
//   → { ideas: [{ titulo, anio, director, escena, porQue, busqueda }] }
// La IA sólo RECOMIENDA películas y escenas (texto). No trae ni guarda imágenes.
// Pide sesión: cada llamada cuesta dinero.

export const runtime = 'nodejs';
export const maxDuration = 60;

const ESQUEMA = {
    type: 'OBJECT',
    properties: {
        ideas: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: { titulo: { type: 'STRING' }, anio: { type: 'STRING' }, director: { type: 'STRING' }, escena: { type: 'STRING' }, porQue: { type: 'STRING' }, busqueda: { type: 'STRING' } },
                required: ['titulo', 'escena', 'porQue', 'busqueda'],
            },
        },
    },
    required: ['ideas'],
};

export async function POST(req: Request) {
    const frenado = frenar(req, 'fotogramas-ideas', 10);
    if (frenado) return frenado;

    const u = await usuarioDe(req);
    if (!u) return NextResponse.json({ error: 'sesion' }, { status: 401 });
    if (!limitar(`fotogramas-ideas-uid:${u.uid}`, 30, 60 * 60_000)) {
        return NextResponse.json({ error: 'demasiadas_peticiones', message: 'Has pedido muchas ideas seguidas. Vuelve en un rato.' }, { status: 429 });
    }

    let peticion = '';
    try { peticion = String((await req.json())?.peticion ?? '').trim().slice(0, 500); } catch { /* vacío */ }
    if (peticion.length < 3) return NextResponse.json({ error: 'vacio' }, { status: 400 });

    const prompt = `Eres un director de casting y profesor de interpretación. Un actor o actriz busca referencias de cine para preparar un trabajo.
Lo que busca: """${peticion}"""

Puede ser una descripción (una emoción, un tipo de plano, una luz) o el título de una película, un director o un actor.
- Si nombra UNA película concreta (aunque esté mal escrita o sin tilde, p. ej. "moulin rouge"), propón 6 escenas de ESA película.
- Si nombra a un director o a un actor, propón 6 escenas de sus películas.
- Si describe algo, propón 6 escenas de películas distintas que lo muestren (de cualquier época y país; incluye al menos una española si encaja).
Las películas tienen que ser REALES.
Para cada una:
- titulo: título con el que se conoce en España
- anio: año de estreno (4 cifras)
- director
- escena: qué pasa en la escena y en qué momento de la película, en una o dos frases
- porQue: qué puede aprender el actor de esa interpretación o de ese plano (luz, encuadre, ritmo, emoción)
- busqueda: texto corto para encontrar el clip en YouTube (título original, año y la escena, en inglés si la película es en inglés)
No inventes películas ni escenas. Si dudas de una, no la pongas. Responde en castellano.`;

    try {
        const ideas = limpiarIdeas(await generarJson([{ text: prompt }], ESQUEMA));
        // Vercel guarda una hora de registros: sirve para ver qué búsquedas se quedan sin nada.
        console.log('[fotogramas-ideas]', ideas.length, 'ideas para', JSON.stringify(peticion.slice(0, 80)));
        return NextResponse.json({ ideas });
    } catch (e) {
        console.error('[fotogramas-ideas]', e);
        const tiempo = e instanceof ErrorGemini && e.codigo === 'tiempo';
        return NextResponse.json({
            error: 'ia',
            message: tiempo ? 'La IA está tardando demasiado. Inténtalo de nuevo en un momento.' : 'La IA no ha respondido. Inténtalo de nuevo.',
        }, { status: 502 });
    }
}
