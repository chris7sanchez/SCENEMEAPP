'use client';

import { BotonPelicula, Codigo, Dato, Fotograma, Perforado, useVentanilla } from '@/components/landing/tira';
import { Definicion } from '@/components/landing/definicion';

/*
 * El primer pantallazo: negro de leader a la izquierda con el rótulo, y la
 * tira corriendo por la derecha, sangrando por arriba y por abajo.
 *
 * Los datos del raíl están MEDIDOS de los ficheros de vídeo, no inventados:
 * duración real y 24 cuadros por segundo, que es a lo que está rodado.
 */

const VENTANILLA = [
    {
        nombre: 'Amanda',
        video: '/videos/AMANDA-loop.mp4',
        poster: '/videos/AMANDA-loop-poster.jpg',
        alt: 'Fotograma de la escena de Amanda rodada en SCENE ME',
        duracion: '3:19',
        pieza: 'Escena a medida',
    },
    {
        nombre: 'Rodrigues',
        video: '/videos/SHOGUN-loop.mp4',
        poster: '/videos/SHOGUN-loop-poster.jpg',
        alt: 'Fotograma de la escena de Rodrigues rodada en SCENE ME',
        duracion: '2:35',
        pieza: 'Escena a medida',
    },
    {
        nombre: 'Sonia Dorado',
        video: '/videos/SONIA_DORADO-loop.mp4',
        poster: '/videos/SONIA_DORADO-loop-poster.jpg',
        alt: 'Fotograma de la escena de Sonia Dorado rodada en SCENE ME',
        duracion: '1:42',
        pieza: 'Escena a medida',
    },
];

export function Hero() {
    const { activo, registrar } = useVentanilla(VENTANILLA.length);
    const enVentanilla = VENTANILLA[activo];

    return (
        <section className="relative overflow-hidden">
            <div className="pel-grano" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_51%]">

                {/* ---------- Izquierda: el rótulo ---------- */}
                <div className="flex flex-col justify-center gap-8 px-6 pb-14 pt-14 sm:px-10 lg:min-h-[86vh] lg:px-14 lg:pb-16 lg:pt-20">

                    {/* Lo primero de la página es la definición, no el eslogan:
                        "De actor a estrella" es ahora el título del Método. */}
                    <h1 className="sr-only">
                        SCENE ME — un studio para el actor, en Madrid
                    </h1>

                    <Definicion />

                    <p className="pel-cuerpo max-w-[34ch] text-[1.0625rem]">
                        Un studio para el actor, en Madrid. Aquí se rueda el material con
                        el que te presentas y aquí se entrena el actor que lo defiende.
                    </p>

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

                    <div className="relative flex min-h-[70vh] lg:min-h-[86vh]">

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

                        {/*
                            El raíl, en su propia columna FUERA de la tira. Antes iba
                            flotando encima del último fotograma y le tapaba la cara a
                            la actriz: en este mundo eso es exactamente lo que no puede
                            pasar, porque lo que se vende es la imagen.
                        */}
                        <div
                            className="hidden w-[184px] shrink-0 flex-col justify-center gap-2 py-8 pl-5 pr-6 lg:flex"
                            aria-live="polite"
                        >
                            <Dato clave="En la ventanilla" valor={enVentanilla.nombre} />
                            <Dato clave="Pieza" valor={enVentanilla.pieza} />
                            <Dato clave="Duración" valor={enVentanilla.duracion} />
                            <Dato clave="Rodado a" valor="24 cuadros / s" />
                        </div>
                    </div>

                    {/* En pantalla estrecha el raíl va debajo de la tira, nunca encima. */}
                    <div
                        className="grid grid-cols-2 gap-2 px-4 py-4 sm:grid-cols-4 lg:hidden"
                        aria-live="polite"
                    >
                        <Dato clave="En la ventanilla" valor={enVentanilla.nombre} />
                        <Dato clave="Pieza" valor={enVentanilla.pieza} />
                        <Dato clave="Duración" valor={enVentanilla.duracion} />
                        <Dato clave="Rodado a" valor="24 cuadros / s" />
                    </div>
                </div>
            </div>
        </section>
    );
}
