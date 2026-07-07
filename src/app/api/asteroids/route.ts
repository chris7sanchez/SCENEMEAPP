import { NextResponse } from 'next/server';
import { fetchAllAsteroids, AsteroidPosition } from '@/utils/asteroids';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/asteroids?date=<ISO>
 * Devuelve la longitud eclíptica geocéntrica (de fecha) de los 5 asteroides
 * vía JPL Horizons. Aislado y con caché en memoria por DÍA:
 *  - Los asteroides se mueven lentísimo y una fecha dada se consulta UNA vez
 *    por instancia → JPL casi nunca recibe peticiones, no hay rate-limit.
 *  - Si JPL falla o se rate-limitea, devuelve { ok:false, asteroids:[] } con
 *    HTTP 200, de modo que la carta simplemente NO muestra asteroides y la
 *    app nunca se rompe.
 */

// Caché en memoria (por instancia "caliente"). Clave = YYYY-MM-DD.
const cache = new Map<string, AsteroidPosition[]>();
const dayKey = (iso: string): string => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso.slice(0, 10) : d.toISOString().slice(0, 10);
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        if (!date) return NextResponse.json({ ok: false, asteroids: [], error: 'missing date' });

        const key = dayKey(date);
        const cached = cache.get(key);
        if (cached) return NextResponse.json({ ok: true, date: key, cached: true, asteroids: cached });

        const asteroids = await fetchAllAsteroids(date);
        if (asteroids.length) cache.set(key, asteroids);
        return NextResponse.json({ ok: asteroids.length > 0, date: key, cached: false, asteroids });
    } catch {
        return NextResponse.json({ ok: false, asteroids: [] });
    }
}
