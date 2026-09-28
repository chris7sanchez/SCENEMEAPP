/**
 * El oro de los titulares (la portada y las tomas del Método): el de la
 * cabecera, con el centro luminoso AMPLIO y SUAVE (una elipse que ocupa más
 * de la mitad de la caja y se funde despacio hacia el ámbar). Va en
 * AnimatedText, que con backgroundSize 200% hace que ese centro vaya y venga
 * por dentro de las letras. El relieve lo pone .pel-titulo-oro.
 */
export const ORO_BRILLO =
    'radial-gradient(ellipse 58% 150% at 50% 50%, #FFF4CF 0%, #F6E3A1 18%, #EBCB76 38%, #DDAE45 60%, #C9911A 80%, #A87414 100%)';

/** Lo que tarda el brillo en cruzar de un lado al otro. */
export const ORO_DURACION = 3.2;
