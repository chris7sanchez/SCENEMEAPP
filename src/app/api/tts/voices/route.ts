import { NextRequest } from 'next/server';

// Devuelve voces de Cartesia EN ESPAÑOL (filtradas por language=es), con España
// (country ES) primero, para poblar el desplegable del reproductor. Incluye las
// voces propias/clonadas del usuario.

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const provider = req.nextUrl.searchParams.get('provider') || 'cartesia';

    if (provider === 'cartesia') {
        const key = process.env.CARTESIA_API_KEY;
        if (!key) return Response.json({ error: 'no_key', voices: [] }, { status: 503 });
        try {
            const r = await fetch('https://api.cartesia.ai/voices?language=es&limit=100', {
                headers: { 'Authorization': `Bearer ${key}`, 'Cartesia-Version': '2026-03-01' },
            });
            if (!r.ok) {
                const detail = await r.text();
                return Response.json({ error: 'cartesia_error', detail: detail.slice(0, 200), voices: [] }, { status: 502 });
            }
            const data = await r.json();
            const raw: any[] = Array.isArray(data) ? data : (data?.data || []);
            const list = raw
                .filter((v: any) => v.id && /^es/i.test(v.language || ''))
                .map((v: any) => {
                    const c = (v.country || '').toUpperCase();
                    const place = c === 'ES' ? 'España' : (c ? c : '');
                    return { id: v.id, label: `${v.name}${place ? ` — ${place}` : ''}`, lang: v.language || 'es', country: c };
                });
            // España primero; luego el resto (Latinoamérica).
            list.sort((a: any, b: any) => (a.country === 'ES' ? -1 : 0) - (b.country === 'ES' ? -1 : 0));
            return Response.json({ voices: list.slice(0, 60) });
        } catch (e: any) {
            return Response.json({ error: 'fetch_failed', message: e?.message || String(e), voices: [] }, { status: 502 });
        }
    }

    return Response.json({ voices: [] });
}
