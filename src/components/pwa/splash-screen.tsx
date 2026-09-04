'use client';

import { useState, useEffect } from 'react';

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);


    useEffect(() => {
        // Solo una vez por sesión.
        const hasShownSplash = sessionStorage.getItem('sceneme_splash_shown');
        if (hasShownSplash) {
            setIsVisible(false);
            return;
        }
        // Si vienes del backlot, la entrada ya es el plano del paso: la
        // cortinilla en negro lo cortaría justo en el peor momento.
        if (new URLSearchParams(window.location.search).get('desde') === 'backlot') {
            sessionStorage.setItem('sceneme_splash_shown', 'true');
            setIsVisible(false);
            return;
        }
        // Splash breve y FIJO (no depende de que cargue el vídeo): nunca deja la
        // app "colgada" en negro. Funde a ~1,2s y se oculta del todo a ~1,9s.
        sessionStorage.setItem('sceneme_splash_shown', 'true');
        const fadeTimer = setTimeout(() => setIsFading(true), 1200);
        const hideTimer = setTimeout(() => setIsVisible(false), 1900);
        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center gap-8 transition-opacity duration-700 ease-in-out ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <div className="w-80 h-80 md:w-[500px] md:h-[500px] overflow-hidden relative animate-in zoom-in-95 duration-1000 fade-in-0">
                {/* El logo de la marca. Antes habia aqui un <video> con
                    /videos/logo-animation.mp4 y un <img> de respaldo con
                    /logo-animation.gif: ninguno de los dos archivos existe, asi
                    que la cortinilla salia en negro y cada carga de pagina
                    disparaba dos 404. */}
                <img
                    src="/android-chrome-512x512.png"
                    alt="Scene Me"
                    className="w-full h-full object-contain"
                />
            </div>
            <h1 className="text-white font-black text-3xl tracking-[0.3em] animate-pulse mt-4">SCENE ME</h1>
        </div>
    );
}
