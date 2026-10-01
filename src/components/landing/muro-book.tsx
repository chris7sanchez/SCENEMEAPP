/*
 * EL MURO DEL BOOK. Adaptación de «3D Marquee» (Aceternity UI, MIT) según la
 * guía de componentes de Christian (29/09/2026): en vez de un solo retrato,
 * los 28 retratos de book REALES de public/trabajos/web, en un muro inclinado
 * en perspectiva cuyas columnas suben y bajan solas. Enseña de un vistazo que
 * aquí se han hecho muchos books, y de gente muy distinta.
 *
 * Como en la guía, SIN la librería de animación: el vaivén es un @keyframes
 * CSS (.pel-muro en pelicula.css), con dos ritmos alternos para que las
 * columnas no se muevan a la par. Se para al pasar el ratón (para mirar una
 * cara) y con «reducir movimiento» está quieto.
 *
 * Las imágenes son miniaturas de 1000 px (scripts/miniaturas-muro.mjs, 2,2 MB
 * las 28; a 300 se pixelaban las columnas de delante) y se piden con loading="lazy": nada se descarga hasta acercarse.
 */

import type { CSSProperties } from 'react';

// Las 28, en el orden en que se reparten por columnas: una de cada persona
// seguida, para que dos fotos de la misma persona no queden juntas.
const RETRATOS = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
    '1.2', '2.2', '4.2', '5.2', '6.2', '8.2', '9.2', '10.2', '11.2',
    '1.3', '2.3', '4.3', '6.3', '8.3', '9.3', '10.3', '11.3',
];
const COLUMNAS = 6;

export function MuroBook({ className = '', style }: { className?: string; style?: CSSProperties }) {
    const columnas = Array.from({ length: COLUMNAS }, (_, c) => RETRATOS.filter((_, i) => i % COLUMNAS === c));
    return (
        <div
            role="img"
            aria-label="Muro con retratos de book actoral realizados en SCENE ME"
            className={`pel-fotograma pel-muro ${className}`}
            style={style}
        >
            <div className="pel-muro__plano">
                {columnas.map((fotos, c) => (
                    <div key={c} className="pel-muro__columna" data-ritmo={c % 2 ? 'lento' : 'rapido'}>
                        {fotos.map((f) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={f} src={'/trabajos/muro/' + f + '.webp'} alt="" loading="lazy" decoding="async" width={1000} height={1500} />
                        ))}
                    </div>
                ))}
            </div>
            {/* Los bordes se funden con el negro del fotograma. */}
            <span className="pel-muro__velo" aria-hidden="true" />
            <span className="pel-fuga-borde" aria-hidden="true" />
        </div>
    );
}
