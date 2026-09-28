import Link from 'next/link';

/*
 * El menú, sobre la banda de la claqueta: cada sección en un tramo blanco,
 * los tramos negros de por medio, todos del mismo ancho. El dibujo y el
 * porqué están en .pel-claqueta-menu (pelicula.css).
 */

const SECCIONES = [
    { texto: 'El Método', href: '#metodo' },
    { texto: 'Estudios', href: '#estudios' },
    { texto: 'Laboratorio', href: '#laboratorio' },
    { texto: 'Preguntas', href: '#preguntas' },
    { texto: 'Entrar', href: '/login' },
];

export function ClaquetaMenu() {
    return (
        <nav aria-label="Secciones" className="pel-claqueta-menu">
            <ul className="pel-claqueta-menu__lista">
                <li className="pel-claqueta-menu__tramo" aria-hidden="true" />
                {SECCIONES.map(s => (
                    <li key={s.href} className="contents">
                        <div className="pel-claqueta-menu__tramo pel-claqueta-menu__tramo--blanco">
                            {s.href.startsWith('/') ? (
                                <Link href={s.href} className="pel-claqueta-menu__enlace">
                                    <span className="pel-claqueta-menu__texto">{s.texto}</span>
                                </Link>
                            ) : (
                                <a href={s.href} className="pel-claqueta-menu__enlace">
                                    <span className="pel-claqueta-menu__texto">{s.texto}</span>
                                </a>
                            )}
                        </div>
                        <div className="pel-claqueta-menu__tramo" aria-hidden="true" />
                    </li>
                ))}
            </ul>
        </nav>
    );
}
