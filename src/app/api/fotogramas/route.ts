import { NextResponse } from 'next/server';
import { frenar } from '@/lib/seguridad';
import { usuarioDe } from '@/lib/firebase-admin';
import { planDe } from '@/lib/suscripcion';
import { consultaTmdb, filtrosDe, usaFiltrosAvanzados } from '@/lib/fotogramas';

// Buscador de planos de cine (Fotogramas). La clave de TMDB se queda aquí.
//   GET /api/fotogramas?q=&genero=&desde=&hasta=&idioma=&persona=&palabra=&orden=&pagina=
//       → { plan, pagina, paginas, resultados: [{ id, titulo, anio, poster, fondo }] }
//   GET /api/fotogramas?pelicula=123  → { planos: [{ ruta, ancho, alto }] }  (fondos oficiales)
//   GET /api/fotogramas?sugerir=nolan&tipo=persona|palabra → { sugerencias: [{ id, nombre }] }  (Pro)
// Los filtros avanzados exigen plan Pro y se comprueban AQUÍ, no en el navegador.

const BASE = 'https://api.themoviedb.org/3';

async function tmdb(ruta: string, params: URLSearchParams, clave: string) {
    params.set('api_key', clave);
    const res = await fetch(`${BASE}${ruta}?${params}`);
    if (!res.ok) throw new Error(`tmdb ${res.status}`);
    return res.json();
}

export async function GET(req: Request) {
    const frenado = frenar(req, 'fotogramas', 40);
    if (frenado) return frenado;

    const clave = process.env.TMDB_KEY;
    if (!clave) return NextResponse.json({ error: 'sin_clave' }, { status: 503 });

    const sp = new URL(req.url).searchParams;
    const usuario = await usuarioDe(req);
    const plan = await planDe(usuario);

    try {
        const pelicula = sp.get('pelicula');
        if (pelicula !== null) {
            if (!/^\d{1,10}$/.test(pelicula)) return NextResponse.json({ error: 'id' }, { status: 400 });
            const d = await tmdb(`/movie/${pelicula}/images`, new URLSearchParams({ include_image_language: 'null' }), clave);
            const planos = (d.backdrops ?? [])
                .filter((b: any) => typeof b.file_path === 'string')
                .slice(0, 60)
                .map((b: any) => ({ ruta: b.file_path, ancho: b.width, alto: b.height }));
            return NextResponse.json({ planos }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } });
        }

        const sugerir = (sp.get('sugerir') || '').trim().slice(0, 80);
        if (sugerir) {
            if (plan !== 'pro') return NextResponse.json({ error: 'pro' }, { status: 402 });
            const tipo = sp.get('tipo') === 'palabra' ? 'keyword' : 'person';
            const d = await tmdb(`/search/${tipo}`, new URLSearchParams({ query: sugerir }), clave);
            return NextResponse.json({
                sugerencias: (d.results ?? []).slice(0, 8).map((r: any) => ({
                    id: r.id, nombre: r.name, detalle: r.known_for_department,
                })),
            });
        }

        const filtros = filtrosDe(sp);
        if (usaFiltrosAvanzados(filtros) && plan !== 'pro') {
            return NextResponse.json({ error: 'pro', message: 'Estos filtros son del plan Pro.' }, { status: 402 });
        }
        const pagina = Math.min(Math.max(Number(sp.get('pagina')) || 1, 1), 20);
        const { ruta, params } = consultaTmdb(filtros, pagina);
        const d = await tmdb(ruta, params, clave);

        return NextResponse.json({
            plan,
            pagina: d.page ?? pagina,
            paginas: Math.min(d.total_pages ?? 1, 20),
            resultados: (d.results ?? []).map((r: any) => ({
                id: String(r.id),
                titulo: r.title ?? r.original_title ?? 'Sin título',
                anio: r.release_date ? String(r.release_date).slice(0, 4) : undefined,
                poster: r.poster_path ?? null,
                fondo: r.backdrop_path ?? null,
            })),
        }, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch (e) {
        console.error('[fotogramas]', e);
        return NextResponse.json({ error: 'tmdb' }, { status: 502 });
    }
}
