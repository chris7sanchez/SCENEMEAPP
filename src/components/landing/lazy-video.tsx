'use client';

import { useEffect, useRef } from 'react';

/**
 * Vídeo decorativo que NO se descarga hasta que está a punto de verse, que
 * enseña un fotograma mientras tanto y que ESPERA SU TURNO.
 *
 * Lo del turno es la parte importante. El muro del hero tiene cinco clips y los
 * cinco están en pantalla a la vez, así que "descargar sólo lo visible" no
 * arreglaba nada: los cinco arrancaban en el mismo instante y se quitaban el
 * ancho de banda unos a otros. En el móvil eso es una página que tarda una
 * eternidad en abrir aunque la primera imagen ya estuviera lista.
 *
 * Aquí se descarga UNO CADA VEZ. El de más arriba entra primero -el orden de la
 * cola es el orden del documento- y cuando ya tiene datos le cede el sitio al
 * siguiente. Si alguno se atasca, a los 8 segundos se le pasa el turno
 * igualmente para que no bloquee a los demás.
 *
 * Con ahorro de datos o conexión lenta no se descarga vídeo ninguno: se queda
 * el póster, que pesa 10 KB en vez de 300.
 */

const MAX_A_LA_VEZ = 1;
const ESPERA_MAXIMA_MS = 8000;

let enCurso = 0;
const cola: Array<() => void> = [];

function pedirTurno(arrancar: () => void) {
    if (enCurso < MAX_A_LA_VEZ) {
        enCurso++;
        arrancar();
    } else {
        cola.push(arrancar);
    }
}

function cederTurno() {
    const siguiente = cola.shift();
    // El turno se traspasa tal cual: por eso `enCurso` no baja si hay relevo.
    if (siguiente) siguiente();
    else enCurso = Math.max(0, enCurso - 1);
}

/** Conexiones que no aguantan vídeo decorativo (y que además suelen pagarlo). */
function conexionPobre(): boolean {
    const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (!c) return false;
    if (c.saveData) return true;
    return /(^|-)2g$/.test(c.effectiveType || '');
}

export function LazyVideo({ src, className, poster }: { src: string; className?: string; poster?: string }) {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let pedido = false;
        let turno = false;
        let cedido = false;
        let reloj: ReturnType<typeof setTimeout> | undefined;

        const ceder = () => {
            if (cedido || !turno) return;
            cedido = true;
            clearTimeout(reloj);
            cederTurno();
        };

        const arrancar = () => {
            turno = true;
            if (!el.isConnected) { ceder(); return; }
            el.addEventListener('loadeddata', ceder, { once: true });
            el.addEventListener('error', ceder, { once: true });
            reloj = setTimeout(ceder, ESPERA_MAXIMA_MS);
            if (!el.getAttribute('src')) el.setAttribute('src', src);
            el.play().catch(() => { /* el navegador puede negarlo: no pasa nada */ });
        };

        const observador = new IntersectionObserver(
            (entradas) => {
                for (const entrada of entradas) {
                    if (!entrada.isIntersecting) { el.pause(); continue; }
                    if (conexionPobre()) continue;          // se queda el póster
                    if (!pedido) { pedido = true; pedirTurno(arrancar); }
                    else if (el.getAttribute('src')) el.play().catch(() => {});
                }
            },
            { rootMargin: '200px' },   // un poco antes de entrar, para que no se note
        );

        observador.observe(el);
        return () => { observador.disconnect(); ceder(); };
    }, [src]);

    return (
        <video
            ref={ref}
            muted
            loop
            playsInline
            preload="none"
            poster={poster}
            className={className}
        />
    );
}
