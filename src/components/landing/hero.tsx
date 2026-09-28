'use client';

import { BotonPelicula, Codigo, Fotograma, Perforado, useVentanilla } from '@/components/landing/tira';
import Link from 'next/link';
import { icono } from '@/lib/iconos-version';
import { useEffect, useRef } from 'react';
import { AnimatedText } from '@/components/ui/animated-shiny-text';
import { ORO_BRILLO, ORO_DURACION } from '@/components/landing/oro';

/*
 * El primer pantallazo: el titular y su frase CENTRADOS, a todo lo ancho
 * (Christian, 28/09/2026: que la frase ocupe el centro de la portada), y a
 * partir de ahí la página se parte en dos: la llamada y los botones a la
 * izquierda, y la tira con los vídeos encuadrados a la derecha.
 *
 * LO PRIMERO QUE SE LEE DICE QUÉ ES ESTO (28/09/2026, decisión de Christian).
 * Antes abría la definición -«Un actor interpreta historias…»-, y quien
 * llegaba leía una frase preciosa sin saber todavía qué se le ofrecía: lo
 * concreto (que aquí se rueda tu book, tu escena y tu self-tape) salía
 * pequeño y en tercer lugar. Ahora el titular lo dice con todas las letras
 * -y el texto de debajo, el de siempre, dice dónde y lo de los Estudios-, y
 * la definición abre el Método, que es justo lo que ella anuncia: el paso de
 * actor a estrella. El texto de la definición no se ha tocado.
 *
 * En el móvil, además, la primera pantalla era sólo texto. Ahora lo primero
 * es la cabecera con el vídeo del nombre (presentacion.tsx), que se mueve y
 * es la marca; y el logo baja aquí, junto a la llamada, como puerta de entrada.
 *
 * La tira va sola: el raíl de datos que tenía a su derecha («En la
 * ventanilla: Amanda», pieza, duración, cuadros por segundo) lo quitó
 * Christian el 28/09/2026. Lo que se vende es la imagen, y la imagen basta.
 *
 * LA TIRA EN SEGUNDA CAPA (Christian, 28/09/2026). En pantalla ancha la tira
 * es una capa de fondo que ocupa la mitad derecha de toda la portada, de
 * arriba abajo, y corre con el scroll (parallax): baja la página y la
 * película sube más deprisa que ella, pasando por DETRÁS del titular. Allí,
 * en la franja del titular, la capa se aclara (máscara al 22%) para que se
 * lea lo de delante; debajo va entera. Cinco fotogramas en vez de tres.
 *
 * Los códigos de borde van impresos en la película y corren con ella, como
 * en una tira de verdad: «16 mm» a la izquierda y el número a la derecha, en
 * oro el del fotograma que está en la ventanilla.
 *
 * En el móvil, y con «reducir movimiento», la tira no se mueve: va debajo de
 * la llamada, quieta, con los tres primeros fotogramas.
 */

const VENTANILLA = [
    {
        nombre: 'Amanda',
        video: '/videos/AMANDA-loop.mp4',
        poster: '/videos/AMANDA-loop-poster.jpg',
        alt: 'Fotograma de la escena de Amanda rodada en SCENE ME',
    },
    {
        nombre: 'Rodrigues',
        video: '/videos/SHOGUN-loop.mp4',
        poster: '/videos/SHOGUN-loop-poster.jpg',
        alt: 'Fotograma de la escena de Rodrigues rodada en SCENE ME',
    },
    {
        nombre: 'Sonia Dorado',
        video: '/videos/SONIA_DORADO-loop.mp4',
        poster: '/videos/SONIA_DORADO-loop-poster.jpg',
        alt: 'Fotograma de la escena de Sonia Dorado rodada en SCENE ME',
    },
    {
        nombre: 'Silvia',
        video: '/videos/SILVIA-loop.mp4',
        poster: '/videos/SILVIA-loop-poster.jpg',
        alt: 'Fotograma de la escena de Silvia rodada en SCENE ME',
    },
    {
        nombre: 'Oliver',
        video: '/videos/OLIVER-loop.mp4',
        poster: '/videos/OLIVER-loop-poster.jpg',
        alt: 'Un actor trabajando una escena en los Estudios SCENE ME',
    },
];

/** Cuántos fotogramas salen en el móvil, donde la tira no corre. */
const EN_MOVIL = 3;

/**
 * El parallax de la tira, sin librería: en cada scroll (un rAF como mucho por
 * cuadro) se mira cuánto de la portada ha pasado por la pantalla y la tira se
 * desplaza en proporción, de su borde de arriba a su borde de abajo. Escribe
 * el transform a mano: nada de estado de React en cada cuadro.
 *
 * También deja en la sección la altura del bloque del titular (--velo-fin),
 * que es donde termina la franja en la que la tira se aclara.
 */
