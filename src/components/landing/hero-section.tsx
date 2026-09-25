'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { useAnimate } from 'framer-motion';
import { LazyVideo } from '@/components/landing/lazy-video';

/**
 * LA PRIMERA PANTALLA.
 *
 * Antes era un vídeo oscuro visto a través de las letras "SCENE ME", y tres
 * pantallas de scroll que sólo servían para hacer zoom sobre esas letras. Quien
 * llegaba no sabía qué era esto ni para qué bajar: el scroll no enseñaba nada
 * nuevo durante el primer tramo, así que parecía que la página no respondía.
 *
 * Ahora la primera pantalla contesta tres preguntas antes de pedir nada:
 * quiénes sois (el logo), qué hacéis (el titular), y qué hago yo ahora (dos
 * botones). El vídeo se queda, pero de fondo: es ambiente, no el mensaje.
 *
 * LA ENTRADILLA
 *
 * La primera vez en la sesión, el logo aparece grande en el centro y luego
 * sube a su sitio mientras entra el resto. Es la misma cortinilla de marca que
 * hay en las demás páginas, pero aquí no tapa la portada: se convierte en ella.
 * Por eso en "/" la cortinilla general no sale (ver splash-screen.tsx), y las
 * dos comparten la misma marca de sesión: el logo se presenta una vez, entres
 * por donde entres.
 *
 * SI EL JS TARDA
 *
 * Todo empieza invisible para que la entradilla pueda colocarlo. Eso tiene un
 * riesgo: en un móvil lento, hasta que llega el JS la portada es una pantalla
 * oscura sin nada. Así que hay una red en CSS (.portada, en globals.css): si a
 * los 2,4 s React todavía no ha tomado el control, el contenido aparece solo.
 * Y si React llega después de eso, no repite la entradilla encima.
 *
 * INVITAR A BAJAR
 *
 * Una flecha que bota no convence a nadie. Lo que hace bajar es ver que abajo
 * hay algo: por eso en el borde inferior asoman trabajos reales, cortados por
 * el final de la pantalla.
 */

const SESION = 'sceneme_splash_shown';

const ASOMAN = [
    { poster: '/videos/AMANDA-loop-poster.jpg', alt: 'Escena de AMANDA' },
    { poster: '/videos/OLIVER-loop-poster.jpg', alt: 'Escena de OLIVER' },
    { poster: '/videos/SHOGUN-loop-poster.jpg', alt: 'Escena de SHOGUN' },
    { poster: '/videos/SONIA_DORADO-loop-poster.jpg', alt: 'Escena de SONIA DORADO' },
    { poster: '/videos/MUDANZA-loop-poster.jpg', alt: 'Escena de MUDANZA' },
];

