'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { listarPublicaciones } from '@/lib/comunidad-db';
import { actoresDelTablon, iniciales, type ActorTablon, type Companero } from '@/lib/tablon';

/*
 * El tablón de los Estudios: los actores que tienen alguna toma compartida en
 * la Sala de visionado. Se pinta en dos sitios:
 *
 * - en /los-estudios, para ver quién está entrenando (modo "ver");
 * - en el paso de reparto de la escena, para proponer compañero (modo "elegir").
 *
 * Sólo gente real: si no hay nadie, se dice que no hay nadie. Ver lib/tablon.ts.
 */

type Estado = 'cargando' | 'sin-sesion' | 'listo';

interface Props {
    modo: 'ver' | 'elegir';
    /** Cuántas fichas enseñar como mucho. */
    tope?: number;
    elegido?: Companero | null;
    onElegir?: (c: Companero | null) => void;
}

export default function Tablon({ modo, tope = 12, elegido, onElegir }: Props) {
    const [estado, setEstado] = useState<Estado>('cargando');
    const [actores, setActores] = useState<ActorTablon[]>([]);

    useEffect(() => {
        let vivo = true;
        import('@/lib/auth').then(async ({ auth }) => {
            const sesion = await auth.getSesion();
            if (!vivo) return;
            if (!sesion) { setEstado('sin-sesion'); return; }
            try {
                const muro = await listarPublicaciones(undefined, 200);
                if (!vivo) return;
                // Al elegir compañero, uno no se propone a sí mismo.
                const todos = actoresDelTablon(muro);
                setActores(modo === 'elegir' ? todos.filter(a => a.uid !== sesion.uid) : todos);
            } catch (e) {
                console.warn('[tablon] no se pudo leer el muro:', e);
                if (vivo) setActores([]);
            }
            if (vivo) setEstado('listo');
        }).catch(() => { if (vivo) setEstado('sin-sesion'); });
        return () => { vivo = false; };
    }, [modo]);

    if (estado === 'cargando') {
        return <p className="py-6 text-sm text-zinc-500">Mirando quién hay en el tablón…</p>;
    }

    if (estado === 'sin-sesion') {
        // Al elegir compañero no se ofrece ir al login: se perdería la escena
        // que se está montando. Es opcional, así que se puede seguir sin él.
        return (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm leading-relaxed text-zinc-400">
                    {modo === 'elegir'
                        ? 'Para proponer compañero hace falta haber entrado con tu cuenta. Puedes seguir sin elegir: es opcional.'
                        : 'El tablón sólo se ve con tu cuenta: son actores reales y no se enseñan en abierto.'}
                </p>
                {modo === 'ver' && (
                    <Link href="/login" className="mt-3 inline-block text-sm font-bold text-amber-300 underline-offset-4 hover:underline">
                        Entrar con mi cuenta
                    </Link>
                )}
            </div>
        );
    }

    if (actores.length === 0) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm leading-relaxed text-zinc-400">
                    {modo === 'elegir'
                        ? 'Todavía no hay compañeros en el tablón. Puedes seguir sin elegir: es opcional.'
                        : 'Todavía no hay nadie en el tablón. Se entra compartiendo una toma en la Sala de visionado.'}
                </p>
                {modo === 'ver' && (
                    <Link href="/studio" className="mt-3 inline-block text-sm font-bold text-amber-300 underline-offset-4 hover:underline">
                        Grabar mi toma en el Plató
                    </Link>
                )}
            </div>
        );
    }

    return (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actores.slice(0, tope).map(a => {
                const marcado = elegido?.uid === a.uid;
                const ficha = (
                    <>
                        <span
                            aria-hidden="true"
                            className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-black',
                                marcado ? 'border-amber-300 bg-amber-400 text-black' : 'border-amber-400/40 bg-amber-500/10 text-amber-300',
                            )}
                        >
                            {iniciales(a.nombre)}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-white/90">{a.nombre}</span>
                            <span className="block text-[11px] text-zinc-500">
                                {a.tomas === 1 ? '1 toma compartida' : `${a.tomas} tomas compartidas`}
                                {a.bravos > 0 && ` · ${a.bravos} ${a.bravos === 1 ? 'bravo' : 'bravos'}`}
                            </span>
                        </span>
                    </>
                );

                if (modo === 'elegir') {
                    return (
                        <li key={a.uid}>
                            <button
                                type="button"
                                aria-pressed={marcado}
                                onClick={() => onElegir?.(marcado ? null : { uid: a.uid, nombre: a.nombre })}
                                className={cn(
                                    'flex min-h-11 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors',
                                    marcado
                                        ? 'border-amber-400 bg-amber-500/15'
                                        : 'border-white/10 bg-white/[0.03] hover:border-amber-400/40 hover:bg-white/[0.06]',
                                )}
                            >
                                {ficha}
                                <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.15em] text-amber-300">
                                    {marcado ? 'Elegido' : 'Elegir'}
                                </span>
                            </button>
                        </li>
                    );
                }

                return (
                    <li key={a.uid}>
                        <Link
                            href="/comunidad"
                            className="flex min-h-11 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-amber-400/40 hover:bg-white/[0.06]"
                        >
                            {ficha}
                            <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.15em] text-amber-300/80">Ver tomas</span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
