import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAI, withRetry } from '@/ai/genkit';
import { frenar, limitar } from '@/lib/seguridad';
import { usuarioDe } from '@/lib/firebase-admin';
import { limpiarIdeas } from '@/lib/fotogramas';

// POST /api/fotogramas/ideas  { peticion: "rabia contenida, plano cerrado, luz dura" }
//   → { ideas: [{ titulo, anio, director, escena, porQue, busqueda }] }
// La IA sólo RECOMIENDA películas y escenas (texto). No trae ni guarda imágenes.
// Pide sesión: cada llamada cuesta dinero.

export const runtime = 'nodejs';
export const maxDuration = 30;

const Salida = z.object({
    ideas: z.array(z.object({
        titulo: z.string(),
        anio: z.string().optional(),
        director: z.string().optional(),
        escena: z.string(),
        porQue: z.string(),
        busqueda: z.string(),
    })),
});

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

Propón 6 escenas concretas de películas REALES (cine de cualquier época y país; incluye al menos una española si encaja).
Para cada una:
- titulo: título con el que se conoce en España
- anio: año de estreno (4 cifras)
- director
- escena: qué pasa en la escena y en qué momento de la película, en una o dos frases
- porQue: qué puede aprender el actor de esa interpretación o de ese plano (luz, encuadre, ritmo, emoción)
- busqueda: texto corto para encontrar el clip en YouTube (título original, año y la escena, en inglés si la película es en inglés)
No inventes películas ni escenas. Si dudas de una, no la pongas. Responde en castellano.`;

    try {
        const { output } = await withRetry<any>(() => getAI().generate({ prompt, output: { schema: Salida } }));
        return NextResponse.json({ ideas: limpiarIdeas(output) });
    } catch (e) {
        console.error('[fotogramas-ideas]', e);
        return NextResponse.json({ error: 'ia', message: 'La IA no ha respondido. Inténtalo de nuevo.' }, { status: 502 });
    }
}
