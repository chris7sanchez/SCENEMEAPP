import { NextResponse } from 'next/server';
import { frenar } from '@/lib/seguridad';

// Búsqueda de películas en TMDB, ahora desde el servidor.
//
// SEGURIDAD (18/10/2026): antes el navegador llamaba a TMDB con la clave en la
// URL (NEXT_PUBLIC_TMDB_KEY), así que la clave viajaba a cada visitante. Ahora
// la clave se queda aquí y el navegador sólo ve los resultados.
//   GET /api/peliculas?q=texto      → resultados de búsqueda (los de TMDB, tal cual)
//   GET /api/peliculas?trailer=123  → { url } del tráiler de YouTube

const BASE = 'https://api.themoviedb.org/3';

export async function GET(req: Request) {
    const frenado = frenar(req, 'peliculas', 30);
    if (frenado) return frenado;

    const clave = process.env.TMDB_KEY || process.env.NEXT_PUBLIC_TMDB_KEY;
    if (!clave) return NextResponse.json({ error: 'sin_clave' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const trailer = searchParams.get('trailer');
    if (trailer !== null) {
        if (!/^\d{1,10}$/.test(trailer)) return NextResponse.json({ error: 'id' }, { status: 400 });
        const res = await fetch(`${BASE}/movie/${trailer}/videos?api_key=${clave}&language=es-ES`);
        if (!res.ok) return NextResponse.json({ url: null });
        const data = await res.json();
        const v = (data.results ?? []).find((x: any) => x.site === 'YouTube' && x.type === 'Trailer') ?? (data.results ?? [])[0];
        return NextResponse.json(
            { url: v?.key ? `https://www.youtube.com/watch?v=${encodeURIComponent(v.key)}` : null },
            { headers: { 'Cache-Control': 'public, s-maxage=86400' } },
        );
    }

    const q = (searchParams.get('q') || '').trim().slice(0, 200);
    if (!q) return NextResponse.json({ results: [] });
    const res = await fetch(`${BASE}/search/movie?api_key=${clave}&language=es-ES&include_adult=false&query=${encodeURIComponent(q)}`);
    if (!res.ok) return NextResponse.json({ error: 'tmdb', status: res.status }, { status: 502 });
    const data = await res.json();
    return NextResponse.json(
        { results: (data.results ?? []).slice(0, 12) },
        { headers: { 'Cache-Control': 'public, s-maxage=3600' } },
    );
}
