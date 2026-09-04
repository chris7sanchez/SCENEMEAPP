'use client';

import { useEffect, useState } from 'react';

/**
 * Llegada desde el backlot.
 *
 * El paso de la puerta termina congelado en el último fotograma del clip (el
 * ciclorama del plató). Al aterrizar aquí, ese mismo fotograma se mantiene a
 * pantalla completa y la sección aparece POR TRANSPARENCIA encima, hasta que el
 * espacio queda construido. Así el corte entre las dos páginas no se ve: es el
 * mismo plano continuando.
 *
 * No hace nada si no vienes del backlot.
 */
const ULTIMO_FOTOGRAMA = '/backlot/paso-final.jpg';

export default function EntradaBacklot() {
    const [entrando, setEntrando] = useState(false);
    const [disolviendo, setDisolviendo] = useState(false);

    useEffect(() => {
        let desde = null;
        try {
            desde = new URLSearchParams(window.location.search).get('desde');
        } catch { /* nada */ }
        if (desde !== 'backlot') return;

        setEntrando(true);

        // La marca no debe quedarse en la barra ni al compartir el enlace.
        try {
            const limpia = new URL(window.location.href);
            limpia.searchParams.delete('desde');
            window.history.replaceState({}, '', limpia.pathname + limpia.search + limpia.hash);
        } catch { /* nada */ }

        // Un respiro para que la sección pinte por debajo, y se disuelve.
        const empieza = setTimeout(() => setDisolviendo(true), 200);
        const acaba = setTimeout(() => setEntrando(false), 2100);
        return () => { clearTimeout(empieza); clearTimeout(acaba); };
    }, []);

    if (!entrando) return null;

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9998,
                pointerEvents: 'none',
                backgroundImage: `url(${ULTIMO_FOTOGRAMA})`,
                backgroundSize: 'cover',
                backgroundPosition: '50% 58%',
                // Sigue avanzando mientras se disuelve: el movimiento no se
                // para en seco al cambiar de pagina, se apaga con el plano.
                transform: disolviendo ? 'scale(1)' : 'scale(1.05)',
                opacity: disolviendo ? 0 : 1,
                transition: 'opacity 1.5s cubic-bezier(.4,0,.2,1), transform 1.9s cubic-bezier(.22,.61,.36,1)',
                transformOrigin: '53% 60%',
            }}
        />
    );
}
