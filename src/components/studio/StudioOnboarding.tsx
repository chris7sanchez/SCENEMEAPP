'use client';

import React from 'react';

// Explica la estructura del Studio en 3 pasos. Se abre solo la primera visita
// (flag en localStorage) y siempre desde el botón «¿Cómo funciona?».

const STEPS = [
    {
        icon: '🎬',
        title: 'Cada día, una escena nueva',
        text: 'El Studio genera una escena de interpretación distinta cada día. Revélala, léela y hazla tuya: es tu entrenamiento diario de actor.',
    },
    {
        icon: '🎭',
        title: 'Ensaya con tu réplica de IA',
        text: 'La app lee las líneas del otro personaje y se calla en las tuyas, como un compañero de reparto de verdad. Elige su voz, dile CÓMO hablar (con rabia, susurrando…) y avanza por voz: di tu frase, calla, y te responde.',
    },
    {
        icon: '📹',
        title: 'Grábate y publica tu toma',
        text: 'Graba la escena con tu webcam o la cámara del móvil, sube tu toma y guárdala. Cada día que subes una toma, tu racha crece. 🔥',
    },
];

export default function StudioOnboarding({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
            onClick={onClose}>
            <div
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-300"
                style={{ background: 'linear-gradient(160deg, hsl(222,35%,12%) 0%, hsl(222,36%,7%) 100%)' }}
            >
                <button onClick={onClose} aria-label="Cerrar" className="absolute right-4 top-4 rounded-full px-2 py-0.5 text-zinc-500 hover:text-white">✕</button>

                <p className="text-center text-[10px] uppercase tracking-[0.4em] text-amber-400/80">Así funciona</p>
                <h2 className="mt-1 text-center text-2xl font-black tracking-tight text-white">
                    WE SCENE <span className="text-amber-400">STUDIO</span>
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-400">Tu gimnasio de actor. Gratis, cada día.</p>

                <div className="mt-6 space-y-4">
                    {STEPS.map((s, i) => (
                        <div key={s.title} className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-lg">
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/70">Paso {i + 1}</p>
                                <h3 className="font-bold text-white">{s.title}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{s.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-full bg-amber-500 py-4 text-base font-black tracking-wide text-black transition hover:bg-amber-400"
                >
                    ¡A ESCENA! 🎬
                </button>
            </div>
        </div>
    );
}
