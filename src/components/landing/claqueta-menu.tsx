import Link from 'next/link';
import type { CSSProperties } from 'react';

/*
 * El menú, sobre la banda de la claqueta. Once tramos iguales, negro y blanco
 * alternos; las cinco secciones van AGRUPADAS en el centro, una por tramo y
 * seguidas, empezando en el segundo blanco: EL MÉTODO (blanco), ESTUDIOS
 * (negro), LABORATORIO (blanco), PREGUNTAS (negro), ENTRAR (cuarto blanco).
 * Los tramos de los lados son sólo claqueta. El dibujo, el porqué y cómo se
 * nota que se puede pulsar están en .pel-claqueta-menu (pelicula.css).
 */

const SECCIONES = [
    { texto: 'El Método', href: '#metodo' },
    { texto: 'Estudios', href: '#estudios' },
    { texto: 'Laboratorio', href: '#laboratorio' },
    { texto: 'Preguntas', href: '#preguntas' },
    { texto: 'Entrar', href: '/login' },
];

const TRAMOS = 11;
/** El tramo de EL MÉTODO: el segundo blanco (0 negro, 1 blanco, 2 negro, 3 blanco). */
const PRIMERO = 3;

export function ClaquetaMenu() {
    return (
        <nav aria-label="Secciones" className="pel-claqueta-menu">
            <div className="pel-claqueta-menu__lista">
                {Array.from({ length: TRAMOS }, (_, i) => {
                    const blanco = i % 2 === 1;
                    const tramo = `pel-claqueta-menu__tramo ${blanco ? 'pel-claqueta-menu__tramo--blanco' : ''}`;
                    const seccion = SECCIONES[i - PRIMERO];
                    if (!seccion) return <span key={i} className={tramo} aria-hidden="true" />;

                    const props = {
                        className: `${tramo} pel-claqueta-menu__boton`,
                        // El orden de la invitación: el reflejo las recorre de una en una.
                        style: { '--orden': i - PRIMERO } as CSSProperties,
                    };
                    const texto = <span className="pel-claqueta-menu__texto">{seccion.texto}</span>;
                    return seccion.href.startsWith('/') ? (
                        <Link key={seccion.href} href={seccion.href} {...props}>{texto}</Link>
                    ) : (
                        <a key={seccion.href} href={seccion.href} {...props}>{texto}</a>
                    );
                })}
            </div>
        </nav>
    );
}
