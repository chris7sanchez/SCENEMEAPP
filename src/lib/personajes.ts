// QUIÉN ES QUIÉN en un guion. Lógica pura, sin React ni dependencias.
//
// Un guion de verdad no nombra a sus personajes igual dos veces seguidas. En la
// misma página aparecen SONIA, SONÍA (dedo de más), SONÏA (el corrector), ANA
// (V.O.), ANA CONT'D y DR. MARTÍNEZ junto a DR MARTINEZ. Si cada grafía cuenta
// como un personaje distinto, el actor acaba repartiendo ocho voces para cuatro
// personas y la réplica le contesta con la voz equivocada.
//
// Aquí se separan DOS cosas que no se pueden tratar igual:
//
//  - Lo que es la MISMA persona sin ninguna duda: sólo cambia una tilde, un
//    punto o una coletilla de oficio. Eso se une solo, sin preguntar.
//  - Lo que SE PARECE pero podría ser otra persona: MARC y MARCOS, JUAN y
//    JUANA. Eso NO se toca; se propone y decide el actor, que es quien se ha
//    leído el guion.

/** Quita tildes y diéresis: SONÏA, SONÍA y SONIA son la misma letra a letra. */
function sinTildes(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Coletillas de oficio que a veces vienen pegadas al nombre SIN paréntesis.
 * "ANA V.O." y "ANA" son la misma actriz diciendo la misma frase desde otro
 * sitio; que salgan como dos personajes es un error, no un matiz.
 */
const COLETILLA = /\s+(V\s*O|O\s*S|O\s*C|OFF|EN OFF|CONT\s*D|CONT|CONTINUA|CONTINUED|MAS|MORE|SIGUE|P\s*O\s*V|PRELAP|FILTRO|TELEFONO|AL TELEFONO)$/;

/**
 * La CLAVE de un personaje: dos nombres con la misma clave son la misma
 * persona, y se unen sin preguntar nada a nadie.
 *
 *   "Sonía"  "SONÏA"  "SONIA (V.O.)"  "sonia cont'd"   ->  "SONIA"
 *   "DR. MARTÍNEZ"    "Dr Martinez"                    ->  "DR MARTINEZ"
 */
export function claveDePersonaje(nombre: string): string {
    let s = sinTildes(String(nombre || '')).toUpperCase();
    s = s.replace(/\([^)]*\)/g, ' ');        // "(V.O.)", "(CONT'D)", "(AL UNISONO)"
    s = s.replace(/[.,;:!¡?¿'"`´*_]/g, ' '); // DR. == DR ; O'BRIEN == O BRIEN
    s = s.replace(/\s+/g, ' ').trim();
    // En bucle: "ANA V.O. CONT'D" trae dos coletillas seguidas.
    for (let antes = ''; antes !== s;) { antes = s; s = s.replace(COLETILLA, '').trim(); }
    return s;
}

/** Separadores de un pie compartido: "ANA Y LUIS", "ANA/LUIS", "ANA & LUIS". */
const SEPARADOR = /\s*[/&+]\s*|\s+(?:Y|E|AND)\s+/;

/**
 * ¿Es este pie de personaje un CORO —dos que hablan a la vez— en vez de un
 * personaje llamado así? Devuelve las claves de cada uno, o null.
 *
 * Aquí sólo se parte la cadena; quien decide si el corte es de verdad es
 * `parseScriptScenes`, que exige que alguno de los trozos sea un personaje que
 * hable por su cuenta en alguna parte del guion. Sin esa comprobación, un
 * personaje llamado "JUAN Y MEDIO" se partiría en dos.
 */
export function partirConjunto(nombre: string): string[] | null {
    const limpio = claveDePersonaje(nombre);
    if (!limpio) return null;
    const partes = limpio.split(SEPARADOR).map(p => p.trim()).filter(Boolean);
    if (partes.length < 2 || partes.length > 4) return null;
    // Cada trozo tiene que PARECER un nombre: una o dos palabras, no una frase.
    if (!partes.every(p => p.length >= 2 && p.split(' ').length <= 2)) return null;
    // Sin repetidos ("ANA Y ANA" no es un coro).
    if (new Set(partes).size !== partes.length) return null;
    return partes;
}

/** Distancia de edición (Levenshtein). Cuántos retoques separan dos nombres. */
export function distancia(a: string, b: string): number {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let fila = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const siguiente = [i];
        for (let j = 1; j <= b.length; j++) {
            const coste = a[i - 1] === b[j - 1] ? 0 : 1;
            siguiente[j] = Math.min(fila[j] + 1, siguiente[j - 1] + 1, fila[j - 1] + coste);
        }
        fila = siguiente;
    }
    return fila[b.length];
}

export type MotivoDuda = 'errata' | 'nombre-corto';

/** Dos personajes que podrían ser uno. NO se unen: se pregunta. */
export interface DudaReparto {
    /** El que más habla de los dos: es el candidato a quedarse con el nombre. */
    a: string;
    b: string;
    motivo: MotivoDuda;
    /** Veces que habla cada uno, para poder enseñarlo al preguntar. */
    vecesA: number;
    vecesB: number;
}

export interface PersonajeCenso {
    nombre: string;
    veces: number;
}

/**
 * Parejas de personajes que huelen a ser el mismo mal escrito.
 *
 * `juntos` son las parejas que HABLAN EN LA MISMA ESCENA, tal y como las nombra
 * `claveDuda`. Dos personajes que se responden entre sí no son el
 * mismo con una errata, por mucho que se parezcan: se descartan. Es lo que
 * evita proponer que ANA y ANABEL sean una sola si discuten en la escena 4.
 */
export function dudasDeReparto(
    personajes: PersonajeCenso[],
    juntos: Set<string> = new Set(),
): DudaReparto[] {
    const out: DudaReparto[] = [];

    for (let i = 0; i < personajes.length; i++) {
        for (let j = i + 1; j < personajes.length; j++) {
            const p = personajes[i], q = personajes[j];
            // Dos que se responden en la misma escena son dos personas, no una
            // mal escrita... salvo que uno de ellos hable UNA sola vez: eso es
            // justo la pinta de la errata suelta —veinte "MARCOS" y un "MARC"
            // descolgado— y ahí sí merece la pena preguntar.
            const suelto = Math.min(p.veces, q.veces) <= 1;
            if (!suelto && juntos.has(claveDuda(p.nombre, q.nombre))) continue;

            const a = claveDePersonaje(p.nombre), b = claveDePersonaje(q.nombre);
            if (!a || !b || a === b) continue;                   // la misma clave ya se unió sola

            const motivo = motivoDeDuda(a, b);
            if (!motivo) continue;

            const [may, men] = p.veces >= q.veces ? [p, q] : [q, p];
            out.push({ a: may.nombre, b: men.nombre, motivo, vecesA: may.veces, vecesB: men.veces });
        }
    }
    // Primero las más probables: las erratas, y dentro de ellas las que más se usan.
    return out.sort((x, y) =>
        (x.motivo === y.motivo ? 0 : x.motivo === 'errata' ? -1 : 1) ||
        (y.vecesA + y.vecesB) - (x.vecesA + x.vecesB));
}

function motivoDeDuda(a: string, b: string): MotivoDuda | null {
    const corto = Math.min(a.length, b.length);
    // Una errata: un carácter de diferencia (dos si el nombre es largo).
    const margen = corto >= 8 ? 2 : 1;
    if (corto >= 4 && distancia(a, b) <= margen) return 'errata';
    // Nombre corto y nombre largo: MARC / MARCOS, TONI / TONIO.
    const [pequeno, grande] = a.length <= b.length ? [a, b] : [b, a];
    if (pequeno.length >= 3 && grande.startsWith(pequeno) && grande.length - pequeno.length <= 4) {
        return 'nombre-corto';
    }
    return null;
}

/**
 * Cómo se nombra una pareja de personajes en lo guardado. El orden no importa:
 * se ordena. Se unen con un carácter nulo porque es lo único que no puede
 * aparecer dentro del nombre de un personaje.
 */
export function claveDuda(a: string, b: string): string {
    return a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`;
}
