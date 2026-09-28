/*
 * LA DEFINICIÓN, como cita sobre el vídeo de la cabecera (presentacion.tsx),
 * en la esquina de abajo a la izquierda. En el móvil va debajo del vídeo:
 * encima taparía el nombre.
 *
 * El texto es de Christian y lo dejó así el 28/09/2026. NO REESCRIBIR. La
 * gracia está en el contraste: el actor INTERPRETA historias a través de un
 * personaje; la estrella INSPIRA Y TRANSFORMA a otros a través de él.
 *
 * La diferencia entre las dos frases la lleva el TONO: la del actor apagada,
 * la de la estrella plena. Va en la serif cursiva y en <blockquote>, porque
 * es eso: una cita.
 */

export function Definicion({ className = '' }: { className?: string }) {
    return (
        <blockquote className={`pel-cita ${className}`}>
            <p className="pel-cita__actor">Un actor interpreta historias a través de un personaje.</p>
            <p className="pel-cita__estrella">
                Una estrella inspira y transforma a otros, a través de un personaje.
            </p>
        </blockquote>
    );
}
