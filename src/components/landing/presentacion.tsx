'use client';

import { useEffect, useRef, useState } from 'react';
import { conexionPobre } from '@/components/landing/lazy-video';

/*
 * LA CABECERA: EL NOMBRE SE RUEDA DELANTE DE TI.
 *
 * Un rollo de película dorado se desenrolla y, sobre él, se forma «SCENE ME»,
 * pasa de oro a cromo con un destello y se escribe «Studios» (vídeo aportado
 * por Christian el 28/09/2026; procedencia en public/marca/presentacion.mp4.json).
 * Ocupa la franja de arriba, donde antes estaban el icono y las letras: el
 * vídeo ya es el nombre, así que ponerlo también escrito sería decirlo dos
 * veces. El icono no se pierde, baja a la portada, junto a la llamada, como
 * puerta de entrada (hero.tsx).
 *
 * Se reproduce UNA vez y se queda en el último fotograma, con el nombre
 * formado. En bucle dejaría de ser una entrada y pasaría a ser un
 * salvapantallas.
 *
 * El encuadre: el fotograma entero, siempre, sin recortar. En el móvil ocupa
 * todo el ancho. En pantalla ancha va a la altura de la franja y centrado, con
 * los cuatro bordes fundidos con el cielo de la página (.pel-presentacion en
 * pelicula.css), como una pantalla encendida en mitad del cielo. Se probó a
 * estirarlo a todo el ancho recortando arriba y abajo: el nombre salía enorme
 * y «Studios» quedaba cortado por abajo.
 *
 * El póster depende de lo que vaya a pasar: el primer fotograma si va a
 * arrancar (para no enseñar el nombre hecho y luego deshecho), y el último si
 * no va a arrancar -«reducir movimiento», conexión pobre o reproducción
 * automática bloqueada-: la cabecera nunca se queda sin nombre.
 *
 * El sonido no puede arrancar solo; ningún navegador lo permite. El botón lo
 * pone y vuelve a empezar desde el principio, para que se oiga la entrada
 * entera. El estado va dicho con palabras, sobre fondo opaco porque cae encima
 * de un vídeo.
 */

const VIDEO = '/marca/presentacion.mp4';
const INICIO = '/marca/presentacion-inicio.jpg';
const FINAL = '/marca/presentacion-poster.jpg';

export function Presentacion() {
    const video = useRef<HTMLVideoElement>(null);
    const [quieto, setQuieto] = useState(false);
    const [conSonido, setConSonido] = useState(false);

    useEffect(() => {
        const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (sinMovimiento || conexionPobre()) {
            queueMicrotask(() => setQuieto(true));
            return;
        }
        video.current?.play().catch(() => setQuieto(true));
    }, []);

    const alternarSonido = () => {
        const v = video.current;
        if (!v) return;
        if (conSonido) {
            v.muted = true;
            setConSonido(false);
            return;
        }
        v.muted = false;
        v.currentTime = 0;
        v.play().then(() => setConSonido(true)).catch(() => { v.muted = true; });
    };

    return (
        <div className="relative w-full overflow-hidden bg-[#0E0F10] sm:bg-transparent">
            <h2 className="sr-only">SCENE ME Studios</h2>
            <div className="relative aspect-video w-full sm:aspect-auto sm:h-[clamp(240px,36vh,400px)]">
                {quieto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={FINAL} alt="" className="pel-presentacion mx-auto block aspect-video h-full object-cover" />
                ) : (
                    <video
                        ref={video}
                        src={VIDEO}
                        poster={INICIO}
                        muted
                        playsInline
                        preload="auto"
                        onEnded={() => setConSonido(false)}
                        className="pel-presentacion mx-auto block aspect-video h-full object-cover"
                        aria-hidden="true"
                    />
                )}
                {/* Funde el borde de abajo con el cielo de la página: la
                    cabecera no acaba en un corte, se posa. */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-transparent to-[#0E0F10]/80 sm:hidden" />
            </div>

            {!quieto && (
                <button
                    type="button"
                    onClick={alternarSonido}
                    aria-pressed={conSonido}
                    className="pel-codigo absolute bottom-2 right-2 z-10 min-h-[44px] rounded-[6px] px-4 sm:bottom-4 sm:right-6"
                    style={{ backgroundColor: 'rgba(14, 15, 16, 0.86)' }}
                >
                    {conSonido ? 'Quitar sonido' : 'Ver con sonido'}
                </button>
            )}
        </div>
    );
}
