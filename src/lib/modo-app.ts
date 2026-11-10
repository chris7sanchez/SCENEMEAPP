// LA APP Y EL ESCAPARATE, SEPARADOS.
//
// 10/11/2026 (Christian): quien abre SCENE ME desde el icono de la pantalla de
// inicio entra en la app, nunca en la web. La portada (y sus pruebas) quedan
// como escaparate: sirven para conocer y vender la app desde el navegador, y
// nada mas.
//
// Se decide en dos sitios con esta misma lista:
// - un script en el <head> (layout.tsx) que salta ANTES de pintar, para que al
//   abrir el icono no asome la portada ni medio segundo;
// - components/pwa/modo-app.tsx, para las navegaciones dentro de la app (un
//   enlace al logo, un "volver al inicio"), que no recargan la pagina.
//
// El manifest.json ya arranca en /creator, pero los iconos instalados antes de
// este cambio guardan la portada como inicio (iPhone no lo actualiza nunca):
// por eso hace falta el salto y no basta con el manifest.

/** Paginas de escaparate: en la app instalada no se ensenan. */
export const RUTAS_ESCAPARATE = ['/', '/propuesta', '/scroll'] as const;

/** Donde aterriza la app. Sin sesion, /creator ya manda al login. */
export const INICIO_APP = '/creator';

export function esEscaparate(ruta: string): boolean {
    const limpia = ruta.length > 1 ? ruta.replace(/\/+$/, '') : ruta;
    return (RUTAS_ESCAPARATE as readonly string[]).includes(limpia);
}

/** true si la pagina corre como app instalada (icono en la pantalla de inicio). */
export function esAppInstalada(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.matchMedia('(display-mode: fullscreen)').matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true
        );
    } catch {
        return false;
    }
}

/**
 * El mismo salto, como texto para el <script> del <head>. Va antes de React,
 * asi que no puede importar nada: se escribe a mano con la lista de arriba.
 */
export const SCRIPT_SALTO_APP =
    `try{var s=window.matchMedia('(display-mode: standalone)').matches||window.matchMedia('(display-mode: fullscreen)').matches||window.navigator.standalone===true;` +
    `var p=location.pathname.length>1?location.pathname.replace(/\\/+$/,''):location.pathname;` +
    `if(s&&${JSON.stringify(RUTAS_ESCAPARATE)}.indexOf(p)!==-1){location.replace(${JSON.stringify(INICIO_APP)});}}catch(e){}`;
