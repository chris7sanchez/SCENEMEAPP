/**
 * Quién eres, y nada más.
 *
 * `auth.getCurrentUser()` devuelve el usuario CON su perfil de Firestore, y eso
 * son dos viajes a la red uno detrás de otro: primero contesta Firebase Auth y
 * sólo entonces se pide el documento del perfil. Quien abre /creator se come los
 * dos mirando un giro de carga, aunque para dibujar la pantalla baste con el
 * primero.
 *
 * Esto resuelve con lo que da Auth y se quita de en medio. El perfil se pide
 * aparte, ya con la pantalla puesta.
 */

export interface Sesion {
    uid: string;
    email: string;
}

type UsuarioDeAuth = { uid: string; email: string | null } | null;
type Suscribir = ((avisar: (u: UsuarioDeAuth) => void) => () => void) | null;

export function esperarSesion(suscribir: Suscribir): Promise<Sesion | null> {
    // Sin Firebase configurado no hay sesión posible: invitado y a correr.
    if (!suscribir) return Promise.resolve(null);

    return new Promise((resolver) => {
        let resuelto = false;
        let baja: (() => void) | undefined;

        // Firebase puede contestar EN EL ACTO, dentro de la propia suscripción, si
        // ya sabe quién eres. Entonces `baja` todavía no existe y el listener se
        // quedaba vivo para siempre. Por eso se apunta que hay que darse de baja
        // y se hace en cuanto se tiene con qué.
        const darDeBaja = () => { baja?.(); baja = undefined; };

        baja = suscribir((usuario) => {
            if (resuelto) return;
            resuelto = true;
            resolver(usuario ? { uid: usuario.uid, email: usuario.email || '' } : null);
            darDeBaja();
        });

        if (resuelto) darDeBaja();
    });
}
