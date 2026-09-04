'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dailyKey, computeStreak } from '@/lib/daily-scene';
import DailyScene from '@/components/studio/DailyScene';
import RehearsalSection from '@/components/studio/RehearsalSection';
import MyTasks from '@/components/studio/MyTasks';
import StudioOnboarding from '@/components/studio/StudioOnboarding';
import TakeFeedback from '@/components/studio/TakeFeedback';

const ONBOARDING_KEY = 'sm_studio_onboarding_v1';

export default function StudioPage() {
    const router = useRouter();
    const [uid, setUid] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);
    const [streak, setStreak] = useState(0);
    const [showOnboarding, setShowOnboarding] = useState(false);
    // La fecha se calcula DESPUÉS de montar, nunca durante el render.
    // /studio se prerenderiza estática, así que calcularla en el render horneaba
    // la fecha del despliegue en el HTML: al día siguiente el navegador calculaba
    // otra y saltaba el desajuste de hidratación (React #418), además de pedir la
    // escena del día equivocada.
    const [dateKey, setDateKey] = useState('');

    useEffect(() => { setDateKey(dailyKey()); }, []);

    useEffect(() => {
        import('@/lib/auth').then(async ({ auth }) => {
            const user = await auth.getCurrentUser();
            setUid(user?.uid ?? null);
            setChecked(true);
        });
    }, []);

    // Primera visita: explica cómo funciona el Studio antes de nada.
    // (Con un respiro para que la página pinte primero.)
    useEffect(() => {
        let firstVisit = false;
        try { firstVisit = !localStorage.getItem(ONBOARDING_KEY); } catch { /* modo privado */ }
        if (!firstVisit) return;
        const t = setTimeout(() => setShowOnboarding(true), 400);
        return () => clearTimeout(t);
    }, []);

    const closeOnboarding = () => {
        setShowOnboarding(false);
        try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch { /* */ }
    };

    // Racha real: días seguidos con toma subida.
    useEffect(() => {
        let cancelled = false;
        import('@/lib/studio-db').then(async ({ listMySubmissions }) => {
            if (cancelled) return;
            if (!uid) { setStreak(0); return; }
            try {
                const items = await listMySubmissions(uid);
                if (!cancelled) setStreak(computeStreak(items.map(i => i.date), dateKey));
            } catch { /* sin conexión: sin racha, sin drama */ }
        });
        return () => { cancelled = true; };
    }, [uid, dateKey]);

    return (
        <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white sm:px-6"
            style={{ background: 'hsl(222, 36%, 7%)' }}>

            {/* Fondo: el plató donde acabas de entrar.
                Es el último fotograma del paso, desenfocado y muy bajo, con la
                luz del croma cayendo desde arriba. Así la sección no es "otra
                página": es el espacio en el que te ha dejado el travelling.
                Todo queda por debajo del 16 % para no comerse el contraste del
                texto. */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 20%, hsl(222, 40%, 13%) 0%, hsl(222, 36%, 7%) 70%)' }} />
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: 'url(/backlot/paso-final.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: '50% 58%',
                        filter: 'blur(26px) saturate(0.7)',
                        opacity: 0.14,
                    }} />
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, hsla(136, 34%, 46%, 0.15) 0%, transparent 55%)' }} />
                <div className="absolute left-1/2 top-16 h-[420px] w-[420px] -translate-x-1/2 rounded-full"
                    style={{ background: 'radial-gradient(circle, hsla(42, 90%, 55%, 0.10) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, hsla(210, 60%, 40%, 0.07) 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 mx-auto max-w-3xl">
                <header className="mb-8 text-center">
                    <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-400">Entrena · Ensaya · Publica</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl"
                        style={{
                            background: 'linear-gradient(180deg, hsl(45, 30%, 95%) 0%, hsl(42, 90%, 70%) 55%, hsl(42, 80%, 52%) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 4px 18px hsla(42, 90%, 55%, 0.22))',
                        }}>
                        WE SCENE STUDIO
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Una escena nueva cada día. Tu interpretación. Tu progreso.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        {streak > 0 && (
                            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-amber-300">
                                🔥 Racha: {streak} {streak === 1 ? 'día' : 'días'}
                            </span>
                        )}
                        <button
                            onClick={() => setShowOnboarding(true)}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-300 transition hover:bg-white/10 hover:text-white"
                        >
                            ¿Cómo funciona?
                        </button>
                    </div>
                </header>

                <div className="space-y-6">
                    {!dateKey ? (
                        <p className="text-center text-sm text-zinc-500">Abriendo el plató…</p>
                    ) : (
                    <>
                    <DailyScene dateKey={dateKey} />

                    <RehearsalSection dateKey={dateKey} />

                    <TakeFeedback dateKey={dateKey} />

                    {!checked ? (
                        <p className="text-center text-sm text-zinc-500">Cargando…</p>
                    ) : uid ? (
                        <MyTasks uid={uid} dateKey={dateKey} />
                    ) : (
                        <section className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 p-6 text-center">
                            <p className="text-sm text-zinc-300">
                                Inicia sesión para grabar tu toma, guardar tu progreso y encender tu racha. 🔥
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="mt-4 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
                            >
                                Iniciar sesión
                            </button>
                        </section>
                    )}
                    </>
                    )}
                </div>

                <p className="mt-10 text-center text-[10px] uppercase tracking-[0.4em] text-zinc-600">
                    Scene Me · The actor&apos;s store concept
                </p>
            </div>

            {showOnboarding && <StudioOnboarding onClose={closeOnboarding} />}
        </main>
    );
}
