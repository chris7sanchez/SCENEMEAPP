/**
 * ¿QUÉ ESTÁ SIRVIENDO LA WEB DE VERDAD?
 *
 * Existe porque hoy se ha perdido media tarde en esto: los clips de la portada
 * estaban en git, se veían en local, pasaban todas las pruebas... y en
 * producción daban 404, porque un fichero de exclusiones los dejaba fuera del
 * despliegue. Desde fuera no había forma de comprobarlo sin abrir el navegador
 * y mirar, y "míralo tú y dime" no es un diagnóstico.
 *
 * Esto lo pregunta desde dentro: el servidor pide sus propios ficheros y
 * devuelve el código y el tamaño de cada uno. Se abre en
 *
 *     scenemeapp.com/api/assets
 *
 * y en dos segundos se sabe si un fichero llegó al despliegue o no. Todo lo que
 * devuelve es público (son URLs que cualquiera puede pedir), así que no expone
 * nada que no estuviera ya a la vista.
 */

export const dynamic = 'force-dynamic';

/** Lo que la portada necesita para no quedarse en fotogramas quietos. */
const DE_LA_PORTADA = [
    '/videos/MIX-cine-loop.mp4',
    '/videos/MUDANZA-loop.mp4',
    '/videos/Mel_cuban-loop.mp4',
    '/videos/AMANDA-loop.mp4',
    '/videos/SONIA_DORADO-loop.mp4',
    '/videos/OLIVER-loop.mp4',
    '/videos/SHOGUN-loop.mp4',
    '/videos/MIX-cine-loop-poster.jpg',
    '/videos/AMANDA-loop-poster.jpg',
    '/trabajos/web/1.webp',
    '/trabajos/web/9.webp',
    '/splash-logo.webp',
    // La cabecera: el vídeo del nombre, sus fotogramas y su plan B animado.
    '/marca/presentacion.mp4',
    '/marca/presentacion-inicio.jpg',
    '/marca/presentacion-poster.jpg',
    '/marca/presentacion-animada.avif',
    // La tira de la portada (Silvia) y el muro del book (una miniatura basta
    // para saber que la carpeta llegó).
    '/videos/SILVIA-loop.mp4',
    '/videos/SILVIA-loop-poster.jpg',
    '/trabajos/muro/1.webp',
    '/trabajos/muro/11.3.webp',
];

async function comprobar(base: string, ruta: string) {
    try {
        // HEAD basta y no se descarga el fichero: interesa el código y el peso.
        const r = await fetch(base + ruta, { method: 'HEAD', cache: 'no-store' });
        return {
            ruta,
            ok: r.ok,
            estado: r.status,
            tipo: r.headers.get('content-type'),
            kb: Number(r.headers.get('content-length') || 0) / 1024 || null,
        };
    } catch (e) {
        return { ruta, ok: false, estado: 0, error: String(e).slice(0, 120) };
    }
}

export async function GET(request: Request) {
    const base = new URL(request.url).origin;
    const resultados = await Promise.all(DE_LA_PORTADA.map(r => comprobar(base, r)));
    const faltan = resultados.filter(r => !r.ok);

    return Response.json({
        version: (process.env.VERCEL_GIT_COMMIT_SHA || 'local').slice(0, 7),
        base,
        veredicto: faltan.length
            ? `FALTAN ${faltan.length} de ${resultados.length}: ${faltan.map(f => f.ruta).join(', ')}`
            : `Los ${resultados.length} ficheros llegan bien.`,
        ficheros: resultados,
    }, { headers: { 'Cache-Control': 'no-store' } });
}
