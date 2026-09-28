import { DYNAMICS, GENRES } from '@/lib/data';

/*
 * LA ESCENA, EN ESQUEMA (28/09/2026, idea de Christian): cómo se diseña una
 * escena a medida, en los mismos pasos y con las mismas opciones que la app
 * (/creator). Nada inventado: los géneros salen de GENRES y el reparto de
 * DYNAMICS (src/lib/data.ts), así que si la app cambia, esto cambia con ella.
 *
 * Un paso por columna en pantalla ancha, con una línea ámbar que los une (la
 * del filete de las tomas); en el móvil, uno debajo de otro con la línea a la
 * izquierda. Las opciones van como etiquetas, no como botones: aquí se
 * enseña, se elige dentro de la app.
 */

/** El reparto de la app (DYNAMICS), contado en actores: sus tres «a dos»
 *  (hombre-mujer, mujer-mujer, hombre-hombre) aquí son uno. */
const EN_ACTORES: Record<string, string> = { solo: 'Tú solo', triad: 'Tres', ensemble: 'Grupo' };
const cuantos = (id: string) => EN_ACTORES[id] ?? 'Dos';
const ACTORES = ['Tú solo', 'Dos', 'Tres', 'Grupo'].filter((a) => DYNAMICS.some((d) => cuantos(d.id) === a));

const PASOS = [
    { titulo: 'Elige 1 o 2 escenas', opciones: ['1 escena', '2 escenas'] },
    { titulo: 'Elige el género', opciones: GENRES.map((g) => g.label) },
    { titulo: '¿Cuántos actores?', opciones: ACTORES },
    {
        titulo: 'Elige tu premisa',
        texto: 'Lo que tu personaje quiere en la escena. Con eso, escribimos el guion.',
    },
];

export function EsquemaEscena() {
    return (
        <div className="flex flex-col gap-8">
            <ol className="pel-esquema">
                {PASOS.map((p, i) => (
                    <li key={p.titulo} className="pel-esquema__paso">
                        <span className="pel-esquema__numero" aria-hidden="true">
                            {i + 1}
                        </span>
                        <h4 className="pel-titulo-seccion text-[clamp(1.125rem,1.6vw,1.375rem)]">{p.titulo}</h4>
                        {p.opciones ? (
                            <ul className="flex flex-wrap gap-1.5" aria-label={p.titulo}>
                                {p.opciones.map((o) => (
                                    <li key={o} className="pel-esquema__opcion">
                                        {o}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="pel-cuerpo max-w-[30ch] text-[0.9375rem]">{p.texto}</p>
                        )}
                    </li>
                ))}
            </ol>

            <a href="/creator" className="pel-enlace w-fit self-center text-[1.0625rem]">
                Diseña tu escena en la app
            </a>
        </div>
    );
}
