// La matemática del scroll cinematográfico, sin React ni DOM, para poder probarla.

export const N = 121;           // fotogramas que se pintan (uno de cada dos del vídeo)
export const FRAME_CLAVE = 60;  // hasta aquí se forma el logo

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** 0 antes de a, 1 después de b, lineal en medio. */
export const rampa = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/** Sube de a a b, se sostiene hasta c y baja hasta d. */
export const ventana = (p: number, a: number, b: number, c: number, d: number) =>
    rampa(p, a, b) * (1 - rampa(p, c, d));

/** Qué fotograma toca para un progreso p (0..1). */
export function frameDe(p: number): number {
    if (p < 0.30) return (p / 0.30) * FRAME_CLAVE;
    if (p < 0.46) return FRAME_CLAVE + ((p - 0.30) / 0.16) * (N - 1 - FRAME_CLAVE);
    return N - 1;
}

/** El código de tiempo de la esquina: cada fotograma pintado son dos del vídeo a 24 fps. */
export function tc(frame: number): string {
    const seg = (Math.round(frame) * 2) / 24;
    const s = Math.floor(seg);
    const f = Math.round((seg - s) * 24) % 24;
    return `00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
}

/** Progreso 0..1 de una sección alta con un escenario fijo dentro. */
export function progreso(top: number, alto: number, ventanaAlto: number): number {
    const recorrido = alto - ventanaAlto;
    return recorrido > 0 ? clamp(-top / recorrido) : 0;
}
