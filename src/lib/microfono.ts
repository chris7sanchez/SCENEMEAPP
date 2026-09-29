/**
 * POR QUÉ NO VA EL MICRÓFONO, DICHO PARA ESTE NAVEGADOR.
 *
 * Cuando getUserMedia falla, el navegador sólo da un nombre de error
 * (NotAllowedError, NotFoundError…), y cada navegador esconde el permiso en
 * un sitio distinto. Antes la app decía siempre lo de Chrome, también a quien
 * estaba en Safari. Aquí se traduce el error a lo que hay que tocar, en
 * Safari o en Chrome, y en el Mac cuando el bloqueo es del sistema (Ajustes
 * del Sistema → Privacidad y seguridad → Micrófono), que es lo que pasa
 * cuando el micro tampoco va en ninguna otra web.
 *
 * Lo usan el ensayo (RehearsalPlayer), la grabación de voces
 * (GrabadorDeVoces) y las notas de voz (ChartNotesSystem).
 */

export type Navegador = 'safari' | 'chrome' | 'otro';

/** Safari (Mac, iPhone, iPad) o Chrome/Edge/Brave (todo lo de base Chromium). */
export function queNavegador(ua: string = typeof navigator !== 'undefined' ? navigator.userAgent : ''): Navegador {
    if (/CriOS|Chrome|Chromium|Edg\//.test(ua)) return 'chrome';
    if (/Safari/.test(ua) || /iPhone|iPad/.test(ua)) return 'safari';
    return 'otro';
}

const PERMISO: Record<Navegador, string> = {
    safari: 'En Safari: menú Safari → Ajustes de este sitio web → Micrófono → Permitir, y recarga la página.',
    chrome: 'En Chrome: pulsa el icono de la izquierda de la dirección → Micrófono → Permitir, y recarga la página.',
    otro: 'Permite el micrófono en el icono de la izquierda de la dirección y recarga la página.',
};

const SISTEMA: Record<Navegador, string> = {
    safari: 'Si ya estaba en Permitir, lo bloquea el Mac: Ajustes del Sistema → Privacidad y seguridad → Micrófono → activa Safari.',
    chrome: 'Si ya estaba en Permitir, lo bloquea el Mac: Ajustes del Sistema → Privacidad y seguridad → Micrófono → activa Google Chrome, y cierra y abre Chrome.',
    otro: 'Si ya estaba permitido, míralo en los ajustes de privacidad del sistema (Micrófono).',
};

/**
 * El mensaje para quien usa la app. `nombre` es el `name` del error de
 * getUserMedia, o 'sin-soporte' si el navegador no tiene micrófono web.
 */
export function explicarFalloMicrofono(nombre: string, ua?: string): string {
    const nav = queNavegador(ua);
    switch (nombre) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
        case 'SecurityError':
            return `No hay permiso para usar el micrófono. ${PERMISO[nav]} ${SISTEMA[nav]}`;
        case 'NotFoundError':
        case 'DevicesNotFoundError':
        case 'OverconstrainedError':
            return 'No hay ningún micrófono disponible. Conecta uno, o elige cuál usar en Ajustes del Sistema → Sonido → Entrada.';
        case 'NotReadableError':
        case 'TrackStartError':
        case 'AbortError':
            return `El micrófono está ocupado o bloqueado: cierra Zoom, FaceTime, Teams o cualquier app que lo esté usando y vuelve a intentarlo. ${SISTEMA[nav]}`;
        case 'sin-soporte':
        case 'TypeError':
            return 'Este navegador no deja usar el micrófono aquí. Usa Safari o Chrome actualizados, y entra por https://scenemeapp.com.';
        default:
            return `No se ha podido abrir el micrófono${nombre ? ` (${nombre})` : ''}. ${PERMISO[nav]} ${SISTEMA[nav]}`;
    }
}

/** El nombre del error de getUserMedia, sea lo que sea lo que se haya lanzado. */
export function nombreDelError(e: unknown): string {
    return e instanceof Error || e instanceof DOMException ? e.name : '';
}
