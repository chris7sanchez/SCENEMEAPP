'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAnimate } from 'framer-motion';
import { conexionPobre } from '@/components/landing/lazy-video';

/**
 * LA PRIMERA PANTALLA: EL MONITOR DE RODAJE.
 *
 * Lo que había que conseguir no era "que se vea el logo". Era que quien llega
 * entienda, sin leer nada, que ese vídeo es TRABAJO NUESTRO: que Scene Me es
 * una productora y eso lo ha rodado ella. La versión anterior tenía el reel
 * oscurecido al 35 % detrás del texto, y así un reel no parece un reel: parece
 * un fondo bonito, como el de cualquier plantilla.
 *
 * Así que ahora el reel es lo principal, a plena luz, y todo lo demás está
 * pensado para decir "esto es un rodaje":
 *
 *   - El marco de un monitor de cámara: las cuatro esquinas del visor, el
 *     punto rojo de REC y el código de tiempo corriendo. Es el lenguaje que
 *     cualquiera reconoce de un set, y lo dice sin una palabra.
 *   - Un rótulo "EN PANTALLA" que nombra cada pieza mientras pasa, como los
 *     créditos de un programa: qué es y que se rodó aquí. El reel va cambiando
 *     de pieza cada pocos segundos, para que se vea que son muchas producciones
 *     y no un vídeo de archivo.
 *   - El titular se refiere a lo que se está viendo: "Esto lo hemos rodado
 *     nosotros".
 *
 * El logo mantiene su entradilla (grande en el centro la primera vez en la
 * sesión, y luego a su sitio), pero su sitio ahora es la esquina, pequeño,
 * como la marca de una cadena en una emisión: el protagonista es el reel.
 */

const SESION = 'sceneme_splash_shown';

/**
 * Las piezas del reel, en el orden en que pasan. Sólo se dice qué TIPO de
 * pieza es cuando se sabe (sale de services-grid, que ya las usa como ejemplo
 * de cada servicio); del resto se dice lo que es seguro: que se rodó aquí.
 */
// El orden importa: la primera pieza es lo primero que se ve, y su primer
// fotograma sale antes que el vídeo. Tiene que ser una cara bien iluminada. El
// montaje de cine arranca con humo morado y a esa distancia no se entiende
// nada, así que va al final.
const PIEZAS = [
    { id: 'SHOGUN', titulo: '«Shogun»', tipo: 'Self-tape con dirección' },
    { id: 'AMANDA', titulo: '«Amanda»', tipo: 'Rodado en nuestro estudio' },
    { id: 'OLIVER', titulo: '«Oliver»', tipo: 'Rodado en nuestro estudio' },
    { id: 'SONIA_DORADO', titulo: '«Sonia Dorado»', tipo: 'Rodado en nuestro estudio' },
    { id: 'MUDANZA', titulo: '«Mudanza»', tipo: 'Rodado en nuestro estudio' },
    { id: 'Mel_cuban', titulo: '«Mel Cuban»', tipo: 'Rodado en nuestro estudio' },
    { id: 'MIX-cine', titulo: 'Escenas de cine', tipo: 'Montaje de varias piezas' },
].map(p => ({ ...p, src: `/videos/${p.id}-loop.mp4`, poster: `/videos/${p.id}-loop-poster.jpg` }));

/** Segundos que se queda cada pieza. Los cortes duran 16; con la mitad basta para reconocerla. */
const DURA = 7;

// --- El reel ---------------------------------------------------------------

/**
 * Tres vídeos en el DOM como mucho: el que se va (fundiéndose), el que está, y
 * el siguiente, ya cargando pero quieto e invisible. Así el cambio de pieza no
 * espera a la red. Cada vídeo va con su `key`, de modo que cuando "el
 * siguiente" pasa a ser "el que está" es el MISMO elemento, ya cargado: no se
 * vuelve a descargar.
 *
 * Con conexión pobre o "reducir movimiento", ni rotación ni vídeo: el
 * fotograma de la primera pieza, que ya cuenta lo que tiene que contar.
 */
