import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ALCHEMISTERY | Alquimia Actoral',
    description: 'Workspace profesional para actores y directores. Conecta tu mapa natal con tus guiones y personajes a través de la astrología y el análisis cuántico.',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function AstrologiaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
