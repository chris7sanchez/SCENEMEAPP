/*
 * LA DEFINICIÓN. Es lo primero que se lee en toda la portada.
 *
 * NO REESCRIBIR. El texto es del usuario y su gracia está en la INVERSIÓN: el
 * actor va DE LAS HISTORIAS AL PERSONAJE, y la estrella DEL PERSONAJE A LAS
 * HISTORIAS. Cambiar el orden de esos dos términos se carga el argumento
 * entero y deja dos frases que dicen lo mismo.
 *
 * Va a media voz, bajo el título del Método: entre las dos frases, tres
 * líneas como mucho en pantalla ancha (una la del actor, dos la de la
 * estrella). La diferencia entre las dos frases la lleva el TONO, no el color
 * ni el cuerpo: la del actor apagada, la de la estrella plena. Ese salto es la
 * transformación, dicho con la paleta y sin gastar el oro, que está reservado
 * para lo que está ocurriendo ahora.
 */

export function Definicion() {
    return (
        <div className="flex flex-col items-center gap-2">
            <p className="pel-definicion pel-definicion--apagada">
                Un actor interpreta historias a través de un personaje.
            </p>

            <p className="pel-definicion pel-definicion--plena">
                Una estrella inspira y transforma a otros, viviendo un personaje a través
                de sus historias.
            </p>
        </div>
    );
}
