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
 * El encuadre (tercera versión, la que dibujó Christian sobre una captura): el
 * vídeo LLENA la franja de lado a lado. En el móvil, el fotograma entero
 * (16:9). En pantalla ancha, una franja 32:9 en la que se ve el 53% del alto
 * del fotograma, del 35% al 88%. Las letras están MEDIDAS en el último
 * fotograma (píxeles claros y poco saturados, fila a fila): «SCENE ME» del
 * 43,6% al 56,5% y «Studios» del 65% al 86,3%.
 *
 * Ese 35-88% es lo que pidió Christian: aire por encima del nombre y
 * «Studios» casi rozando abajo, mejor que al revés. Para que quepa hay que
 * reducir un poco el vídeo, y el hueco que dejaría a los lados se rellena
 * estirándolo en horizontal un 6% (object-fit: fill sobre una caja 1,88:1 en
 * vez de 1,78:1): a ese punto no se nota, y un filete negro a cada lado sí.
 * Los números: alto de la caja = 1/0,53 = 188,7% de la franja; arriba,
 * -0,35 × 188,7% = -66%.
 *
 * La proporción se mantiene a cualquier ancho (si topara en altura, el
 * encuadre se comería las letras); por encima de 1920 px la franja deja de
 * crecer y se centra.
 *
 * Intentos anteriores, para no repetirlos: estirado a una franja de alto fijo
 * con el encuadre al 60%, y luego al 72% con las letras estimadas a ojo,
 * «Studios» quedaba cortado por abajo; centrado y con
 * los bordes fundidos con el cielo, se veía entero pero no llenaba la franja.
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
/** Móvil: el fotograma entero. Ancho: ver el cálculo de arriba (35-88%, estirado un 6%). */
const ENCUADRE =
    'absolute inset-0 h-full w-full object-cover sm:inset-auto sm:left-0 sm:top-[-66%] sm:h-[188.7%] sm:object-fill';

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
        <div className="relative w-full overflow-hidden bg-[#0E0F10]">
            <h2 className="sr-only">SCENE ME Studios</h2>
            <div className="relative mx-auto aspect-video w-full max-w-[1920px] overflow-hidden sm:aspect-[32/9]">
                {quieto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={FINAL} alt="" className={ENCUADRE} />
                ) : (
                    <video
                        ref={video}
                        src={VIDEO}
                        poster={INICIO}
                        muted
                        playsInline
                        preload="auto"
                        onEnded={() => setConSonido(false)}
                        className={ENCUADRE}
                        aria-hidden="true"
                    />
                )}
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
