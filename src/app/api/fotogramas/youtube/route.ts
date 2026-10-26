import { NextResponse } from 'next/server';
import { frenar } from '@/lib/seguridad';

// GET /api/fotogramas/youtube?q=Heat 1995 diner scene
//   → { videos: [{ id, titulo, canal, miniatura }] }
//   → { sinClave: true } si falta YOUTUBE_API_KEY (la pantalla ofrece entonces
//     el enlace a la búsqueda de YouTube, que no necesita clave).
// Los vídeos se ven incrustados con el reproductor de YouTube: así lo permite
// YouTube, y la app no copia nada.

export async function GET(req: Request) {
    const frenado = frenar(req, 'fotogramas-youtube', 30);
    if (frenado) return frenado;

    const clave = process.env.YOUTUBE_API_KEY;
    if (!clave) return NextResponse.json({ sinClave: true });

    const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 150);
    if (!q) return NextResponse.json({ videos: [] });

    const p = new URLSearchParams({
        part: 'snippet', type: 'video', maxResults: '4', videoEmbeddable: 'true',
        safeSearch: 'moderate', relevanceLanguage: 'es', q, key: clave,
    });
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${p}`);
        if (!res.ok) throw new Error(`youtube ${res.status}`);
        const d = await res.json();
        const videos = (d.items ?? [])
            .filter((it: any) => typeof it?.id?.videoId === 'string')
            .map((it: any) => ({
                id: it.id.videoId,
                titulo: String(it.snippet?.title ?? '').slice(0, 200),
                canal: String(it.snippet?.channelTitle ?? '').slice(0, 100),
                miniatura: it.snippet?.thumbnails?.medium?.url ?? null,
            }));
        // Una búsqueda cuesta 100 de las 10.000 unidades diarias gratis: se cachea un día.
        return NextResponse.json({ videos }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } });
    } catch (e) {
        console.error('[fotogramas-youtube]', e);
        return NextResponse.json({ sinClave: true });
    }
}
