'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dailyKey } from '@/lib/daily-scene';
import DailyScene from '@/components/studio/DailyScene';
import MyTasks from '@/components/studio/MyTasks';

export default function StudioPage() {
    const router = useRouter();
    const [uid, setUid] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    const dateKey = dailyKey();

    useEffect(() => {
        import('@/lib/auth').then(async ({ auth }) => {
            const user = await auth.getCurrentUser();
            setUid(user?.uid ?? null);
            setChecked(true);
        });
    }, []);

    return (
        <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6">
            <div className="mx-auto max-w-3xl">
                <header className="mb-8 text-center">
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        WE SCENE <span className="text-amber-400">STUDIO</span>
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Entrena cada día. Una escena nueva, tu interpretación, tu progreso.
                    </p>
                </header>

                <div className="space-y-6">
                    <DailyScene dateKey={dateKey} />

                    {!checked ? (
                        <p className="text-center text-sm text-zinc-500">Cargando…</p>
                    ) : uid ? (
                        <MyTasks uid={uid} dateKey={dateKey} />
                    ) : (
                        <section className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 p-6 text-center">
                            <p className="text-sm text-zinc-300">
                                Inicia sesión para grabar tu toma y guardar tu progreso.
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="mt-4 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
                            >
                                Iniciar sesión
                            </button>
                        </section>
                    )}
                </div>
            </div>
        </main>
    );
}
