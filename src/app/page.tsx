import { redirect } from 'next/navigation';

// La app abre en el login de actores (/login). El Hub (/hub) queda fuera del
// flujo público: es material para alumnos y se vinculará desde otra entrada.
export default function Home() {
    redirect('/login');
}
