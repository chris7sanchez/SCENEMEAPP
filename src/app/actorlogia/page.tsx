import { notFound } from 'next/navigation';

// ACTORLOGÍA NO VIVE EN SCENE ME (18/10/2026).
//
// Actorlogía es su propia app (proyecto «actorlogia» en Vercel). Aquí la ruta
// queda cerrada: responde «no encontrado» y la pestaña se ha quitado de la
// barra de abajo. El analizador sigue en components/antigravity para las
// páginas internas que lo usan.
export default function ActorlogiaPage() {
    notFound();
}
