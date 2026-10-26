import { NextResponse } from 'next/server';
import { generarJson, parteImagen } from '@/ai/gemini-json';
import { frenar, limitar } from '@/lib/seguridad';
import { usuarioDe } from '@/lib/firebase-admin';
import { planDe } from '@/lib/suscripcion';
import { limpiarEtiquetas } from '@/lib/fotogramas';

// POST /api/fotogramas/etiquetar  { imagen: "data:image/jpeg;base64,..." }  (Pro)
//   → { etiquetas: { plano, angulo, luz, color, emocion, composicion, palabras } }
// La imagen es la captura que el actor ha subido a su deck; aquí sólo se mira,
// no se guarda.

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX = 1_500_000; // caracteres del dataURL (~1,1 MB de imagen)

const ESQUEMA = {
    type: 'OBJECT',
    properties: {
        plano: { type: 'STRING' }, angulo: { type: 'STRING' }, luz: { type: 'STRING' }, color: { type: 'STRING' }, emocion: { type: 'STRING' }, composicion: { type: 'STRING' },
        palabras: { type: 'ARRAY', items: { type: 'STRING' } },
    },
    required: ['plano', 'angulo', 'luz', 'color', 'emocion', 'composicion', 'palabras'],
};

export async function POST(req: Request) {
    const frenado = frenar(req, 'fotogramas-etiquetar', 20);
    if (frenado) return frenado;

    const u = await usuarioDe(req);
    if (!u) return NextResponse.json({ error: 'sesion' }, { status: 401 });
    if ((await planDe(u)) !== 'pro') return NextResponse.json({ error: 'pro' }, { status: 402 });
    // Mientras todo es gratis, cada etiqueta la paga SCENE ME: tope por persona.
    if (!limitar(`fotogramas-etiquetar-uid:${u.uid}`, 60, 60 * 60_000)) {
        return NextResponse.json({ error: 'demasiadas_peticiones' }, { status: 429 });
    }

    if (Number(req.headers.get('content-length') || 0) > MAX + 1000) return NextResponse.json({ error: 'muy_grande' }, { status: 413 });
    let imagen = '';
    try { imagen = String((await req.json())?.imagen ?? ''); } catch { /* vacío */ }
    if (imagen.length > MAX || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(imagen)) {
        return NextResponse.json({ error: 'imagen' }, { status: 400 });
    }

    const texto = `Eres director de fotografía. Describe este fotograma de cine en castellano, con términos de rodaje y pocas palabras por campo:
plano (primer plano, plano medio, plano general...), angulo (normal, picado, contrapicado, cenital, holandés...),
luz (dura/suave, dirección, clave alta/baja, contraluz...), color (paleta dominante y temperatura),
emocion (qué transmite el personaje o la escena), composicion (tercios, simetría, profundidad, espacio negativo...),
palabras (de 5 a 10 palabras clave en minúscula para buscar: lugar, hora del día, época, vestuario...).
No digas de qué película es ni quién sale.`;

    try {
        const salida = await generarJson([parteImagen(imagen), { text: texto }], ESQUEMA, { temperatura: 0.3 });
        return NextResponse.json({ etiquetas: limpiarEtiquetas(salida) });
    } catch (e) {
        console.error('[fotogramas-etiquetar]', e);
        return NextResponse.json({ error: 'ia' }, { status: 502 });
    }
}
