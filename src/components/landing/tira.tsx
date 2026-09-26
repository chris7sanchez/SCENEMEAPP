'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LazyVideo } from '@/components/landing/lazy-video';

/**
 * Las piezas de la tira de 16 mm. Todo contenedor de esta portada es un trozo
 * de película: perforado en los extremos, con su código impreso en el margen.
 *
 * No hay tarjetas. Si algo parece una tarjeta, está mal.
 */

/** Columna de perforaciones. Es cromo: no lleva texto ni significado. */
export function Perforado({ horizontal = false }: { horizontal?: boolean }) {
    return (
        <div
            aria-hidden="true"
            className={horizontal ? 'pel-perf pel-perf--horizontal' : 'pel-perf'}
        />
    );
}

/** El código que va impreso en el margen de la película. */
export function Codigo({
    children,
    vertical = false,
    activo = false,
    className = '',
}: {
    children: React.ReactNode;
    vertical?: boolean;
    activo?: boolean;
    className?: string;
}) {
    const clases = ['pel-codigo'];
    if (vertical) clases.push('pel-codigo--vertical');
    if (activo) clases.push('pel-codigo--activo');
    if (className) clases.push(className);
    return <span className={clases.join(' ')}>{children}</span>;
}

/**
 * Un fotograma. Dentro va el trabajo del actor y sale limpio: el grano y la
 * fuga de luz se quedan fuera, en el soporte. La fuga sólo enciende el
 * fotograma que está en la ventanilla.
 */
export function Fotograma({
    video,
    poster,
    imagen,
    alt,
    activo = false,
    className = '',
    style,
}: {
    video?: string;
    poster?: string;
    imagen?: string;
    alt: string;
    activo?: boolean;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div
            className={`pel-fotograma ${className}`}
            style={style}
            data-activo={activo ? 'si' : 'no'}
        >
            {video ? (
                <LazyVideo src={video} poster={poster} className="h-full w-full object-cover" />
            ) : imagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagen} alt={alt} loading="lazy" decoding="async" />
            ) : null}
            <span className="pel-fuga-borde" aria-hidden="true" />
        </div>
    );
}

/** Botón con cuerpo de película: perforado a los dos lados. */
export function BotonPelicula({
    href,
    children,
    variante = 'primario',
    className = '',
}: {
    href: string;
    children: React.ReactNode;
    variante?: 'primario' | 'secundario';
    className?: string;
}) {
    return (
        <Link href={href} className={`pel-boton pel-boton--${variante} ${className}`}>
            <span className="pel-boton__perf" aria-hidden="true" />
            <span className="pel-boton__texto">{children}</span>
            <span className="pel-boton__perf" aria-hidden="true" />
        </Link>
    );
}

/** Una casilla del raíl de datos: lo que de verdad se sabe del fotograma. */
export function Dato({ clave, valor }: { clave: string; valor: string }) {
    return (
        <div className="pel-dato">
            <span className="pel-dato__clave">{clave}</span>
            <span className="pel-dato__valor">{valor}</span>
        </div>
    );
}

/** La anotación a lápiz de grasa, al margen de la tira. */
export function Nota({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <p className={`pel-nota ${className}`}>{children}</p>;
}

/**
 * EL AVANCE DE FOTOGRAMA, que es el único momento de autor de la página.
 *
 * Devuelve cuál de los fotogramas está en la ventanilla: el que más superficie
 * enseña. Al cambiar, sólo ése se lleva la fuga de luz y sus datos suben al
 * raíl. Nada se mueve por moverse.
 */
export function useVentanilla(cantidad: number) {
    const elementos = useRef<Array<HTMLElement | null>>([]);
    const [activo, setActivo] = useState(0);

    useEffect(() => {
        const visibles = new Array<number>(cantidad).fill(0);
        const observador = new IntersectionObserver(
            (entradas) => {
                for (const entrada of entradas) {
                    const indice = Number((entrada.target as HTMLElement).dataset.indice);
                    if (Number.isInteger(indice)) visibles[indice] = entrada.intersectionRatio;
                }
                let mejor = 0;
                for (let i = 1; i < cantidad; i++) {
                    if (visibles[i] > visibles[mejor]) mejor = i;
                }
                setActivo(mejor);
            },
            { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
        );
        for (const el of elementos.current) if (el) observador.observe(el);
        return () => observador.disconnect();
    }, [cantidad]);

    const registrar = (indice: number) => (el: HTMLElement | null) => {
        elementos.current[indice] = el;
        if (el) el.dataset.indice = String(indice);
    };

    return { activo, registrar };
}