function useTiraEnParallax() {
    const seccion = useRef<HTMLElement>(null);
    const titular = useRef<HTMLDivElement>(null);
    const capa = useRef<HTMLDivElement>(null);
    const pista = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const s = seccion.current, t = titular.current, c = capa.current, p = pista.current;
        if (!s || !t || !c || !p) return;

        const ancho = window.matchMedia('(min-width: 1024px)');
        const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
        let cuadro = 0;

        const colocar = () => {
            cuadro = 0;
            if (!ancho.matches || quieto.matches) {
                p.style.transform = '';
                return;
            }
            const r = s.getBoundingClientRect();
            const alto = window.innerHeight;
            const avance = Math.min(1, Math.max(0, (alto - r.top) / (alto + r.height)));
            const recorrido = Math.max(0, p.offsetHeight - c.offsetHeight);
            p.style.transform = `translate3d(0, ${(-avance * recorrido).toFixed(1)}px, 0)`;
        };
        const pedir = () => { if (!cuadro) cuadro = requestAnimationFrame(colocar); };

        const medir = new ResizeObserver(() => {
            s.style.setProperty('--velo-fin', `${t.offsetHeight}px`);
            pedir();
        });
        medir.observe(t);
        medir.observe(s);

        window.addEventListener('scroll', pedir, { passive: true });
        ancho.addEventListener('change', pedir);
        quieto.addEventListener('change', pedir);
        pedir();

        return () => {
            cancelAnimationFrame(cuadro);
            medir.disconnect();
            window.removeEventListener('scroll', pedir);
            ancho.removeEventListener('change', pedir);
            quieto.removeEventListener('change', pedir);
        };
    }, []);

    return { seccion, titular, capa, pista };
}

