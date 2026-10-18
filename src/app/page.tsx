import type { Metadata } from 'next';

import '@/components/landing/pelicula.css';
import ScrollCine from '@/components/scroll-cine/ScrollCine';
import { Puertas } from '@/components/landing/puertas';
import { ClaquetaMenu } from '@/components/landing/claqueta-menu';
import { Metodo } from '@/components/landing/metodo';
import { Estudios } from '@/components/landing/estudios';
import { Laboratorio } from '@/components/landing/laboratorio';
import { Preguntas } from '@/components/landing/preguntas';
import { Cierre } from '@/components/landing/cierre';
import { MarcoBook } from '@/components/propuesta/book-opciones';

export const metadata: Metadata = {
    title: 'SCENE ME — Un studio para el actor',
    description:
        'Book, escena a medida y self-tape con dirección de casting en Madrid. Y unos Estudios donde entrenar a diario: una escena al día, el guion entero con réplicas, y una comunidad que te devuelve otras miradas.',
};

/*
 * LA PORTADA.
 *
 * El mundo es una tira de 16 mm revelada a mano. La regla que lo ordena todo:
 * la emulsión vive en el soporte y nunca sobre la imagen. El grano, la raya y
 * la fuga de luz son del material fotográfico; lo que hay dentro del fotograma
 * es el trabajo del actor y sale limpio.
 *
 * El contrato de dirección está en .impeccable/surfaces/src-app-page-tsx.md.
 * La verdad del producto —qué existe y qué no, qué precios son reales, qué
 * está prohibido inventar— está en PRODUCT.md. Léelos antes de tocar esto.
 *
 * El landing anterior está entero en _PARKING/landing-anterior-2026-09-26/.
 *
 * 01/10/2026: la propuesta que se probó en /propuesta pasa a ser la portada
 * (Christian): fondo de placa antigua (.pel--placa), claqueta en oro, el
 * principio en galería con la columna central fija (InicioGaleria) y EL BOOK
 * en su marco, con el Relevo. Detrás, el resto del Método (la escena y el
 * self-tape), los Estudios, el Laboratorio, las Preguntas y el cierre.
 */

export default function Portada() {
    return (
        <div className="pel pel--placa min-h-screen">

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'LocalBusiness',
                        name: 'SCENE ME',
                        image: 'https://www.scenemeapp.com/apple-touch-icon.png',
                        description:
                            'Studio para actores en Madrid. Book, escenas a medida y self-tapes con dirección de casting, y unos Estudios donde entrenar a diario con escenas, ensayo de guion con réplicas y comunidad.',
                        url: 'https://www.scenemeapp.com',
                        address: {
                            '@type': 'PostalAddress',
                            addressLocality: 'Madrid',
                            addressCountry: 'ES',
                        },
                        priceRange: '150€ - 699€',
                    }),
                }}
            />

            {/*
                18/10/2026 (Christian): la portada pasa a ser el scroll
                cinematográfico. El vídeo de presentación deja de rodarse solo:
                lo gobierna el scroll (components/scroll-cine), y en su recorrido
                entran el titular, las fotos reales y los dos botones. Por eso ya
                no se pintan la cabecera en bucle (landing/presentacion.tsx) ni
                la galería de tres columnas (propuesta/inicio-galeria.tsx): los
                ficheros siguen en el repositorio, aparcados.

                Al terminar el recorrido queda el menú de la claqueta, pegado
                arriba mientras se baja por el resto, y las dos puertas.
            */}
            <ScrollCine />
            <div className="sticky top-0 z-30">
                <ClaquetaMenu variante="oro" />
            </div>
            <Puertas />
            <MarcoBook opcion={3} />
            <Metodo sinBook />
            <Estudios />
            <Laboratorio />
            <Preguntas />
            <Cierre />
        </div>
    );
}
