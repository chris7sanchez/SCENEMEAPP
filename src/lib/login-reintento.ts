/**
 * Volver a intentarlo cuando el que falla es el cable, no la contraseña.
 *
 * Firebase devuelve «auth/network-request-failed» también cuando la petición se
 * cae sola: un service worker que se despierta tarde, la radio del móvil
 * cambiando de antena, un corte de medio segundo. Con el servidor contestando
 * bien, al usuario le aparecía un error y a nosotros una tarde de diagnóstico.
 *
 * Los fallos de credenciales NO se reintentan a propósito: cada intento cuenta
 * contra la cuenta en Google y acabaríamos provocando un bloqueo por número de
 * intentos, que es peor que el fallo del que veníamos.
 */

/** Espera de verdad. Se inyecta en los tests para que no tarden. */
export const esperarMs = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const PRIMERA_ESPERA_MS = 400;

export async function conReintentoDeRed<T>(
    intentar: () => Promise<T>,
    esFalloDeRed: (error: unknown) => boolean,
    esperar: (ms: number) => Promise<void> = esperarMs,
    intentos = 2,
): Promise<T> {
    let ultimo: unknown;

    for (let n = 0; n < intentos; n++) {
        try {
            return await intentar();
        } catch (error) {
            ultimo = error;
            // No es la red: no hay nada que reintentar.
            if (!esFalloDeRed(error)) throw error;
            // Tras el último intento no se espera: ya no hay a qué.
            if (n < intentos - 1) await esperar(PRIMERA_ESPERA_MS * (n + 1));
        }
    }

    throw ultimo;
}
