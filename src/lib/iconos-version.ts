// Lo escribe scripts/iconos.mjs: no se toca a mano.
// Huella de los iconos. Va detrás de cada dirección (?v=) para que el navegador
// pida el icono nuevo cuando cambia el dibujo. Ver el final de iconos.mjs.
export const ICONOS_V = 'bdc259a0';

/** La dirección de un icono con su versión: icono('/favicon-32x32.png'). */
export const icono = (ruta: string) => `${ruta}?v=${ICONOS_V}`;
