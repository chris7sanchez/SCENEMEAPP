'use client';

import { useCallback, useEffect, useState } from 'react';
import { conSesion } from '@/lib/fotogramas-db';
import { PUNTOS, DONDE_VALE, type EstadoCanje } from '@/lib/puntos';
import type { CanjeAdmin } from '@/lib/puntos-servidor';

/*
 * Los canjes de puntos de los Estudios, para el panel de administración.
 * Cada canje es un código de descuento que un actor ha pedido con sus puntos.
 * El descuento no se aplica solo: aquí se marca «usado» al aplicarlo en su
 * sesión, o se anula (y los puntos vuelven al actor). Ver lib/puntos.ts.
 */

const ETIQUETA: Record<EstadoCanje, string> = { pendiente: 'Pendiente', usado: 'Usado', anulado: 'Anulado' };

function fecha(ms: number): string {
    return ms ? new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
}

export default function CanjesAdmin({ onContar }: { onContar?: (pendientes: number) => void }) {
    const [canjes, setCanjes] = useState<CanjeAdmin[] | null>(null);
    const [error, setError] = useState('');
    const [tocando, setTocando] = useState<string | null>(null);

    const recibir = useCallback((lista: CanjeAdmin[]) => {
        setCanjes(lista);
        onContar?.(lista.filter(c => c.estado === 'pendiente').length);
    }, [onContar]);

    const pedir = useCallback(async (init?: RequestInit) => {
        setError('');
        try {
            const res = await fetch('/api/admin/canjes', await conSesion(init));
            const datos = await res.json().catch(() => ({}));
            if (!res.ok) { setError(res.status === 403 ? 'Sólo el administrador puede ver los canjes.' : 'No se han podido leer los canjes.'); return; }
            recibir(datos.canjes ?? []);
        } catch {
            setError('No se han podido leer los canjes.');
        }
    }, [recibir]);

    useEffect(() => {
        const t = setTimeout(() => pedir(), 0);
        return () => clearTimeout(t);
    }, [pedir]);

    const cambiar = async (id: string, estado: EstadoCanje) => {
        setTocando(id);
        await pedir({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, estado }) });
        setTocando(null);
    };

    return (
        <div className="space-y-4">
            <p className="max-w-3xl text-sm text-zinc-400">
                Códigos de descuento que los actores han pedido con sus puntos, para {DONDE_VALE}. Cuando apliques uno en su sesión, márcalo como usado. Si un canje no te cuadra, anúlalo: los puntos vuelven al actor.
            </p>
            {error && <p role="alert" className="text-sm font-bold text-red-400">{error}</p>}
            {canjes === null && !error && <p className="text-sm text-zinc-500">Cargando canjes…</p>}
            {canjes?.length === 0 && <p className="text-sm text-zinc-500">Todavía nadie ha canjeado puntos.</p>}

            <ul className="space-y-3">
                {canjes?.map(c => (
                    <li key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-mono text-xl font-black tracking-[0.15em] text-amber-400">{c.codigo}</p>
                                <p className="mt-1 text-sm font-bold text-white">{c.descuento} % de descuento <span className="font-normal text-zinc-500">· {c.puntos} puntos · {fecha(c.creado)}</span></p>
                                <p className="mt-1 text-sm text-zinc-300">{c.nombre || 'Sin nombre en el perfil'} <span className="text-zinc-500">{c.email}</span></p>
                                {c.actividad && (
                                    <p className="mt-2 text-xs text-zinc-500">
                                        Cómo los ganó ({c.ganados} en total): {c.actividad.diasConToma} días con toma (×{PUNTOS.toma}), {c.actividad.bravosRecibidos} bravos (×{PUNTOS.bravo}), {c.actividad.comentarios} comentarios (×{PUNTOS.comentario}).
                                    </p>
                                )}
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${c.estado === 'pendiente' ? 'bg-amber-500/15 text-amber-300' : c.estado === 'usado' ? 'bg-green-500/15 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                {ETIQUETA[c.estado]}
                            </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {(['usado', 'anulado', 'pendiente'] as EstadoCanje[]).filter(e => e !== c.estado).map(e => (
                                <button
                                    key={e}
                                    type="button"
                                    disabled={tocando !== null}
                                    onClick={() => cambiar(c.id, e)}
                                    className="min-h-10 rounded-lg border border-zinc-700 px-4 text-xs font-bold uppercase tracking-[0.1em] text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-white disabled:opacity-50"
                                >
                                    {e === 'usado' ? 'Marcar usado' : e === 'anulado' ? 'Anular' : 'Volver a pendiente'}
                                </button>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
