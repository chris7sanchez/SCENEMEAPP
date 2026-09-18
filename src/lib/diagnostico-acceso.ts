/**
 * Por qué no has podido entrar, dicho a partir de lo que contestó el servidor.
 *
 * La versión anterior probaba `accounts:createAuthUri` y el login entra por
 * `accounts:signInWithPassword`. Son puertas distintas: que una conteste no
 * demuestra nada de la otra, y aun así el mensaje afirmaba "no es un bloqueador".
 * Encima Google dejó de devolver `registered` y `allProviders` en createAuthUri
 * -hoy responde `{kind, sessionId}` y ya está-, así que las ramas que miraban
 * esos campos no se ejecutaban nunca y todo el mundo acababa en la frase de
 * "pásame esta frase entera".
 *
 * Aquí se llama a LA MISMA puerta del login y se clasifica su respuesta.
 */

/** El endpoint que usa el login de verdad. La prueba tiene que ir contra éste. */
export const PUERTA_DEL_LOGIN = 'signInWithPassword';

export interface PruebaDeLaPuerta {
    /** ¿Llegó a salir la petición? `false` = alguien la cortó en el navegador. */
    salio: boolean;
    /** Código HTTP (0 si no salió). */
    codigo: number;
    /** El `error.message` de Google, si vino. */
    motivo: string;
}

export type Culpa =
    | 'navegador'      // algo de este equipo corta la llamada
    | 'credenciales'   // la puerta abre; el email o la contraseña no valen
    | 'contradiccion'  // la puerta abre pero el SDK dice fallo de red
    | 'proyecto'       // configuración de Firebase / Google Cloud
    | 'espera'         // demasiados intentos
    | 'google';        // el resto

export interface Explicacion {
    culpa: Culpa;
    texto: string;
}

/** Respuestas que sólo pueden venir de un servidor que SÍ te está escuchando. */
const LA_PUERTA_ABRE = ['INVALID_LOGIN_CREDENTIALS', 'EMAIL_NOT_FOUND', 'INVALID_PASSWORD', 'INVALID_EMAIL'];

export function explicarFalloDeAcceso(prueba: PruebaDeLaPuerta, codigoFirebase: string): Explicacion {
    // 1. La llamada del login no llega ni a salir. Esto es exactamente lo que
    //    hace un bloqueador, y es lo que el SDK traduce a network-request-failed.
    if (!prueba.salio || prueba.codigo === 0) {
        return {
            culpa: 'navegador',
            texto: 'La petición de ENTRAR no llega a salir de este navegador. Eso lo hace un bloqueador de contenido o de anuncios, una extensión, o un antivirus con «protección web»: dejan pasar el resto de la web y cortan justo esta llamada. Desactívalo para scenemeapp.com y recarga, o entra desde otro navegador o con los datos del móvil. Mientras tanto, «Entrar sin cuenta» funciona sin esto.',
        };
    }

    const motivo = prueba.motivo.toUpperCase();

    if (motivo.includes('TOO_MANY_ATTEMPTS') || motivo.includes('TOO_MANY_REQUESTS')) {
        return {
            culpa: 'espera',
            texto: 'Google ha bloqueado temporalmente los intentos desde aquí por haber fallado muchas veces seguidas. No es tu red: espera unos minutos, o restablece la contraseña, y vuelve a probar.',
        };
    }

    if (motivo.includes('CONFIGURATION_NOT_FOUND')) {
        return {
            culpa: 'proyecto',
            texto: 'Firebase Authentication no está activo en este proyecto. No falla tu contraseña ni tu red: no puede entrar nadie hasta que se active en la consola de Firebase (Authentication → Sign-in method).',
        };
    }

    if (motivo.includes('OPERATION_NOT_ALLOWED')) {
        return {
            culpa: 'proyecto',
            texto: 'El acceso por email y contraseña está desactivado en Firebase. Hay que activarlo en Authentication → Sign-in method; con el código no se arregla.',
        };
    }

    if (motivo.includes('API_KEY') || motivo.includes('BLOCKED') || prueba.codigo === 403) {
        return {
            culpa: 'proyecto',
            texto: `Google rechaza la clave de esta web: está restringida y no admite peticiones desde este dominio. Se cambia en Google Cloud → APIs y servicios → Credenciales.${prueba.motivo ? ` (${prueba.motivo})` : ''}`,
        };
    }

    // 2. La puerta abre: el servidor contesta lo que contesta a unas credenciales
    //    que no valen. Entonces la red NO es el problema.
    if (LA_PUERTA_ABRE.some((m) => motivo.includes(m))) {
        // …salvo que el SDK insista en que fue un fallo de red. Ahí hay algo
        // entre el SDK y la red que la prueba no atraviesa: casi siempre un
        // service worker viejo que sigue interceptando peticiones.
        if (codigoFirebase.includes('network-request-failed')) {
            return {
                culpa: 'contradiccion',
                texto: 'El servidor de acceso SÍ contesta desde esta página, pero el login dice que falló la red. Eso suele ser un service worker antiguo o una caché guardada que sigue interceptando la petición. Recarga forzando (Cmd+Shift+R), o abre la web en una ventana privada: si ahí entras, era la caché.',
            };
        }
        return {
            culpa: 'credenciales',
            texto: 'El servidor de acceso responde con normalidad, así que no es tu conexión: el email o la contraseña no coinciden. Si te registraste con Google, entra con «Continuar con Google».',
        };
    }

    return {
        culpa: 'google',
        texto: `El servidor de acceso contesta con un error (${prueba.codigo}${prueba.motivo ? ` ${prueba.motivo}` : ''}). No es cosa tuya ni de tu red: es Google o la configuración del proyecto.`,
    };
}
