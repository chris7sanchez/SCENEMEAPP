/*
 * Las preguntas. Se conservan las del landing anterior que son verdad
 * operativa y se han dejado fuera las dos de Packtor Pro, porque Packtor Pro
 * todavía no se puede pagar y no se anuncia lo que no existe.
 *
 * <details> nativo: se abre con teclado sin escribir una línea de JavaScript,
 * y su estado se dice con palabras, no con una flecha que gira.
 */

const PREGUNTAS = [
    {
        q: '¿En qué resolución se graban las escenas?',
        a: 'Todas las escenas se graban en 4K real, con iluminación y etalonaje cinematográfico, para que tu material luzca como una película de alto presupuesto.',
    },
    {
        q: '¿Cuánto tardáis en entregar las fotos o el vídeo?',
        a: 'El book se entrega en 5 a 7 días hábiles. Las escenas en vídeo, que llevan montaje y etalonaje, entre 10 y 14 días hábiles.',
    },
    {
        q: '¿Cómo funciona el ensayo con réplicas?',
        a: 'Subes la separata, dices qué personaje eres tú y cuáles lleva la máquina. La plataforma reconoce las líneas y te da la réplica por voz en tiempo real, así que puedes ensayar sin depender de nadie.',
    },
    {
        q: '¿Puedo probar antes de pagar?',
        a: 'Sí. Entrar a los Estudios y usar el ensayo es gratis. Lo que se paga es el rodaje: el book, la escena y el self-tape.',
    },
];

export function Preguntas() {
    return (
        <section id="preguntas" className="relative">
            <div className="pel-grano" />

            <div className="relative z-10 px-6 py-20 sm:px-10 lg:px-14 lg:py-24">
                <div className="flex flex-col gap-10 lg:flex-row lg:gap-20">
                    <h2 className="pel-titulo-seccion shrink-0 text-[clamp(2rem,4vw,3rem)] lg:w-72">
                        Antes de reservar
                    </h2>

                    <div className="min-w-0 flex-1 border-t border-[var(--pel-sombra)]">
                        {PREGUNTAS.map((p) => (
                            <details key={p.q} className="pel-pregunta">
                                <summary>{p.q}</summary>
                                <p className="pel-pregunta__respuesta">{p.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
