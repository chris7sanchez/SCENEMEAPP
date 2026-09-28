import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * LO QUE EL CÓDIGO PIDE TIENE QUE LLEGAR AL DESPLIEGUE.
 *
 * Esta prueba existe porque el mismo fallo ha pasado dos veces en un día, y las
 * dos en silencio: un fichero estaba en su sitio, se veía en local, pasaba todo
 * verde... y en producción daba 404, porque un fichero de exclusiones lo tapaba.
 *
 *   - .gitignore tenía `*.mp4` y los cortes nuevos no llegaban ni a subirse.
 *   - .vercelignore tenía `*.mp4` y una lista de excepciones escrita a mano con
 *     los nombres VIEJOS, así que los nuevos se subían a GitHub pero Vercel no
 *     los desplegaba. La portada se quedaba con los fotogramas quietos.
 *
 * Nada de eso lo detecta el compilador, ni el linter, ni el build: son rutas
 * dentro de cadenas de texto. Sólo se ve abriendo la web de verdad, y para
 * entonces ya la ha abierto quien no debía.
 */

const RAIZ = join(__dirname, '..', '..');

/** Todas las rutas absolutas a ficheros de public/ que el código pide. */
function rutasQuePideElCodigo(): { ruta: string; donde: string }[] {
    const out: { ruta: string; donde: string }[] = [];
    // Con la comilla delante a propósito: así una ruta citada dentro de un
    // comentario ("antes esto apuntaba a /videos/logo-animation.mp4") no cuenta
    // como una petición de verdad.
    const patron = /["'`](\/(?:videos|trabajos|backlot|marca)\/[^"'`]+\.(?:mp4|webm|jpg|jpeg|png|webp|avif))["'`]/g;

    const recorrer = (dir: string) => {
        for (const entrada of readdirSync(dir)) {
            const completa = join(dir, entrada);
            if (statSync(completa).isDirectory()) { recorrer(completa); continue; }
            if (!/\.(ts|tsx)$/.test(entrada)) continue;
            if (entrada.endsWith('.test.ts') || entrada.endsWith('.test.tsx')) continue;
            const texto = readFileSync(completa, 'utf8');
            for (const m of texto.matchAll(patron)) {
                // Una ruta que se arma sobre la marcha (`/trabajos/${n}.jpg`) no
                // se puede comprobar desde aquí: no se sabe qué vale n. Se deja
                // pasar en vez de inventarse una comprobación que no lo es.
                if (m[1].includes('${')) continue;
                // Los fragmentos tipo "#t=15" no son parte del nombre del fichero.
                out.push({ ruta: m[1].split('#')[0], donde: relative(RAIZ, completa) });
            }
        }
    };
    recorrer(join(RAIZ, 'src'));
    return out;
}

/**
 * ¿Sobrevive esta ruta a un fichero de exclusiones? Misma regla que .gitignore:
 * gana la ÚLTIMA línea que casa, y una que empieza por '!' vuelve a incluir.
 */
function loTapa(fichero: string, rutaRelativa: string): string | null {
    if (!existsSync(join(RAIZ, fichero))) return null;
    const lineas = readFileSync(join(RAIZ, fichero), 'utf8')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'));

    let culpable: string | null = null;
    for (const linea of lineas) {
        const negada = linea.startsWith('!');
        const patron = negada ? linea.slice(1) : linea;
        if (!casa(patron, rutaRelativa)) continue;
        culpable = negada ? null : linea;
    }
    return culpable;
}

/** Comparación suficiente para lo que hay en estos ficheros: '*' y directorios. */
function casa(patron: string, ruta: string): boolean {
    if (patron.endsWith('/')) return ruta.startsWith(patron);
    // Sin marcador intermedio: '**' y '*' se traducen en la misma pasada.
    // (Con un marcador había que elegir un carácter que no saliera nunca, y
    // el que se eligió fue un NUL de verdad: el fichero pasaba a contar como
    // binario para git. Ya ha pasado antes en este repositorio.)
    const cuerpo = patron
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*|\*/g, m => (m === '**' ? '.*' : '[^/]*'));
    const regex = new RegExp('^' + cuerpo + '$');
    // Un patrón sin '/' se aplica a cualquier nivel (así funciona `*.mp4`).
    if (!patron.includes('/')) return regex.test(ruta.split('/').pop() ?? '');
    return regex.test(ruta);
}

describe('los ficheros de public/ que pide el código', () => {
    const pedidas = rutasQuePideElCodigo();

    it('el código pide alguno (si no, la prueba no vale para nada)', () => {
        expect(pedidas.length).toBeGreaterThan(5);
    });

    it('existen todos en public/', () => {
        const faltan = pedidas
            .filter(p => !existsSync(join(RAIZ, 'public', p.ruta)))
            .map(p => `${p.ruta}  (lo pide ${p.donde})`);
        expect(faltan).toEqual([]);
    });

    it('ninguno se queda fuera del despliegue por .vercelignore', () => {
        const tapados = pedidas
            .map(p => ({ ...p, regla: loTapa('.vercelignore', `public${p.ruta}`) }))
            .filter(p => p.regla)
            .map(p => `${p.ruta}  lo tapa la regla «${p.regla}»  (lo pide ${p.donde})`);
        expect(tapados).toEqual([]);
    });

    it('ninguno se queda fuera del repositorio por .gitignore', () => {
        const tapados = pedidas
            .map(p => ({ ...p, regla: loTapa('.gitignore', `public${p.ruta}`) }))
            .filter(p => p.regla)
            .map(p => `${p.ruta}  lo tapa la regla «${p.regla}»  (lo pide ${p.donde})`);
        expect(tapados).toEqual([]);
    });
});
