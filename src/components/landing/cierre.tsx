'use client';

import Link from 'next/link';
import { icono } from '@/lib/iconos-version';
import { BotonPelicula, Codigo, Perforado } from '@/components/landing/tira';
import { LazyVideo } from '@/components/landing/lazy-video';

/*
 * El final de la bobina: la llamada y el pie.
 *
 * El vídeo del fondo lleva una capa opaca por encima (regla L0: nunca texto
 * sobre imagen sin capa de contraste). El titular sale sobre 0,86 de negro,
 * así que el contraste es prácticamente el del texto sobre el leader.
 */

export function Cierre() {
    return (
        <footer id="empezar" className="relative">
            {/* Segunda y última vez que aparece la claqueta del logo: anuncia
                el cierre. Una tercera y dejaría de significar nada. */}
            <div className="pel-claqueta" aria-hidden="true" />

            {/* La llamada */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <LazyVideo
                        src="/videos/MIX-cine-loop.mp4"
                        poster="/videos/MIX-cine-loop-poster.jpg"
                        className="h-full w-full object-cover"
                    />
                </div>
                {/* El scrim. Sin esto el texto no se lee, y eso no es negociable. */}
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(14, 15, 16, 0.86)' }}
                    aria-hidden="true"
                />
                <div className="pel-grano" />

                <div className="relative z-10 flex flex-col items-start gap-8 px-6 py-24 sm:px-10 lg:px-14 lg:py-32">
                    <h2 className="pel-display max-w-[16ch] text-[clamp(2.75rem,8vw,6rem)]">
                        Empieza hoy tu nueva versión
                    </h2>
                    <p className="pel-cuerpo max-w-[46ch] text-[1.125rem]">
                        Entrar a los Estudios es gratis. Cuando quieras material, la
                        productora está al otro lado de la puerta.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <BotonPelicula href="/login">Crear mi cuenta</BotonPelicula>
                        <BotonPelicula href="/booking" variante="secundario">
                            Reservar sesión
                        </BotonPelicula>
                    </div>
                </div>
            </div>

            <Perforado horizontal />

            {/* El pie: sólo enlaces que llevan a algún sitio. */}
            <div className="relative px-6 py-14 sm:px-10 lg:px-14">
                <div className="pel-grano" />

                <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:justify-between">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={icono('/android-chrome-192x192.png')}
                                alt=""
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-[10px]"
                            />
                            <span className="pel-titulo-seccion text-[1.5rem]">Scene Me</span>
                        </div>
                        <p className="pel-cuerpo max-w-[26ch] text-[0.9375rem]">
                            Un studio para el actor. Madrid, y con desplazamiento donde haga
                            falta.
                        </p>
                        <a
                            href="mailto:info@scenemeapp.com"
                            className="pel-enlace w-fit text-[0.9375rem]"
                        >
                            info@scenemeapp.com
                        </a>
                    </div>

                    <nav className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
                        <div className="flex flex-col gap-3">
                            <Codigo>El Método</Codigo>
                            <a href="#book" className="pel-enlace text-[0.9375rem]">El book</a>
                            <a href="#escena" className="pel-enlace text-[0.9375rem]">La escena</a>
                            <a href="#selftape" className="pel-enlace text-[0.9375rem]">El self-tape</a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Codigo>Estudios</Codigo>
                            <Link href="/estudios" className="pel-enlace text-[0.9375rem]">Mis Estudios</Link>
                            <Link href="/studio" className="pel-enlace text-[0.9375rem]">Ensayo con réplicas</Link>
                            <Link href="/comunidad" className="pel-enlace text-[0.9375rem]">Comunidad</Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Codigo>Cuenta</Codigo>
                            <Link href="/login" className="pel-enlace text-[0.9375rem]">Entrar</Link>
                            <Link href="/booking" className="pel-enlace text-[0.9375rem]">Reservar</Link>
                            <Link href="/privacy" className="pel-enlace text-[0.9375rem]">Privacidad</Link>
                            <Link href="/terms" className="pel-enlace text-[0.9375rem]">Términos</Link>
                        </div>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
