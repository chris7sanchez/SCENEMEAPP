// SEGURIDAD COMÚN DE LAS RUTAS DEL SERVIDOR (18/10/2026)
//
// Tres piezas pequeñas que usan todas las rutas de /api:
//
// - escaparHtml: todo lo que escribe un visitante (nombre, teléfono, mensaje...)
//   y acaba dentro de un email o de una página HTML pasa por aquí. Sin esto, un
//   nombre como `<a href="...">` se convertía en un enlace de verdad dentro del
//   correo que le llega a Christian.
//
// - limitar: un tope de peticiones por persona y minuto. Las rutas que gastan
//   dinero (IA, voces, emails) estaban abiertas sin límite: un script podía
//   llamarlas mil veces seguidas. El contador vive en memoria de cada instancia
//   del servidor, así que es un freno, no un muro: para un ataque serio está la
//   regla de Vercel Firewall (ver docs/SEGURIDAD.md).
//
// - errorPublico: el detalle de un fallo se guarda en el registro del servidor,
//   y al navegador sólo le llega un mensaje genérico. Antes se devolvían
//   `error.message`, trazas y respuestas de los proveedores.

export function escaparHtml(valor: unknown): string {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Texto de un formulario: quita espacios de los bordes y lo corta a `max` caracteres. */
export function textoLimpio(valor: unknown, max: number): string {
    return String(valor ?? '').trim().slice(0, max);
}

const EMAIL = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[^\s@<>"']{2,}$/;
export function esEmail(valor: unknown): valor is string {
    return typeof valor === 'string' && valor.length <= 254 && EMAIL.test(valor);
}

/** La IP de quien llama (Vercel la pone en x-forwarded-for). */
export function ipDe(req: Request): string {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    return req.headers.get('x-real-ip') || 'desconocida';
}

type Ventana = { inicio: number; usos: number };
const contadores = new Map<string, Ventana>();

/**
 * ¿Puede pasar esta petición? Cuenta `max` usos por `clave` en cada ventana de
 * `ventanaMs`. Devuelve true si entra y false si ya se pasó.
 */
export function limitar(clave: string, max: number, ventanaMs: number, ahora = Date.now()): boolean {
    // Limpieza de vez en cuando para que el mapa no crezca sin fin.
    if (contadores.size > 5000) {
        for (const [k, v] of contadores) if (ahora - v.inicio > ventanaMs) contadores.delete(k);
    }
    const v = contadores.get(clave);
    if (!v || ahora - v.inicio >= ventanaMs) {
        contadores.set(clave, { inicio: ahora, usos: 1 });
        return true;
    }
    if (v.usos >= max) return false;
    v.usos += 1;
    return true;
}

/** Sólo para los tests. */
export function _reiniciarLimites() {
    contadores.clear();
}

/**
 * Atajo para el principio de una ruta: si la IP ya se pasó del tope en `ruta`,
 * devuelve la respuesta 429 lista; si no, null y la ruta sigue.
 */
export function frenar(req: Request, ruta: string, max: number, ventanaMs = 60_000): Response | null {
    if (limitar(`${ruta}:${ipDe(req)}`, max, ventanaMs)) return null;
    return Response.json(
        { error: 'demasiadas_peticiones', message: 'Has hecho demasiadas peticiones seguidas. Espera un minuto y vuelve a probar.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ventanaMs / 1000)) } },
    );
}

/** Registra el fallo entero en el servidor y devuelve al navegador sólo lo justo. */
export function errorPublico(donde: string, error: unknown, status = 500, codigo = 'error_interno'): Response {
    console.error(`[${donde}]`, error);
    return Response.json({ error: codigo, message: 'No se ha podido completar. Inténtalo de nuevo en un momento.' }, { status });
}

/** Rutas de mantenimiento que sólo tienen sentido en el ordenador de desarrollo. */
export function soloEnDesarrollo(): Response | null {
    if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) return null;
    return new Response('No encontrado', { status: 404 });
}
