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
            <div className="w-80 h-80 md:w-[500px] md:h-[500px] overflow-hidden relative animate-in zoom-in-95 duration-1000 fade-in-0">
                {/* Intentar cargar video, si falla o no existe, mostrar el logo estático */}
                <video
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                    onEnded={() => setIsFading(true)}
                >
                    <source src="/videos/logo-animation.mp4" type="video/mp4" />
                    {/* Fallback a GIF si prefieres usar GIF */}
                    <img
                        src="/logo-animation.gif"
                        alt="Scene Me Logo Animation"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            // Si el GIF también falla, mostrar logo final
                            (e.target as HTMLImageElement).src = "/android-chrome-512x512.png";
                        }}
                    />
                </video>
            </div>
            <h1 className="text-white font-black text-3xl tracking-[0.3em] animate-pulse mt-4">SCENE ME</h1>
        </div>
    );
}
