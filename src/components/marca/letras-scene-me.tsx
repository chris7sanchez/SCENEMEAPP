/**
 * EL NOMBRE, CON SU LETRA.
 *
 * "SCENE ME" en letras cromadas es parte de la marca, y esa tipografía no
 * existe como fuente: sólo hay la imagen. Así que el nombre, allí donde sale
 * como título o como marca, va con esta imagen y no escrito en Cinzel o en
 * lo que tocara. El alt dice el nombre, para lectores de pantalla y buscadores.
 *
 * El maestro está en brand/sceneme-letras-maestro.webp (sin pérdida, fuera del despliegue);
 * public/sceneme-letras.webp es el recorte a las letras, 1200 px de ancho.
 * Proporción fija, así que basta con dar la altura (h-8, h-12...) o la anchura.
 */

export const LETRAS_ANCHO = 1200;
export const LETRAS_ALTO = 221;

export function LetrasSceneMe({ className = 'h-8 w-auto', prioridad = false }: { className?: string; prioridad?: boolean }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src="/sceneme-letras.webp"
            alt="Scene Me"
            width={LETRAS_ANCHO}
            height={LETRAS_ALTO}
            fetchPriority={prioridad ? 'high' : undefined}
            className={className}
        />
    );
}
