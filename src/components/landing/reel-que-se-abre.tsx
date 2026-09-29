'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { LazyVideo } from '@/components/landing/lazy-video';

/*
 * EL REEL QUE SE ABRE. Adaptación de «Scroll Expansion Hero» (21st.dev),
 * según la guía de componentes de Christian (29/09/2026), para la llamada
 * del cierre.
 *
 * Antes el montaje de trabajos (MIX-cine) iba de fondo bajo un velo al 86%:
 * estaba, pero no se veía. Ahora, al bajar, empieza como una ventana en el
 * centro de la pantalla y se abre hasta ocuparla entera; cuando ya está
 * abierto, cae el velo y aparece la llamada encima, con el mismo contraste de
 * antes (el velo acaba en el mismo 0,86).
 *
 * Sin librería: la sección mide 180vh, la capa de dentro va fija (sticky) y
 * un rAF por cuadro convierte lo que se ha bajado en tres variables CSS
 * (--apertura, --velo, --llamada), que .pel-reel usa en pelicula.css.
 *
 * El estado POR DEFECTO es el final (abierto, velo puesto, llamada visible):
 * sin JavaScript, con «reducir movimiento» o si algo falla, la llamada se lee
 * igual que siempre. La animación sólo existe si hay movimiento.
 */

export function ReelQueSeAbre({ children }: { children: ReactNode }) {
    const seccion = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const s = seccion.current;
        if (!s) return;
        const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
        let cuadro = 0;

        const colocar = () => {
            cuadro = 0;
            if (quieto.matches) {
                s.removeAttribute('data-animado');
                return;
            }
            s.setAttribute('data-animado', '');
            const r = s.getBoundingClientRect();
            const recorrido = r.height - window.innerHeight;
            // Si la sección no es más alta que la pantalla (captura de página
            // entera, pantallas rarísimas), se enseña terminada.
            const p = recorrido > 0 ? Math.min(1, Math.max(0, -r.top / recorrido)) : 1;
            const tramo = (a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
            s.style.setProperty('--apertura', tramo(0, 0.55).toFixed(3));
            s.style.setProperty('--velo', tramo(0.5, 0.85).toFixed(3));
            s.style.setProperty('--llamada', tramo(0.7, 0.95).toFixed(3));
        };
        const pedir = () => { if (!cuadro) cuadro = requestAnimationFrame(colocar); };

        window.addEventListener('scroll', pedir, { passive: true });
        window.addEventListener('resize', pedir);
        quieto.addEventListener('change', pedir);
        pedir();
        return () => {
            cancelAnimationFrame(cuadro);
            window.removeEventListener('scroll', pedir);
            window.removeEventListener('resize', pedir);
            quieto.removeEventListener('change', pedir);
        };
    }, []);

    return (
        <div ref={seccion} className="pel-reel">
            <div className="pel-reel__fijo">
                <div className="pel-reel__ventana">
                    <LazyVideo
                        src="/videos/MIX-cine-loop.mp4"
                        poster="/videos/MIX-cine-loop-poster.jpg"
                        className="h-full w-full object-cover"
                    />
                </div>
                {/* El velo. Sin él el texto no se lee, y eso no es negociable. */}
                <div className="pel-reel__velo" aria-hidden="true" />
                <div className="pel-grano" />
                <div className="pel-reel__llamada">{children}</div>
            </div>
        </div>
    );
}
