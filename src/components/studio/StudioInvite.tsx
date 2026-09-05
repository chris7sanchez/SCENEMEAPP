'use client';

import React, { useEffect, useState } from 'react';
import { dailyKey } from '@/lib/daily-scene';

// Nota de oferta del Studio al entrar en la app: invita, no obliga.
// Se muestra como mucho UNA vez al día y se cierra con un toque.

const SEEN_KEY = 'sm_studio_invite_seen';

export default function StudioInvite() {
    const [open, setOpen] = useState(false);
    const today = dailyKey();

    useEffect(() => {
        try {
            if (localStorage.getItem(SEEN_KEY) === today) return;
        } catch { return; }
        const t = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(t);
    }, [today]);

    const dismiss = () => {
        setOpen(false);
        try { localStorage.setItem(SEEN_KEY, today); } catch { /* */ }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[220] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
            onClick={dismiss}>
            <div
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500"
                style={{ background: 'linear-gradient(160deg, hsl(222,35%,13%) 0%, hsl(222,36%,7%) 100%)' }}
            >
                {/* Glow superior */}
                <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full"
                    style={{ background: 'radial-gradient(circle, hsla(42,90%,55%,0.22) 0%, transparent 70%)' }} />

                <button onClick={dismiss} aria-label="Cerrar" className="absolute right-4 top-3 z-10 rounded-full px-2 py-0.5 text-zinc-500 hover:text-white">✕</button>

                <div className="relative p-6 pt-8 text-center sm:p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400/80">No te lo pierdas</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                        WE SCENE <span className="text-amber-400">STUDIO</span>
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">Tu gimnasio de actor. Gratis, cada día.</p>

                    <ul className="mx-auto mt-5 max-w-xs space-y-2.5 text-left text-sm text-zinc-300">
                        <li className="flex gap-2.5"><span>🎬</span><span>Una <b className="text-white">escena nueva cada día</b> para entrenar.</span></li>
                        <li className="flex gap-2.5"><span>🎭</span><span>Ensaya con una <b className="text-white">réplica de IA</b> que te contesta de verdad.</span></li>
                        <li className="flex gap-2.5"><span>🔥</span><span>Graba tu toma, publícala y <b className="text-white">enciende tu racha</b>.</span></li>
                    </ul>

                    {/* Entrada principal: el backlot arranca con el plano aereo
                        y desde ahi se elige sala. Va como enlace y no con
                        router.push porque /backlot es un HTML estatico. */}
                    <a
                        href="/backlot"
                        onClick={dismiss}
                        className="mt-6 block w-full rounded-full py-4 text-center text-base font-black uppercase tracking-widest text-black transition hover:brightness-110"
                        style={{
                            background: 'linear-gradient(135deg, hsl(42, 90%, 52%) 0%, hsl(38, 85%, 45%) 100%)',
                            boxShadow: '0 4px 24px hsla(42, 90%, 50%, 0.35)',
                        }}
                    >
                        Entrar por el backlot
                    </a>

                    {/* Atajos para quien ya sabe a lo que viene */}
                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">O ve directo a</p>
                    <div className="mt-3 grid gap-2">
                        <a href="/studio" onClick={dismiss}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-amber-400/50 hover:bg-white/10">
                            <span>
                                <span className="block text-sm font-bold text-white">La app</span>
                                <span className="block text-xs text-zinc-400">La escena del día y el ensayo con réplicas</span>
                            </span>
                            <span className="text-amber-300">→</span>
                        </a>
                        <a href="/creator" onClick={dismiss}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-amber-400/50 hover:bg-white/10">
                            <span>
                                <span className="block text-sm font-bold text-white">Taller de creación</span>
                                <span className="block text-xs text-zinc-400">Tu perfil y tu material de trabajo</span>
                            </span>
                            <span className="text-amber-300">→</span>
                        </a>
                        <a href="/booking" onClick={dismiss}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-amber-400/50 hover:bg-white/10">
                            <span>
                                <span className="block text-sm font-bold text-white">Contratar fotos o escenas</span>
                                <span className="block text-xs text-zinc-400">Reserva sesión en la agenda</span>
                            </span>
                            <span className="text-amber-300">→</span>
                        </a>
                    </div>
                    <button onClick={dismiss} className="mt-3 w-full text-xs font-bold uppercase tracking-widest text-zinc-500 transition hover:text-zinc-300">
                        Hoy no
                    </button>
                </div>
            </div>
        </div>
    );
}
