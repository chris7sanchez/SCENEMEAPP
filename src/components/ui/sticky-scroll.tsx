'use client';

import { ReactLenis } from 'lenis/react';
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/*
 * GALERÍA CON COLUMNA CENTRAL FIJA. Basado en «sticky-scroll» de ui-layout
 * (21st.dev): una primera pantalla fija con el titular sobre una rejilla, y
 * debajo tres columnas; las de los lados suben con el scroll y la del centro
 * se queda fija (position: sticky) mientras pasan.
 *
 * Cambios respecto al original, que era una demo cerrada con fotos y textos
 * de ejemplo:
 * - El contenido entra por props: `intro` (la primera pantalla), `izquierda`,
 *   `centro` y `derecha` (listas de piezas: fotos, vídeos o cajas de texto) y
 *   `final` (lo que viene al terminar), para poder usarlo con material real.
 * - El desplazamiento suave (Lenis) es opcional (`suave`) y se apaga con
 *   «reducir movimiento».
 * - En el móvil no hay tres columnas: el centro va primero y los lados, a dos
 *   columnas, debajo; nada queda fijo en una pantalla estrecha.
 * - Los colores los pone quien lo usa (className), no el componente.
 */

export interface StickyScrollProps {
    intro: React.ReactNode;
    izquierda: React.ReactNode[];
    centro: React.ReactNode[];
    derecha: React.ReactNode[];
    final?: React.ReactNode;
    /** Alto de las filas de la columna central (grid-template-rows). Por defecto, iguales. */
    filasCentro?: string;
    suave?: boolean;
    className?: string;
}

function Contenido({ intro, izquierda, centro, derecha, final, filasCentro, className }: Omit<StickyScrollProps, 'suave'>, ref: React.ForwardedRef<HTMLElement>) {
    return (
        <main className={cn('relative', className)} ref={ref}>
            <div className="wrapper">
                <section className="sticky top-0 grid h-screen w-full place-content-center overflow-hidden">
                    {/* La rejilla de fondo, que se desvanece hacia abajo. */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(228,196,108,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(228,196,108,0.09)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
                    />
                    <div className="relative">{intro}</div>
                </section>
            </div>

            <section className="relative w-full">
                {/* Escritorio: tres columnas, la del centro fija. */}
                <div className="hidden grid-cols-12 gap-2 px-2 md:grid">
                    <div className="col-span-4 grid gap-2">{izquierda.map((p, i) => <React.Fragment key={i}>{p}</React.Fragment>)}</div>
                    <div
                        className="sticky top-0 col-span-4 grid h-screen w-full gap-2 py-2"
                        style={{ gridTemplateRows: filasCentro ?? `repeat(${centro.length}, minmax(0, 1fr))` }}
                    >
                        {centro.map((p, i) => <React.Fragment key={i}>{p}</React.Fragment>)}
                    </div>
                    <div className="col-span-4 grid gap-2">{derecha.map((p, i) => <React.Fragment key={i}>{p}</React.Fragment>)}</div>
                </div>
                {/* Móvil: el centro primero, los lados a dos columnas. */}
                <div className="flex flex-col gap-2 px-2 md:hidden">
                    {centro.map((p, i) => <React.Fragment key={i}>{p}</React.Fragment>)}
                    <div className="grid grid-flow-dense grid-cols-2 gap-2">
                        {izquierda.map((p, i) => <React.Fragment key={`i${i}`}>{p}</React.Fragment>)}
                        {derecha.map((p, i) => <React.Fragment key={`d${i}`}>{p}</React.Fragment>)}
                    </div>
                </div>
            </section>

            {final}
        </main>
    );
}

const ContenidoConRef = forwardRef(Contenido);

const StickyScroll = forwardRef<HTMLElement, StickyScrollProps>(({ suave = true, ...props }, ref) => {
    const [quieto, setQuieto] = React.useState(false);
    React.useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const actualizar = () => setQuieto(mq.matches);
        actualizar();
        mq.addEventListener('change', actualizar);
        return () => mq.removeEventListener('change', actualizar);
    }, []);

    const contenido = <ContenidoConRef ref={ref} {...props} />;
    return suave && !quieto ? <ReactLenis root>{contenido}</ReactLenis> : contenido;
});

StickyScroll.displayName = 'StickyScroll';

export default StickyScroll;