function Reel({ actual, quieto }: { actual: number; quieto: boolean }) {
    const vids = useRef(new Map<string, HTMLVideoElement>());
    const n = PIEZAS.length;
    const anterior = (actual - 1 + n) % n;
    const siguiente = (actual + 1) % n;

    // La pieza que entra, desde el principio; las demás, quietas. Sin esto
    // la siguiente se reproduciría escondida y entraría ya a medias.
    useEffect(() => {
        if (quieto) return;
        vids.current.forEach((v, src) => {
            if (src === PIEZAS[actual].src) {
                v.currentTime = 0;
                v.play().catch(() => { /* sin autoplay: se queda el fotograma, que también vale */ });
            } else if (src !== PIEZAS[anterior].src) {
                v.pause();
            }
        });
    }, [actual, anterior, quieto]);

    if (quieto) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={PIEZAS[0].poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        );
    }

    return (
        <>
            {[anterior, actual, siguiente].map(k => {
                const p = PIEZAS[k];
                const visible = k === actual;
                return (
                    <video
                        key={p.src}
                        ref={el => { if (el) vids.current.set(p.src, el); else vids.current.delete(p.src); }}
                        src={p.src}
                        poster={p.poster}
                        muted
                        playsInline
                        loop
                        autoPlay={k === actual}
                        preload={k === anterior ? 'none' : 'auto'}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
                    />
                );
            })}
        </>
    );
}

// --- El marco del monitor --------------------------------------------------

/** HH:MM:SS:FF a 25 fotogramas, que es como lo pinta un monitor en Europa. */
function codigoDeTiempo(ms: number) {
    const f = Math.floor(ms / 40);
    const dos = (x: number) => String(x).padStart(2, '0');
    return `${dos(Math.floor(f / 90000))}:${dos(Math.floor(f / 1500) % 60)}:${dos(Math.floor(f / 25) % 60)}:${dos(f % 25)}`;
}

function Monitor({ quieto }: { quieto: boolean }) {
    const tc = useRef<HTMLSpanElement>(null);

    // El código de tiempo se escribe directamente en el DOM, fotograma a
    // fotograma, sin pasar por React: re-renderizar la portada 60 veces por
    // segundo para cambiar ocho cifras sería tirar la batería del móvil.
    useEffect(() => {
        if (quieto) return;
        const t0 = performance.now();
        let id = 0;
        const pinta = () => {
            if (tc.current) tc.current.textContent = codigoDeTiempo(performance.now() - t0);
            id = requestAnimationFrame(pinta);
        };
        id = requestAnimationFrame(pinta);
        return () => cancelAnimationFrame(id);
    }, [quieto]);

    const esquina = 'absolute h-6 w-6 border-white/70 sm:h-10 sm:w-10';
    return (
        <div className="pointer-events-none absolute inset-3 z-10 sm:inset-6" aria-hidden="true">
            <span className={`${esquina} left-0 top-0 border-l-2 border-t-2`} />
            <span className={`${esquina} right-0 top-0 border-r-2 border-t-2`} />
            <span className={`${esquina} bottom-0 left-0 border-b-2 border-l-2`} />
            <span className={`${esquina} bottom-0 right-0 border-b-2 border-r-2`} />

            <div className="absolute left-4 top-3 font-mono text-[11px] tracking-wider sm:left-7 sm:top-5 sm:text-xs">
                <div className="flex items-center gap-2 text-white/85">
                    <span className={`h-2.5 w-2.5 rounded-full bg-red-500 ${quieto ? '' : 'animate-pulse'}`} />
                    REC
                    <span ref={tc} className="ml-1 tabular-nums text-white/60">00:00:00:00</span>
                </div>
                <div className="mt-1 pl-[18px] text-white/50">REEL 2026</div>
            </div>
        </div>
    );
}

// --- La portada --------------------------------------------------------------

