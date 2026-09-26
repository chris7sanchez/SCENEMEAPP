'use client';

import { BotonPelicula, Codigo, Perforado } from '@/components/landing/tira';

/*
 * EN EL LABORATORIO: lo que todavía no existe.
 *
 * Christian quiere ver estas cuatro en la página para irlas definiendo. Así
 * que salen, pero salen por lo que son: fotogramas sin revelar. Ni un precio
 * inventado, ni un botón que no lleve a ningún sitio. El único botón de la
 * sección lleva a un sitio real, la reserva, donde se habla con una persona.
 *
 * El día que una de estas se termine, se sube al Método y sale de aquí.
 */

const EN_QUIMICA = [
    {
        titulo: 'Escena EXPRESS en 48 h',
        texto: 'Un director quiere verte esta semana y no tienes nada de tu versión de ahora.',
        falta: 'Falta cerrar cómo se reserva.',
    },
    {
        titulo: 'Packs de self-tape de 5 y 10',
        texto: 'Bonos para quien se presenta a muchas pruebas seguidas.',
        falta: 'Falta cerrar el precio.',
    },
    {
        titulo: 'Packtor Pro',
        texto: 'La suscripción que abre los Estudios enteros y da prioridad en la agenda.',
        falta: 'Falta que se pueda pagar.',
    },
    {
        titulo: 'Tokens por constancia',
        texto: 'Cada día que apareces y trabajas suma. Se cambian por descuentos, fotos y escenas gratis.',
        falta: 'Falta decidir cuánto suma cada cosa.',
    },
];

export function Laboratorio() {
    return (
        <section id="laboratorio" className="relative">
            <div className="pel-grano" />

            <div className="relative z-10 px-6 py-20 sm:px-10 lg:px-14 lg:py-24">

                <div className="mb-10 flex flex-col gap-5 lg:mb-14 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
                    <h2 className="pel-titulo-seccion max-w-[12ch] text-[clamp(2.25rem,5vw,4rem)]">
                        En el laboratorio
                    </h2>
                    <p className="pel-cuerpo max-w-[48ch]">
                        Cuatro cosas están revelándose. Aparecen porque se van a hacer, no
                        porque ya estén: aquí no vas a encontrar un precio inventado ni un
                        botón que no lleve a ninguna parte.
                    </p>
                </div>

                {/* Una tira entera, tumbada, con cuatro fotogramas sin revelar. */}
                <div className="border border-[var(--pel-sombra)]">
                    <Perforado horizontal />

                    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {EN_QUIMICA.map((f) => (
                            <li
                                key={f.titulo}
                                className="flex gap-4 border-b border-[var(--pel-sombra)] p-6 sm:border-r lg:border-b-0 [&:last-child]:border-b-0 [&:last-child]:border-r-0"
                            >
                                {/* "Sin revelar" va impreso en el margen, en
                                    vertical, no de antetítulo sobre el rótulo.
                                    Y sin número: estas cuatro no llevan orden. */}
                                <div className="shrink-0">
                                    <Codigo vertical>Sin revelar</Codigo>
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col gap-3">
                                <h3 className="pel-titulo-seccion text-[1.375rem] leading-[1.05]">
                                    {f.titulo}
                                </h3>

                                <p className="pel-cuerpo text-[0.9375rem]">{f.texto}</p>

                                {/* Escrito a lápiz de grasa al margen: lo que falta. */}
                                <p className="pel-nota mt-auto pt-3 text-[1rem]">{f.falta}</p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <Perforado horizontal />
                </div>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <BotonPelicula href="/booking" variante="secundario">
                        Necesito una antes de tiempo
                    </BotonPelicula>
                    <p className="pel-cuerpo max-w-[40ch] text-[0.9375rem]">
                        Si te hace falta una de estas ya, se habla y se busca la manera.
                    </p>
                </div>
            </div>
        </section>
    );
}
