'use client';

import React, { useState } from 'react';
import { getOrCreateDailyScene } from '@/lib/studio-db';
import type { DailyScene as Scene } from '@/lib/daily-scene';

export default function DailyScene({ dateKey }: { dateKey: string }) {
    const [scene, setScene] = useState<Scene | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const reveal = async () => {
        setLoading(true);
        setError('');
        try {
            const s = await getOrCreateDailyScene(dateKey);
            setScene(s);
        } catch (e: any) {
            setError('No se pudo cargar la escena de hoy. Inténtalo de nuevo.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="rounded-2xl border border-amber-500/30 bg-zinc-900/60 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-400/80">Escena del día</p>
                    <h2 className="text-lg font-semibold text-white sm:text-xl">{dateKey}</h2>
                </div>
                {!scene && (
                    <button
                        onClick={reveal}
                        disabled={loading}
                        className="rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-60"
                    >
                        {loading ? 'Generando…' : 'REVELAR ESCENA'}
                    </button>
                )}
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            {scene && (
                <div className="mt-5">
                    <h3 className="text-xl font-bold text-amber-300">{scene.title}</h3>
                    {scene.synopsis && <p className="mt-1 text-sm text-zinc-400">{scene.synopsis}</p>}
                    <div className="mt-4 space-y-3">
                        {scene.lines.map((l, i) => (
                            <p key={i} className="leading-relaxed text-zinc-100">
                                <span className="mr-2 font-bold uppercase text-amber-400">{l.character}:</span>
                                {l.text}
                            </p>
                        ))}
                    </div>
                    <p className="mt-5 text-xs text-zinc-500">
                        Interprétala, grábate y sube tu toma abajo. Mañana habrá una escena nueva.
                    </p>
                </div>
            )}
        </section>
    );
}
