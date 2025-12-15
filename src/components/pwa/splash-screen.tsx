'use client';

import { useState, useEffect } from 'react';

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Double check: if not standalone, hide immediately (redundant to CSS but safe)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (!isStandalone) {
            // Let CSS handle initial hide, but cleanup JS state
            setIsVisible(false);
            return;
        }

        // Logic for PWA consumers
        const timer1 = setTimeout(() => setIsFading(true), 2000); // Start fade after 2s
        const timer2 = setTimeout(() => setIsVisible(false), 2500); // Remove after 2.5s

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={`pwa-splash fixed inset-0 z-[99999] bg-zinc-950 items-center justify-center flex-col gap-6 transition-opacity duration-500 ease-out ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <div className="w-64 h-64 md:w-96 md:h-96 rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-50 duration-700 fade-in-0">
                <img
                    src="/android-chrome-512x512.png"
                    alt="Scene Me Logo"
                    className="w-full h-full object-cover"
                />
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] animate-[shimmer_1.5s_infinite]" />
            </div>
            <h1 className="text-white font-black text-2xl tracking-[0.2em] animate-pulse">SCENE ME</h1>
        </div>
    );
}
