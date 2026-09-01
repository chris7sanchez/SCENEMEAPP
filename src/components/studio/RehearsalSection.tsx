'use client';

import React, { useState } from 'react';
import { getOrCreateDailyScene } from '@/lib/studio-db';
import RehearsalPlayer from '@/components/studio/RehearsalPlayer';

export default function RehearsalSection({ dateKey }: { dateKey: string }) {
    const [script, setScript] = useState('');
    const [loadingScene, setLoadingScene] = useState(false);
    const [open, setOpen] = useState(false);

    const useToday = async () => {
        setLoadingScene(true);
        try {
            const scene = await getOrCreateDailyScene(dateKey);
            const text = scene.lines.map(l => `${l.character}: ${l.text}`).join('\n');
            setScript(text);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingScene(false);
        }
    };

    return (
        <section className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 p-5 sm:p-7">
            <div>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                    <span className="mr-2 rounded-full border border-zinc-600 bg-white/5 px-2 py-0.5 text-[10px] font-black text-zinc-300">2</span>
                    Ensayar con réplicas
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">Tu compañero de reparto 🎭</h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Pega una escena (o usa la de hoy), elige tu personaje y la app te lee las
                    líneas del otro y se calla en las tuyas. Con «avance por voz», di tu frase,
                    calla… y te responde.
                </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    onClick={useToday}
                    disabled={loadingScene}
                    className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-bold text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-60"
                >
                    {loadingScene ? 'Cargando…' : 'Usar la escena de hoy'}
                </button>
            </div>

            <textarea
                value={script}
                onChange={e => setScript(e.target.value)}
                placeholder={'Pega tu escena aquí. Ejemplo:\nANA: ¿De verdad pensabas que no me iba a enterar?\nLUIS: No quería hacerte daño.'}
                className="mt-3 h-40 w-full resize-y rounded-xl border border-zinc-700 bg-black/40 p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/60 focus:outline-none"
            />

            <button
                onClick={() => setOpen(true)}
                disabled={!script.trim()}
                className="mt-3 w-full rounded-full bg-amber-500 py-3 text-sm font-black text-black transition hover:bg-amber-400 disabled:opacity-50"
            >
                ENSAYAR
            </button>

            {open && <RehearsalPlayer script={script} onClose={() => setOpen(false)} />}
        </section>
    );
}
