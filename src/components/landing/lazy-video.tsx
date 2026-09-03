'use client';

import { useEffect, useRef } from 'react';

/**
 * Vídeo decorativo que NO se descarga hasta que está a punto de verse, y que se
 * pausa al salir de pantalla.
 *
 * El muro del hero tiene cinco clips: con `autoPlay` los cinco empezaban a
 * bajar nada más abrir la página (11,6 MB antes de que el usuario hiciera
 * nada). Aquí la descarga arranca en el IntersectionObserver, no al montar.
 */
export function LazyVideo({ src, className, poster }: { src: string; className?: string; poster?: string }) {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observador = new IntersectionObserver(
            (entradas) => {
                for (const entrada of entradas) {
                    if (entrada.isIntersecting) {
                        if (!el.getAttribute('src')) el.setAttribute('src', src);
                        el.play().catch(() => { /* el navegador puede negarlo: no pasa nada */ });
                    } else {
                        el.pause();
                    }
                }
            },
            { rootMargin: '300px' },   // un poco antes de entrar, para que no se note
        );

        observador.observe(el);
        return () => observador.disconnect();
    }, [src]);

    return (
        <video
            ref={ref}
            muted
            loop
            playsInline
            preload="none"
            poster={poster}
            className={className}
        />
    );
}