export function HeroSection() {
    const [ambito, animar] = useAnimate();
    const logo = useRef<HTMLDivElement>(null);

    // Layout y no effect normal: hay que colocar el logo en el centro ANTES de
    // que el navegador pinte, o se vería un fotograma en su sitio final y
    // luego un salto al centro.
    // ¿Toca entradilla? Se decide UNA vez por montaje y se guarda aquí, no se
    // vuelve a leer de la sesión. React, en desarrollo, ejecuta cada efecto dos
    // veces seguidas para destapar fallos; la segunda lectura encontraba la
    // marca que acababa de poner la primera, creía que la entradilla ya se
    // había visto y la cortaba a medias. Un ref sobrevive a esa doble pasada;
    // una visita nueva a la portada es otro montaje y vuelve a preguntar.
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
                // Navegación privada estricta: sin memoria, se trata como ya
                // visto para no repetir la entradilla en cada recarga.
                primeraVez.current = false;
            }
        }

        // Si el JS ha tardado tanto que el CSS ya ha sacado el contenido por su
        // cuenta (ver .portada en globals.css), no se le da la vuelta para
        // hacer la entradilla: se queda como está, sin parpadeo.
        const tarde = performance.now() > 2300;
        ambito.current?.setAttribute('data-hidratada', '');

        const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const resto = '[data-entra]';

        if (!primeraVez.current || quieto || tarde) {
            const inmediato = quieto || tarde;
            animar(el, { opacity: 1 }, { duration: inmediato ? 0 : 0.4 });
            animar(resto, { opacity: 1, y: 0 }, { duration: inmediato ? 0 : 0.5, delay: inmediato ? 0 : 0.05 });
            return;
        }

        // Cuánto hay que mover el logo para que quede en el centro exacto de
        // la pantalla, y cuánto agrandarlo para que llene sin salirse. Se mide
        // sin transformación: si esta es la segunda pasada, el logo ya viene
        // movido de la primera y la medida saldría torcida.
        el.style.transform = 'none';
        const r = el.getBoundingClientRect();
        const dy = window.innerHeight / 2 - (r.top + r.height / 2);
        const escala = Math.min(window.innerWidth * 0.62, window.innerHeight * 0.5) / r.width;

        let vivo = true;
        (async () => {
            await animar(el, { y: dy, scale: escala * 0.86, opacity: 0 }, { duration: 0 });
            if (!vivo) return;
            await animar(el, { scale: escala, opacity: 1 }, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
            if (!vivo) return;
            await animar(el, { y: 0, scale: 1 }, { duration: 0.85, delay: 0.45, ease: [0.65, 0, 0.35, 1] });
        })();
        const entrada = animar(resto, { opacity: 1, y: 0 }, { duration: 0.6, delay: 1.55 });

        return () => {
            vivo = false;
            entrada.stop();
        };
    }, [animar, ambito]);

    return (
        <section
            ref={ambito}
            className="portada relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#07080c]"
        >
            {/* Fondo: el reel, oscurecido. Da ambiente de rodaje sin competir con el texto. */}
            <div className="absolute inset-0 -z-10" aria-hidden="true">
                <LazyVideo
                    src="/videos/MIX-cine-loop.mp4"
                    poster="/videos/MIX-cine-loop-poster.jpg"
                    className="h-full w-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#07080c]/70 via-[#07080c]/55 to-[#07080c]" />
                {/* El mismo oro del logo, detrás del logo: le da de dónde salir. */}
                <div className="absolute left-1/2 top-[38%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,176,64,0.22)_0%,rgba(232,176,64,0.06)_45%,transparent_70%)]" />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-5 pb-40 pt-16 text-center sm:pb-48">
                <div
                    ref={logo}
                    data-logo
                    className="mb-7 w-[clamp(132px,20vmin,200px)] opacity-0 will-change-transform"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/splash-logo.webp"
                        alt="Scene Me Studios"
                        width={512}
                        height={512}
                        fetchPriority="high"
                        className="h-auto w-full drop-shadow-[0_12px_40px_rgba(232,176,64,0.28)]"
                    />
                </div>

                <p
                    data-entra
                    className="mb-4 translate-y-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[hsl(42,90%,60%)] opacity-0 sm:text-xs"
                >
                    Estudio para actores · Madrid
                </p>

                <h1
                    data-entra
                    className="max-w-[18ch] translate-y-3 text-balance text-[clamp(2rem,6vw,4.25rem)] font-bold leading-[1.05] text-white opacity-0"
                    style={{ fontFamily: "'Cinzel', serif" }}
                >
                    Graba el material que te abre puertas
                </h1>

                <p
                    data-entra
                    className="mt-5 max-w-[46ch] translate-y-3 text-base leading-relaxed text-white/70 opacity-0 sm:text-lg"
                >
                    Videobooks, escenas de cine y self-tapes con dirección, en nuestro estudio.
                    Y un ensayador con IA para preparar tus textos cuando quieras.
                </p>

                <div
                    data-entra
                    className="mt-9 flex w-full max-w-md translate-y-3 flex-col gap-3 opacity-0 sm:w-auto sm:max-w-none sm:flex-row"
                >
                    <Link
                        href="/booking"
                        className="inline-flex items-center justify-center rounded-full bg-[hsl(42,90%,55%)] px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-[hsl(42,95%,62%)]"
                    >
                        Reserva tu grabación
                    </Link>
                    <Link
                        href="/studio"
                        className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:border-white/50 hover:bg-white/5"
                    >
                        Ensaya gratis con IA
                    </Link>
                </div>
            </div>

            {/* Lo que asoma: trabajos reales cortados por el borde de la pantalla. */}
            <a
                href="#trabajos"
                data-entra
                className="group absolute inset-x-0 bottom-0 translate-y-3 opacity-0"
                aria-label="Ver trabajos recientes"
            >
                <p className="mb-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/55 transition group-hover:text-white/80">
                    Trabajos recientes
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </p>
                <div className="flex translate-y-[45%] justify-center gap-3 px-3 transition-transform duration-500 group-hover:translate-y-[30%] sm:gap-4">
                    {ASOMAN.map((t, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            key={t.poster}
                            src={t.poster}
                            alt={t.alt}
                            loading="lazy"
                            className={`aspect-video w-[42vw] max-w-[260px] rounded-xl object-cover ring-1 ring-white/10 sm:w-[20vw] ${i === 2 ? 'hidden sm:block' : ''} ${i > 2 ? 'hidden md:block' : ''}`}
                        />
                    ))}
                </div>
            </a>
        </section>
    );
}