export function HeroSection() {
    const [ambito, animar] = useAnimate();
    const logo = useRef<HTMLDivElement>(null);
    const [actual, setActual] = useState(0);
    const [quieto, setQuieto] = useState(false);

    // ¿Toca entradilla? Se decide UNA vez por montaje y se guarda aquí, no se
    // vuelve a leer de la sesión. React, en desarrollo, ejecuta cada efecto dos
    // veces seguidas; la segunda lectura encontraba la marca que acababa de
    // poner la primera y cortaba la entradilla a medias. Un ref sobrevive a esa
    // doble pasada; una visita nueva a la portada es otro montaje.
    const primeraVez = useRef<boolean | null>(null);

    // Layout y no effect normal: hay que colocar el logo en el centro ANTES de
    // que el navegador pinte, o se vería un fotograma en su sitio final y
    // luego un salto al centro.
    useLayoutEffect(() => {
        const el = logo.current;
        if (!el) return;

        if (primeraVez.current === null) {
            try {
                primeraVez.current = sessionStorage.getItem(SESION) !== 'true';
                sessionStorage.setItem(SESION, 'true');
            } catch {
                primeraVez.current = false;
            }
        }

        // Si el JS ha tardado tanto que el CSS ya ha sacado el contenido por su
        // cuenta (ver .portada en globals.css), no se le da la vuelta para
        // hacer la entradilla: se queda como está, sin parpadeo.
        const tarde = performance.now() > 2300;
        ambito.current?.setAttribute('data-hidratada', '');

        const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const resto = '[data-entra]';

        if (!primeraVez.current || sinMovimiento || tarde) {
            const inmediato = sinMovimiento || tarde;
            animar(el, { opacity: 1 }, { duration: inmediato ? 0 : 0.4 });
            animar(resto, { opacity: 1, y: 0 }, { duration: inmediato ? 0 : 0.5, delay: inmediato ? 0 : 0.05 });
            return;
        }

        // Cuánto hay que mover el logo para que quede en el centro exacto de
        // la pantalla -en horizontal Y en vertical: su sitio final es una
        // esquina-, y cuánto agrandarlo. Se mide sin transformación: en la
        // segunda pasada el logo ya viene movido de la primera.
        el.style.transform = 'none';
        const r = el.getBoundingClientRect();
        const dx = window.innerWidth / 2 - (r.left + r.width / 2);
        const dy = window.innerHeight / 2 - (r.top + r.height / 2);
        const escala = Math.min(window.innerWidth * 0.62, window.innerHeight * 0.5) / r.width;

        let vivo = true;
        (async () => {
            await animar(el, { x: dx, y: dy, scale: escala * 0.86, opacity: 0 }, { duration: 0 });
            if (!vivo) return;
            await animar(el, { scale: escala, opacity: 1 }, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
            if (!vivo) return;
            await animar(el, { x: 0, y: 0, scale: 1 }, { duration: 0.85, delay: 0.45, ease: [0.65, 0, 0.35, 1] });
        })();
        const entrada = animar(resto, { opacity: 1, y: 0 }, { duration: 0.6, delay: 1.55 });

        return () => {
            vivo = false;
            entrada.stop();
        };
    }, [animar, ambito]);

    // Conexión pobre o "reducir movimiento": un fotograma y nada que se mueva.
    // Se mira después de montar porque en el servidor no hay navegador.
    useEffect(() => {
        const q = conexionPobre() || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (q) queueMicrotask(() => setQuieto(true));
    }, []);

    // El reel cambia de pieza cada DURA segundos, pero sólo mientras se ve:
    // con la portada fuera de pantalla o la pestaña escondida no tiene sentido
    // estar descargando vídeos que nadie mira.
    useEffect(() => {
        if (quieto) return;
        const seccion = ambito.current as HTMLElement | null;
        let enVista = true;
        const obs = new IntersectionObserver(([e]) => { enVista = e.isIntersecting; }, { threshold: 0.2 });
        if (seccion) obs.observe(seccion);
        const id = setInterval(() => {
            if (enVista && !document.hidden) setActual(a => (a + 1) % PIEZAS.length);
        }, DURA * 1000);
        return () => { clearInterval(id); obs.disconnect(); };
    }, [quieto, ambito]);

    const pieza = PIEZAS[actual];

    return (
        <section
            ref={ambito}
            className="portada relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-black text-white"
        >
            {/* El reel, a plena luz: es lo que se enseña. */}
            <div className="absolute inset-0 -z-10">
                <Reel actual={actual} quieto={quieto} />
                {/* Sombras sólo donde hay texto encima: arriba para el REC, abajo para el titular. */}
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>

            <Monitor quieto={quieto} />

            <div className="relative flex min-h-[100svh] flex-col px-6 pb-10 pt-12 sm:px-12 sm:pb-14 sm:pt-14">
                {/* La marca, en la esquina, como en una emisión. Centrada arriba le
                    caía encima de la cara al actor: casi todas las piezas están
                    encuadradas al centro. */}
                <div className="absolute right-6 top-5 z-20 sm:right-10 sm:top-8">
                    <div ref={logo} data-logo className="w-[clamp(60px,8vmin,96px)] opacity-0 will-change-transform">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/splash-logo.webp"
                            alt="Scene Me Studios"
                            width={512}
                            height={512}
                            fetchPriority="high"
                            className="h-auto w-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                        />
                    </div>
                </div>

                <div className="flex-1" />

                <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
                    <div>
                        {/* En móvil, el rótulo de la pieza va encima del titular, en una línea. */}
                        <p data-entra className="mb-4 translate-y-3 font-mono text-[11px] uppercase tracking-widest text-white/70 opacity-0 lg:hidden">
                            <span className="text-[hsl(42,90%,60%)]">En pantalla</span> · {pieza.titulo}
                        </p>

                        <p data-entra className="mb-3 translate-y-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(42,90%,60%)] opacity-0 sm:text-xs sm:tracking-[0.35em]">
                            Productora para actores · Madrid
                        </p>

                        <h1
                            data-entra
                            className="max-w-[20ch] translate-y-3 text-balance text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[1.02] opacity-0"
                            style={{ fontFamily: "'Cinzel', serif" }}
                        >
                            Esto lo hemos rodado nosotros
                        </h1>

                        <p data-entra className="mt-4 max-w-[48ch] translate-y-3 text-base leading-relaxed text-white/80 opacity-0 sm:text-lg">
                            Videobooks, escenas de cine y self-tapes con dirección. Tú pones el talento;
                            nosotros, la cámara, la luz, el sonido y el montaje.
                        </p>

                        <div data-entra className="mt-7 flex translate-y-3 flex-col gap-3 opacity-0 sm:flex-row">
                            <Link
                                href="/booking"
                                className="inline-flex items-center justify-center rounded-full bg-[hsl(42,90%,55%)] px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-[hsl(42,95%,62%)]"
                            >
                                Reserva tu grabación
                            </Link>
                            <Link
                                href="/studio"
                                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-black/20 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10"
                            >
                                Ensaya gratis con IA
                            </Link>
                        </div>
                    </div>

                    {/* El rótulo de la pieza, como un crédito de televisión. */}
                    <div data-entra className="hidden w-72 translate-y-3 opacity-0 lg:block">
                        <p className="font-mono text-[11px] uppercase tracking-widest text-[hsl(42,90%,60%)]">En pantalla</p>
                        <p className="mt-1 text-2xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>{pieza.titulo}</p>
                        <p className="text-sm text-white/70">{pieza.tipo}</p>
                        <div className="mt-4 flex gap-1.5">
                            {PIEZAS.map((p, i) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setActual(i)}
                                    aria-label={`Ver ${p.titulo}`}
                                    className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"
                                >
                                    {i === actual && !quieto && (
                                        <span
                                            key={`${p.id}-${actual}`}
                                            className="block h-full origin-left bg-white"
                                            style={{ animation: `reel-avanza ${DURA}s linear forwards` }}
                                        />
                                    )}
                                    {(i < actual || (quieto && i === actual)) && <span className="block h-full bg-white/70" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <a
                    href="#servicios"
                    data-entra
                    className="mx-auto mt-10 flex translate-y-3 items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/60 opacity-0 transition hover:text-white"
                >
                    Qué grabamos
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </a>
            </div>
        </section>
    );
}
