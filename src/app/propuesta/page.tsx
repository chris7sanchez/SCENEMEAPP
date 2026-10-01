import { redirect } from 'next/navigation';

/*
 * La propuesta de portada (30/09/2026) pasó a ser la portada el 01/10/2026.
 * Quien tenga guardado el enlace de /propuesta, a la portada.
 */
export default function Propuesta() {
    redirect('/');
}
