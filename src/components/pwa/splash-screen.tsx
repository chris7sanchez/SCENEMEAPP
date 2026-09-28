'use client';

import { useState, useEffect } from 'react';
import { LetrasSceneMe } from '@/components/marca/letras-scene-me';

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
        // app "colgada" en negro. Eran 1,9s de espera obligatoria antes de ver
        // nada, sumados a lo que tardara la página; ahora son 1,1s, que siguen
        // dando el golpe de marca sin que parezca que la web no arranca.
        sessionStorage.setItem('sceneme_splash_shown', 'true');
        const fadeTimer = setTimeout(() => setIsFading(true), 600);
        const hideTimer = setTimeout(() => setIsVisible(false), 1100);
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
                {/* Copia ligera del icono SOLO para la cortinilla: el PNG
                    de 512 pesa 458 KB y es lo primero que se descarga en cada
                    página; en WebP son 37 KB y se ve igual. El PNG original se
                    queda donde estaba, que es el icono de la aplicación.
                    Los dos salen del mismo maestro: scripts/iconos.mjs. */}
                <img
                    src="/splash-logo.webp"
                    alt="Scene Me"
                    className="w-full h-full object-contain"
                />
            </div>
            <h1 className="mt-4 animate-pulse"><LetrasSceneMe className="h-8 w-auto md:h-10" /></h1>
        </div>
    );
}
