'use client';

// Decide si usar redirección (móvil/PWA) o popup (escritorio) para el login social.
// Función pura: por defecto lee el entorno, pero acepta args para poder testearla.
export function isMobileEnv(
    ua: string = (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
    standalone: boolean = (typeof window !== 'undefined' &&
        (((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) === true) ||
         (typeof navigator !== 'undefined' && (navigator as any).standalone === true)))
): boolean {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || standalone === true;
}
