'use client';

import Link from 'next/link';
import { SALAS, destinoDe, vecinas, rutaEnPatio, type Sala } from '@/lib/estudios-nav';

/**
 * La barra de Los Estudios, al pie de cada sala.
 *
 * Antes, metido en una sala sólo se podía salir hacia atrás con el navegador.
 * Con esto se pasa a la sala de al lado, se vuelve al patio o se sale a la app
 * sin tocar el botón de atrás. La sala que aún no tiene página (la de
 * visionado) no se queda muerta: lleva al patio abierto en ella.
 */
export default function NavEstudios({ actual }: { actual: Sala['id'] }) {
    const { anterior, siguiente, actual: i } = vecinas(actual);
    const previa = SALAS[anterior];
    const proxima = SALAS[siguiente];

    return (
        <nav aria-label="Los Estudios" className="mx-auto mt-14 w-full max-w-5xl px-4 pb-10">
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/70">Los Estudios</span>
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-mono text-white/35">{i + 1} / {SALAS.length}</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                    href={destinoDe(anterior)}
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-amber-400/40 hover:bg-white/[0.06]"
                >
                    <span className="text-lg text-amber-400/60 transition-transform group-hover:-translate-x-0.5">◀</span>
                    <span className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40">Anterior</span>
                        <span className="block truncate text-sm font-bold text-white/90">{previa.stage} · {previa.sala}</span>
                        {!previa.ruta && <span className="block text-[10px] text-amber-400/60">Se visita en el patio</span>}
                    </span>
                </Link>

                <Link
                    href={destinoDe(siguiente)}
                    className="group flex items-center justify-end gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right transition-colors hover:border-amber-400/40 hover:bg-white/[0.06]"
                >
                    <span className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40">Siguiente</span>
                        <span className="block truncate text-sm font-bold text-white/90">{proxima.stage} · {proxima.sala}</span>
                        {!proxima.ruta && <span className="block text-[10px] text-amber-400/60">Se visita en el patio</span>}
                    </span>
                    <span className="text-lg text-amber-400/60 transition-transform group-hover:translate-x-0.5">▶</span>
                </Link>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Link
                    href={rutaEnPatio(i)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white/60 transition-colors hover:border-amber-400/40 hover:text-white"
                >
                    Patio de los estudios
                </Link>
                <Link
                    href="/creator"
                    className="rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-amber-300 transition-colors hover:bg-amber-500/20"
                >
                    Volver a la app
                </Link>
            </div>
        </nav>
    );
}
