import SalaVisionado from '@/components/comunidad/SalaVisionado';
import NavEstudios from '@/components/NavEstudios';

export const metadata = {
    title: 'Sala de visionado · Scene Me',
    description: 'Lo que otros actores han querido enseñar.',
};

export default function ComunidadPage() {
    return (
        <main className="min-h-screen bg-[hsl(var(--sm-bg-base))] text-zinc-200">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
                <header className="mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400/70">
                        La pantalla · Sala de visionado
                    </p>
                    <h1 className="mt-2 font-display text-4xl uppercase tracking-tight text-white sm:text-5xl">
                        Lo que se proyecta hoy
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                        Tomas que otros actores han decidido enseñar. Míralas, aplaude lo que te
                        llegue y deja un comentario que le sirva a quien lo grabó. Lo tuyo no
                        aparece aquí a menos que tú lo compartas desde el Plató.
                    </p>
                </header>

                <SalaVisionado />

                <NavEstudios actual="pantalla" />
            </div>
        </main>
    );
}