export function Hero() {
    const { activo, registrar } = useVentanilla(VENTANILLA.length);
    const { seccion, titular, capa, pista } = useTiraEnParallax();
    const total = String(VENTANILLA.length).padStart(2, '0');

    return (
        <section ref={seccion} className="relative overflow-hidden">
            <div className="pel-grano" />

            {/* ---------- Arriba, en el centro: qué es esto ---------- */}
            <div
                ref={titular}
                className="relative z-10 flex flex-col items-center gap-4 px-6 pb-12 pt-14 text-center sm:px-10 lg:gap-5 lg:px-14 lg:pb-16 lg:pt-20"
            >
                {/* Primero la promesa del Método, y debajo, en una línea, lo que
                    se rueda aquí (Christian, 28/09/2026: más compacto y directo;
                    el bloque que había entre los vídeos y EL BOOK desaparece). */}
                {/* En el mismo oro en movimiento que EL BOOK, LA ESCENA y EL
                    SELF‑TAPE, para que los titulares de la página sean una sola
                    familia; un escalón más pequeño que ellos, a propósito. */}
                <AnimatedText
                    as="h1"
                    text={
                        <>
                            De actor a estrella<br />
                            <span className="normal-case">en 3 pasos</span>
                        </>
                    }
                    gradientColors={ORO_BRILLO}
                    gradientAnimationDuration={ORO_DURACION}
                    className="py-0"
                    textClassName="pel-titulo-seccion pel-titulo-oro leading-[0.92] text-[clamp(1.5rem,3vw,2.75rem)] sm:text-[clamp(1.5rem,3vw,2.75rem)] md:text-[clamp(1.5rem,3vw,2.75rem)] lg:text-[clamp(1.5rem,3vw,2.75rem)] xl:text-[clamp(1.5rem,3vw,2.75rem)]"
                />

                {/* «self‑tape» con guion que no parte (U+2011): con el normal,
                    el navegador cortaba «SELF-» al final de una línea y «TAPE»
                    al principio de la siguiente. En una línea a cualquier ancho. */}
                <p className="pel-titulo-seccion whitespace-nowrap text-[clamp(0.9375rem,1.7vw,1.5rem)] text-[var(--pel-emulsion)]">
                    Tu book, tu escena y tu self‑tape
                </p>

                <p className="pel-cuerpo max-w-[46ch] text-balance text-[1.0625rem] lg:text-[1.1875rem]">
                    La forma más cómoda, rápida y profesional para rodar{' '}
                    <strong className="font-semibold uppercase tracking-[0.02em] text-[var(--pel-emulsion)]">tu mejor</strong>{' '}
                    material.
                </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_51%]">

                {/* ---------- Izquierda: la llamada y las puertas ---------- */}
                <div className="flex flex-col justify-center gap-8 px-6 pb-14 pt-4 sm:px-10 lg:min-h-[72vh] lg:px-14 lg:pb-16 lg:pt-8">
                        {/*
                            La llamada, con el logo al lado como PUERTA: pincharlo lleva
                            a entrar (/login). Lo pidió Christian el 28/09/2026 en el
                            hueco que quedaba a la derecha de la llamada; el logo salió
                            de la cabecera cuando entró allí el vídeo del nombre.
                            Al lado en todas las anchuras: la llamada son dos líneas
                            cortas y el logo es cuadrado, caben juntos hasta en 390 px.
                        */}
                        <div className="grid grid-cols-[minmax(0,1fr)_clamp(72px,12vw,176px)] items-center gap-6 lg:gap-10">
                            {/*
                                La llamada, en primera plana y con todas las letras. Va
                                en la voz de rótulo y en gris pleno, no en oro: el oro
                                está reservado para lo que está ocurriendo ahora, y aquí
                                quien lleva la acción es el botón que hay justo debajo.
                            */}
                            <p className="pel-titulo-seccion max-w-[32ch] text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.02]">
                                Empieza a creer en ti,
                                <br />
                                accede a Scene Me
                            </p>

                            <Link
                                href="/login"
                                aria-label="Entrar en SCENE ME"
                                className="block rounded-[21%] transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--pel-oro)]"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={icono('/android-chrome-512x512.png')}
                                    alt=""
                                    width={176}
                                    height={176}
                                    className="h-auto w-full rounded-[21%]"
                                />
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <BotonPelicula href="/booking">Reservar sesión</BotonPelicula>
                            <BotonPelicula href="/login" variante="secundario">
                                Entrar a los Estudios
                            </BotonPelicula>
                        </div>

                        {/* Los dos caminos, como dos entradas de reparto. */}
                        <dl className="mt-2 grid max-w-xl grid-cols-1 gap-px border-t border-[var(--pel-sombra)] pt-6 sm:grid-cols-2 sm:gap-8">
                            <div className="flex flex-col gap-2">
                                <dt className="pel-codigo">Aún no tengo material</dt>
                                <dd>
                                    <a href="#book" className="pel-enlace text-[1.0625rem]">
                                        Empieza por el book
                                    </a>
                                </dd>
                            </div>
                            <div className="flex flex-col gap-2 pt-6 sm:pt-0">
                                <dt className="pel-codigo">El mío ya no me representa</dt>
                                <dd>
                                    <a href="#escena" className="pel-enlace text-[1.0625rem]">
                                        Ve directo a la escena
                                    </a>
                                </dd>
                            </div>
                        </dl>
                </div>
            </div>

            {/* ---------- La tira: segunda capa, a la derecha ----------
                En pantalla ancha va de arriba abajo por detrás de todo, y la
                franja del titular la aclara (.pel-tira-capa). En el móvil va
                en su sitio, debajo de la llamada. */}
            <div
                ref={capa}
                className="pel-tira-capa relative overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:w-[51%]"
            >
                <div
                    ref={pista}
                    className="grid grid-cols-[auto_0_minmax(0,1fr)_0_auto] gap-y-2 will-change-transform sm:grid-cols-[auto_2.25rem_minmax(0,1fr)_2.25rem_auto]"
                >
                    {/* Las perforaciones, de un tirón por los dos cantos. */}
                    <div style={{ gridColumn: 1, gridRow: `1 / span ${VENTANILLA.length}` }} className="flex">
                        <Perforado />
                    </div>
                    <div style={{ gridColumn: 5, gridRow: `1 / span ${VENTANILLA.length}` }} className="flex">
                        <Perforado />
                    </div>

                    {/* Los fotogramas. Aquí no se pone nada encima: lo que hay
                        dentro es el trabajo del actor. */}
                    {VENTANILLA.map((f, i) => {
                        const fila = { gridRow: i + 1 };
                        const soloAncho = i >= EN_MOVIL ? 'hidden lg:flex' : 'flex';
                        return (
                            <div key={f.nombre} className="contents">
                                <div style={{ ...fila, gridColumn: 2 }} className={`${soloAncho} items-center justify-center`}>
                                    <span className="hidden sm:inline" aria-hidden="true">
                                        <Codigo vertical>16 mm</Codigo>
                                    </span>
                                </div>
                                <div
                                    ref={registrar(i)}
                                    style={{ ...fila, gridColumn: 3 }}
                                    className={`${soloAncho} aspect-video min-w-0`}
                                >
                                    <Fotograma
                                        video={f.video}
                                        poster={f.poster}
                                        alt={f.alt}
                                        activo={i === activo}
                                        className="h-full w-full"
                                    />
                                </div>
                                <div style={{ ...fila, gridColumn: 4 }} className={`${soloAncho} items-center justify-center`}>
                                    <span className="hidden sm:inline" aria-hidden="true">
                                        <Codigo vertical activo={i === activo}>
                                            {String(i + 1).padStart(2, '0')} de {total}
                                        </Codigo>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
