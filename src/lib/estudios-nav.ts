// LAS SALAS DE LOS ESTUDIOS, en el orden en que se recorren.
//
// El patio (public/backlot/index.html) es HTML estático fuera del router de
// Next, así que tiene su propia copia de esta lista (su array STAGES). Ésta es
// la que usa la APP para que, una vez dentro de una sala, se pueda pasar a la
// siguiente o a la anterior sin volver al patio. Si se añade una sala hay que
// tocar las dos: el orden y los índices tienen que coincidir, porque el enlace
// al patio va por posición (/backlot?sala=N).

export interface Sala {
    id: 'produccion' | 'plato' | 'pantalla';
    /** Como se llama en el patio: "Stage 5", "Stage 1", "La pantalla". */
    stage: string;
    /** Para qué sirve: "Sala de producción", "Plató"… */
    sala: string;
    /** Su página en la app. null = todavía no existe (sólo se puede visitar en el patio). */
    ruta: string | null;
}

export const SALAS: Sala[] = [
    { id: 'produccion', stage: 'Stage 5', sala: 'Sala de producción', ruta: '/estudios' },
    { id: 'plato', stage: 'Stage 1', sala: 'Plató', ruta: '/studio' },
    { id: 'pantalla', stage: 'La pantalla', sala: 'Sala de visionado', ruta: '/comunidad' },
];

/** El patio, abierto directamente en esa sala. */
export function rutaEnPatio(indice: number): string {
    return `/backlot?sala=${indice}`;
}

/**
 * A dónde lleva un botón de la barra: a su página si la tiene, y si no al
 * patio abierto en esa sala — así ninguna sala es un botón muerto.
 */
export function destinoDe(indice: number): string {
    const s = SALAS[indice];
    return s?.ruta ?? rutaEnPatio(indice);
}

/** Anterior y siguiente, dando la vuelta: de la última se pasa a la primera. */
export function vecinas(id: Sala['id']): { anterior: number; actual: number; siguiente: number } {
    const actual = Math.max(0, SALAS.findIndex(s => s.id === id));
    const n = SALAS.length;
    return { anterior: (actual + n - 1) % n, actual, siguiente: (actual + 1) % n };
}
