'use client';

import { useState, useEffect } from 'react';

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);

    const [videoReady, setVideoReady] = useState(false);

    useEffect(() => {
        // Check if splash has already been shown in this session
        const hasShownSplash = sessionStorage.getItem('sceneme_splash_shown');
        if (hasShownSplash) {
            setIsVisible(false);
            return;
        }

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        
        // Si ya está listo el video o han pasado mas de 6 segundos de seguridad
        if (videoReady) {
            const timer1 = setTimeout(() => setIsFading(true), 4000); 
            const timer2 = setTimeout(() => {
                setIsVisible(false);
                sessionStorage.setItem('sceneme_splash_shown', 'true');
            }, 5000);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }

        // Timer de seguridad por si el video no carga nunca
        const safetyTimer = setTimeout(() => {
            if (!videoReady) {
                setIsFading(true);
                sessionStorage.setItem('sceneme_splash_shown', 'true');
            }
        }, 6000);

        return () => clearTimeout(safetyTimer);
    }, [videoReady]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center gap-8 transition-opacity duration-700 ease-in-out ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <div className="w-80 h-80 md:w-[500px] md:h-[500px] overflow-hidden relative animate-in zoom-in-95 duration-1000 fade-in-0">
                {/* Intentar cargar video, si falla o no existe, mostrar el logo estático */}
                <video
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                    onCanPlayThrough={() => setVideoReady(true)}
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
