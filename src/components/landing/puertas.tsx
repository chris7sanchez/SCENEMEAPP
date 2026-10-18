import { Codigo } from '@/components/landing/tira';

/*
 * LAS DOS PUERTAS, justo debajo del scroll cinematográfico.
 *
 * Antes vivían dentro de la galería de tres columnas (inicio-galeria.tsx). Al
 * pasar la portada al scroll cinematográfico, esa galería ya no se pinta y las
 * puertas salen aquí, solas: son lo primero que se ve al terminar el recorrido
 * y dan un camino claro a cada uno de los dos públicos, sin subordinar a
 * ninguno (PRODUCT.md, «Users»). El texto es el que ya estaba aprobado.
 */

const CAJA =
    'flex w-full flex-col justify-between gap-5 rounded-md border border-[var(--pel-sombra)] p-6 lg:p-8 min-h-64';

export function Puertas() {
    return (
        <section aria-label="Por dónde empezar" className="relative z-10 mx-auto max-w-[1280px] px-4 py-14 md:px-6 md:py-20">
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                <div className={CAJA} style={{ backgroundColor: 'rgba(14, 15, 16, 0.82)' }}>
                    <Codigo>Aún no tengo material</Codigo>
                    <p className="pel-titulo-seccion text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.02]">Empieza por el book</p>
                    <p className="pel-cuerpo max-w-[46ch] text-[0.9375rem]">
                        Fotografía pensada para una dirección de casting, no para un perfil. Sales tú, y sale el personaje que de verdad puedes defender.
                    </p>
                    <a href="#book" className="pel-enlace w-fit text-[1rem]">Ver el book</a>
                </div>
                <div className={CAJA} style={{ backgroundColor: 'rgba(14, 15, 16, 0.82)' }}>
                    <Codigo>El mío ya no me representa</Codigo>
                    <p className="pel-titulo-seccion text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.02]">Ve directo a la escena</p>
                    <p className="pel-cuerpo max-w-[46ch] text-[0.9375rem]">
                        Hecha entera a tu medida: guion, tono y horario. Y cuando un director quiere verte hoy, la rodamos en cuarenta y ocho horas.
                    </p>
                    <a href="#escena" className="pel-enlace w-fit text-[1rem]">Ver la escena</a>
                </div>
            </div>
        </section>
    );
}
