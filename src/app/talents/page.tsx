import { redirect } from 'next/navigation';

/*
 * Talentos era una pestaña con perfiles de ejemplo (nombres inventados y fotos
 * de banco de imágenes). El 10/11/2026 pasó a ser el tablón de los Estudios,
 * hecho con actores reales (lib/tablon.ts), y la elección de compañero se hace
 * dentro de la compra de la escena (steps/step2-cast.tsx).
 * Quien tenga guardado el enlace de /talents, al tablón.
 */
export default function TalentsPage() {
    redirect('/los-estudios#tablon');
}
