'use client';

import { BotonPelicula, Codigo, Fotograma, Perforado, useVentanilla } from '@/components/landing/tira';
import Link from 'next/link';
import { icono } from '@/lib/iconos-version';

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
];

export function Hero() {
    const { activo, registrar } = useVentanilla(VENTANILLA.length);

    return (
        <section className="relative overflow-hidden">
            <div className="pel-grano" />

            {/* ---------- Arriba, en el centro: qué es esto ---------- */}
            <div className="relative z-10 flex flex-col items-center gap-6 px-6 pb-12 pt-14 text-center sm:px-10 lg:gap-8 lg:px-14 lg:pb-16 lg:pt-20">
                {/* «self‑tape» con guion que no parte (U+2011): con el normal,
                    el navegador cortaba «SELF-» al final de una línea y «TAPE»
                    al principio de la siguiente. */}
                <h1 className="pel-titulo-seccion max-w-[18ch] text-balance text-[clamp(2.25rem,6vw,5.5rem)]">
                    Tu book, tu escena y tu self‑tape
                </h1>

                <p className="pel-cuerpo max-w-[46ch] text-balance text-[1.0625rem] lg:text-[1.1875rem]">
                    Un studio para el actor, en Madrid. Aquí se rueda el material con
                    el que te presentas y aquí se entrena el actor que lo defiende.
                </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 border-t border-[var(--pel-sombra)] lg:grid-cols-[1fr_51%]">

                {/* ---------- Izquierda: la llamada y las puertas ---------- */}
                <div className="flex flex-col justify-center gap-8 px-6 pb-14 pt-12 sm:px-10 lg:min-h-[72vh] lg:px-14 lg:pb-16 lg:pt-16">

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

                {/* ---------- Derecha: la tira ---------- */}
                <div className="flex flex-col">

                    <div className="relative flex min-h-[70vh] lg:min-h-[72vh]">

                        {/* Margen izquierdo: perforación y el código impreso en vertical. */}
                        <div className="relative flex">
                            <Perforado />
                            <div className="hidden w-9 flex-col items-center justify-center gap-10 sm:flex">
                                <Codigo vertical>16 mm</Codigo>
                                <Codigo vertical>Scene Me</Codigo>
                            </div>
                        </div>

                        {/* Los fotogramas, uno encima de otro. Aquí no se pone nada
                            encima: lo que hay dentro es el trabajo del actor. */}
                        <div className="flex flex-1 flex-col gap-2 py-2">
                            {VENTANILLA.map((f, i) => (
                                <div key={f.nombre} ref={registrar(i)} className="min-h-0 flex-1">
                                    <Fotograma
                                        video={f.video}
                                        poster={f.poster}
                                        alt={f.alt}
                                        activo={i === activo}
                                        className="h-full w-full"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Margen derecho: perforación y el número del que está dentro. */}
                        <div className="relative flex">
                            <div className="hidden w-9 flex-col items-center justify-center sm:flex">
                                <Codigo vertical activo>
                                    {String(activo + 1).padStart(2, '0')} de {String(VENTANILLA.length).padStart(2, '0')}
                                </Codigo>
                            </div>
                            <Perforado />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
