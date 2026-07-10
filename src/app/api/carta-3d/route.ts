import { NextRequest, NextResponse } from 'next/server';
import { construirPrompt, type Carta3DInput } from '@/lib/carta3d/prompt-builder';
import { generarImagenControl } from '@/lib/carta3d/control-image';

export const maxDuration = 60; // El render en Replicate tarda 15-40s

// Modelos de comunidad requieren versión fijada en /v1/predictions
// (el endpoint /models/{owner}/{name}/predictions es solo para modelos oficiales)
const MODELO_URL = 'https://api.replicate.com/v1/predictions';
const MODELO_VERSION = '9a8db105db745f8b11ad3afe5c8bd892428b2a43ade0b67edc4e0ccd52ff2fda'; // xlabs-ai/flux-dev-controlnet
const INTENTOS_POLL = 20;
const POLL_MS = 2000;

/** Consulta el estado de un render lanzado (respuesta 202 del POST). */
export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Falta ?id=' }, { status: 400 });
    }
    if (!process.env.REPLICATE_API_TOKEN) {
        return NextResponse.json({ error: 'Falta REPLICATE_API_TOKEN' }, { status: 503 });
    }
    const res = await fetch(`${MODELO_URL}/${id}`, {
        headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` },
    });
    const prediccion = await res.json();
    if (['starting', 'processing'].includes(prediccion.status)) {
        return NextResponse.json({ status: 'processing', predictionId: id }, { status: 202 });
    }
    if (prediccion.status !== 'succeeded') {
        return NextResponse.json(
            { status: 'error', error: prediccion.error ?? `Render fallido (${prediccion.status})` },
            { status: 502 },
        );
    }
    const salida = prediccion.output;
    return NextResponse.json({ status: 'ok', imageUrl: Array.isArray(salida) ? salida[0] : salida });
}

export async function POST(req: NextRequest) {
    try {
        const carta = (await req.json()) as Carta3DInput;

        if (!carta?.planets?.length || typeof carta.ascendant !== 'number') {
            return NextResponse.json(
                { error: 'Faltan planets[] o ascendant en el cuerpo de la petición' },
                { status: 400 },
            );
        }

        const { prompt, negativePrompt } = construirPrompt(carta);
        const controlPng = generarImagenControl(carta);
        const controlDataUri = `data:image/png;base64,${controlPng.toString('base64')}`;

        // Degradación elegante: sin token devolvemos el prompt y la imagen
        // de control para que la UI pueda mostrarlos igualmente.
        if (!process.env.REPLICATE_API_TOKEN) {
            console.warn('API carta-3d: falta REPLICATE_API_TOKEN');
            return NextResponse.json({
                status: 'sin_render',
                error: 'Falta REPLICATE_API_TOKEN en el entorno',
                prompt,
                controlImage: controlDataUri,
            });
        }

        const headers = {
            Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
            Prefer: 'wait=30',
        };

        const creacion = await fetch(MODELO_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                version: MODELO_VERSION,
                input: {
                    prompt,
                    negative_prompt: negativePrompt,
                    control_type: 'canny',
                    control_image: controlDataUri,
                    // 0.5-0.65: geometría respetada con libertad para el 3D dorado
                    control_strength: 0.55,
                    guidance_scale: 3.5,
                    steps: 28,
                    output_format: 'png',
                },
            }),
        });

        if (!creacion.ok) {
            const detalle = await creacion.text();
            console.error('API carta-3d: Replicate respondió', creacion.status, detalle);
            return NextResponse.json(
                { status: 'error', error: `Replicate ${creacion.status}`, prompt, controlImage: controlDataUri },
                { status: 502 },
            );
        }

        let prediccion = await creacion.json();

        // Si "Prefer: wait" no bastó, hacemos polling hasta que termine
        for (let i = 0; i < INTENTOS_POLL && ['starting', 'processing'].includes(prediccion.status); i++) {
            await new Promise(r => setTimeout(r, POLL_MS));
            const estado = await fetch(prediccion.urls.get, { headers });
            prediccion = await estado.json();
        }

        // Arranque frío del modelo: aún procesando. El cliente sigue con
        // GET /api/carta-3d?id=... hasta obtener status ok.
        if (['starting', 'processing'].includes(prediccion.status)) {
            return NextResponse.json(
                { status: 'processing', predictionId: prediccion.id, prompt, controlImage: controlDataUri },
                { status: 202 },
            );
        }

        if (prediccion.status !== 'succeeded') {
            return NextResponse.json(
                { status: 'error', error: prediccion.error ?? `Render fallido (${prediccion.status})`, prompt },
                { status: 502 },
            );
        }

        const salida = prediccion.output;
        return NextResponse.json({
            status: 'ok',
            imageUrl: Array.isArray(salida) ? salida[0] : salida,
            prompt,
            controlImage: controlDataUri,
        });
    } catch (e) {
        console.error('API carta-3d:', e);
        return NextResponse.json(
            { status: 'error', error: e instanceof Error ? e.message : 'Error interno' },
            { status: 500 },
        );
    }
}
