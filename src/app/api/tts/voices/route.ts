import { NextRequest } from 'next/server';

// Devuelve las voces disponibles de un proveedor (de momento Cartesia), para
// poblar el desplegable del reproductor — incluye las voces propias/clonadas.

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const provider = req.nextUrl.searchParams.get('provider') || 'cartesia';

    if (provider === 'cartesia') {
        const key = process.env.CARTESIA_API_KEY;
        if (!key) return Response.json({ error: 'no_key', voices: [] }, { status: 503 });
        try {
            const r = await fetch('https://api.cartesia.ai/voices', {
                headers: { 'Authorization': `Bearer ${key}`, 'Cartesia-Version': '2026-03-01' },
            });
            if (!r.ok) {
                const detail = await r.text();
                return Response.json({ error: 'cartesia_error', detail: detail.slice(0, 200), voices: [] }, { status: 502 });
            }
            const data = await r.json();
            const raw: any[] = Array.isArray(data) ? data : (data?.data || data?.voices || []);
            const all = raw.map((v: any) => ({
                id: v.id,
                label: v.name + (v.language ? ` (${v.language})` : ''),
                lang: v.language || 'multi',
            })).filter((v: any) => v.id);
            // Español primero; si hay, devolvemos solo español, si no, todas.
            const es = all.filter(v => /^es/i.test(v.lang));
            const list = (es.length ? es : all).slice(0, 50);
            return Response.json({ voices: list });
        } catch (e: any) {
            return Response.json({ error: 'fetch_failed', message: e?.message || String(e), voices: [] }, { status: 502 });
        }
    }

    return Response.json({ voices: [] });
}
