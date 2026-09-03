import { redirect } from 'next/navigation';

// La raiz la sirve la landing del backlot (rewrite en next.config.ts hacia
// /backlot/index.html), asi que esta pagina no se alcanza en produccion.
// Se mantiene como respaldo: si se quita ese rewrite, la raiz vuelve al login.
export default function Home() {
    redirect('/login');
}
