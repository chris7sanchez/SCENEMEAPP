'use client';

import { useEffect, useRef, useState } from 'react';
import { conexionPobre } from '@/components/landing/lazy-video';
import { Definicion } from '@/components/landing/definicion';

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
 * (16:9). En pantalla ancha, una franja 32:9 en la que se ve el 60% del alto
 * del fotograma, del 28% al 88%. Las letras están MEDIDAS en el último
 * fotograma (píxeles claros y poco saturados, fila a fila): «SCENE ME» del
 * 43,6% al 56,5% y «Studios» del 65% al 86,3%.
 *
 * Ese 28-88% es lo que pidió Christian: mucho aire por encima del nombre y
 * «Studios» casi rozando abajo. Para que quepa, el vídeo se reduce; se estira
 * sólo un 6% en horizontal (object-fit: fill), que no se nota, y aun así no
 * llega a los bordes: le falta un 5,8% por cada lado. Ese hueco lo llena el
 * último fotograma a toda la franja, desenfocado y oscurecido, y los bordes
 * del vídeo se funden con él (.pel-presentacion-bordes en pelicula.css): la
 * franja sigue llena de lado a lado y no hay filete.
 * Los números: alto de la caja = 1/0,60 = 166,67% de la franja; arriba,
 * -0,28 × 166,67% = -46,67%; ancho = 166,67% × (9/32) × (16/9) × 1,06 =
 * 88,33%, así que empieza en el 5,83%.
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
 * QUE SE VEA SIEMPRE, SIN DEPENDER DEL NAVEGADOR (Christian, 29/09/2026).
 * Un <video> que arranca solo depende de que el navegador lo deje: Safari
 * con la reproducción automática desactivada para el sitio, el iPhone en
 * modo ahorro de batería o un códec que no sepa leer lo paran, y la cabecera
 * se quedaba quieta. Por eso hay TRES caminos, en este orden:
 *   1. el vídeo (1 MB), que es lo normal;
 *   2. si el vídeo no arranca -play() rechazado, error de carga, o a los 3,5 s
 *      tiene datos pero sigue sin avanzar-, la MISMA animación como AVIF
 *      animado (presentacion-animada.avif, 390 kB, 15 fps, una sola pasada).
 *      Una imagen animada no pasa por las reglas de reproducción automática:
 *      se mueve sin gestos ni permisos y se queda en el nombre. (El WebP
 *      animado se probó y a calidad razonable dejaba bloques en el último
 *      fotograma, o pesaba 4,6 MB.) Safari la anima desde la 16.4; el
 *      navegador que no sepa AVIF ve el último fotograma quieto;
 *   3. con «reducir movimiento» o conexión pobre, el último fotograma quieto,
 *      porque ahí lo correcto es no moverse o no gastar datos.
 * El test de src/lib/cabecera-video.test.ts vigila que esto siga así.
 *
 * Sin sonido y sin botón de sonido (Christian, 28/09/2026: el «Ver con
 * sonido» sobraba). El fichero ya no lleva pista de audio.
 */

const VIDEO = '/marca/presentacion.mp4';
const INICIO = '/marca/presentacion-inicio.jpg';
const FINAL = '/marca/presentacion-poster.jpg';
/** La misma animación como AVIF animado (una sola pasada): el plan B, ver arriba. */
const ANIMADA = '/marca/presentacion-animada.avif';
/** Móvil: el fotograma entero. Ancho: ver el cálculo de arriba (28-88%, estirado un 6%). */
const ENCUADRE =
    'absolute inset-0 h-full w-full object-cover sm:inset-auto sm:left-[5.83%] sm:top-[-46.67%] sm:h-[166.67%] sm:w-[88.33%] sm:object-fill';

export function Presentacion() {
    const video = useRef<HTMLVideoElement>(null);
    /** 'video' lo normal; 'animada' si el vídeo no arranca; 'quieto' si no toca moverse. */
    const [modo, setModo] = useState<'video' | 'animada' | 'quieto'>('video');

    useEffect(() => {
        const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (sinMovimiento || conexionPobre()) {
            queueMicrotask(() => setModo('quieto'));
            return;
        }
        const v = video.current;
        if (!v) return;

        let hecho = false;
        const aLaAnimada = () => {
            if (hecho) return;
            hecho = true;
            v.pause();
            setModo('animada');
        };
        // Si a los 3,5 s YA TIENE datos y no ha avanzado ni un fotograma, el
        // navegador lo está parando sin decirlo. Si aún está descargando, se le
        // espera: cambiar a la animada (más pesada) en una conexión lenta sería
        // peor. Si la descarga falla, salta el 'error'.
        const vigia = window.setTimeout(() => {
            if (v.currentTime === 0 && v.readyState >= 2) aLaAnimada();
        }, 3500);
        v.addEventListener('error', aLaAnimada);
        v.play().catch(aLaAnimada);

        return () => {
            window.clearTimeout(vigia);
            v.removeEventListener('error', aLaAnimada);
        };
    }, []);

    return (
        <div className="relative w-full overflow-hidden bg-[#0E0F10]">
            <h2 className="sr-only">SCENE ME Studios</h2>
            <div className="relative mx-auto aspect-video w-full max-w-[1920px] overflow-hidden sm:aspect-[32/9]">
                {/* Relleno de los lados en pantalla ancha: ver el encuadre arriba. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={FINAL} alt="" aria-hidden="true" className="pel-presentacion-relleno hidden sm:block" />
                {modo === 'quieto' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={FINAL} alt="" className={ENCUADRE} />
                ) : modo === 'animada' ? (
                    <picture>
                        <source srcSet={ANIMADA} type="image/avif" />
                        <img src={FINAL} alt="" className={ENCUADRE} />
                    </picture>
                ) : (
                    <video
                        ref={video}
                        src={VIDEO}
                        poster={INICIO}
                        muted
                        playsInline
                        preload="auto"
                        className={ENCUADRE}
                        aria-hidden="true"
                    />
                )}
                {/* Los bordes del vídeo, fundidos con el relleno: una copia del
                    relleno ENCIMA, que sólo se ve en los lados y se desvanece
                    hacia dentro. Antes el fundido era una máscara CSS sobre el
                    propio <video>, y Safari tiene fallos pintando vídeos con
                    máscara (salía en blanco); sobre una imagen no los tiene. */}
                <div className="pel-presentacion-bordes hidden sm:block" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={FINAL} alt="" className="pel-presentacion-relleno" />
                </div>
            </div>

            {/* La cita, abajo a la izquierda sobre el vídeo (lejos del nombre,
                que va en el centro). Por encima de 1920 px el vídeo deja de
                crecer y se centra: la cita le sigue. En el móvil va debajo, en
                la banda negra. */}
            <Definicion className="relative mx-6 my-4 sm:absolute sm:bottom-[7%] sm:left-[max(3%,calc(50%-902px))] sm:z-10 sm:m-0 sm:max-w-[min(27%,520px)]" />
        </div>
    );
}
