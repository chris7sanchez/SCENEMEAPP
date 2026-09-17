// Parser de guion -> turnos ORDENADOS para el Modo Ensayo con réplicas.
// Lógica pura (testeable de forma aislada); sólo sabe de `personajes.ts`.

import { claveDePersonaje, partirConjunto } from './personajes';

/**
 * Qué es cada turno:
 *  - 'dialogo'   lo que dice un personaje.
 *  - 'accion'    la prosa entre diálogos ("Ana friega. Entra Luis, mojado").
 *  - 'acotacion' la indicación entre paréntesis en su propia línea
 *                ("(sin volverse)"), justo antes de la frase a la que afecta.
 * Las dos últimas las lee el NARRADOR, y sólo si el actor lo pide.
 */
export type TurnKind = 'dialogo' | 'accion' | 'acotacion';

/** Hablante reservado para lo que lee el narrador. No es del reparto. */
export const NARRADOR = 'NARRADOR';

export interface SceneTurn {
    id: number;
    speaker: string; // SIEMPRE en mayúsculas, sin acotaciones
    text: string;
    kind: TurnKind;
    /**
     * Los personajes que dicen esta frase A LA VEZ ("ANA Y LUIS", "ANA/LUIS",
     * "LAS DOS (AL UNÍSONO)"). Cuando está, `speaker` es sólo el rótulo: quien
     * manda para saber de quién es la línea, y para el reparto de voces, son
     * estos nombres. Sin él, habla `speaker` y ya.
     */
    conjunto?: string[];
    /** Silencio EXTRA al terminar el turno, en ms. De ahí salen los "(beat)". */
    pausaMs?: number;
}

/** ¿Es de este personaje la línea? Un coro es de todos los que lo forman. */
export function esDe(turn: SceneTurn, role: string): boolean {
    if (turn.kind !== 'dialogo' || !role) return false;
    return turn.conjunto ? turn.conjunto.includes(role) : turn.speaker === role;
}

/**
 * Con qué voz se lee un turno que no es tuyo. En un coro se usa la del primero
 * que no seas tú: dos voces a la vez no se pueden sintetizar, y oír la tuya
 * propia contestándote es peor que oír la de tu compañero.
 */
export function vozDeTurno(turn: SceneTurn, role: string): string {
    if (!turn.conjunto || !turn.conjunto.length) return turn.speaker;
    return turn.conjunto.find(n => n !== role) ?? turn.conjunto[0];
}

/** Una escena del guion: su encabezado y los turnos que contiene. */
export interface Scene {
    id: number;
    /** El encabezado tal cual venía ("INT. COCINA - NOCHE"). Vacío si el
     *  guion no trae encabezados (una escena pegada suelta, p. ej.). */
    heading: string;
    turns: SceneTurn[];
    /** Personajes que HABLAN en esta escena, en orden de aparición. */
    speakers: string[];
}

// Transiciones y encabezados: cortan el diálogo en curso.
const SCENE_HEADING = /^(INT\.|EXT\.|EST\.|INT\/EXT|FADE|CUT TO:|CORTE A:|DISSOLVE|SMASH CUT)/i;
// Sólo esto EMPIEZA una escena nueva. Una transición ("CUT TO:") no abre
// escena: corta el diálogo y ya. Se admite numeración delante ("12. INT. …"),
// que es como sale de casi todos los programas de guion, y los encabezados en
// castellano por número ("ESCENA 4", "SECUENCIA 7").
const SCENE_START = /^(\d{1,3}[.)\-]?\s*)?(INT\.|EXT\.|EST\.|INT\/EXT|INT-EXT|ESCENA\s+\d+|SECUENCIA\s+\d+)/i;
// El juego de letras de un nombre. Se usa \p{L} (CUALQUIER letra) en vez de
// una lista escrita a mano: con la lista, "SONÏA" —una errata de lo más
// corriente, la diéresis está al lado de la tilde— NO se reconocía como pie de
// personaje, y su frase se le pegaba a quien hablase antes.
// La barra, el ampersand y el signo más entran para los pies compartidos
// ("ANA/LUIS", "ANA & LUIS"), que hasta ahora tampoco se veían.
// "NOMBRE: diálogo" — admite una coletilla técnica: "ANA (V.O.): ..."
const INLINE_NAME = /^([\p{L}\p{N}.'’\-/&+ ]{1,28}?)(\s*\([^)]*\))?:\s*(\S.*)$/u;
// "NOMBRE" en su propia línea, TODO en mayúsculas, con coletilla opcional
const STANDALONE_NAME = /^(\p{Lu}[\p{Lu}\p{N}.'’\-/&+ ]{1,28})(\s*\([^)]*\))?$/u;

/**
 * Coletillas de oficio que van pegadas al nombre o sueltas y que NO son una
 * indicación de interpretación: nadie quiere oír al narrador decir "punto o
 * ese" antes de cada frase.
 */
const TECNICA = new RegExp('^(' + [
    // De dónde sale la voz
    "V\\.?\\s?O\\.?", "O\\.?\\s?S\\.?", "O\\.?\\s?C\\.?", 'OFF', 'EN OFF', 'FUERA DE CAMPO',
    "P\\.?\\s?O\\.?\\s?V\\.?", 'PRELAP', 'AL TEL[ÉE]FONO', 'FILTRO', 'SUBT[ÍI]TULO',
    // Que la frase viene de antes o sigue en la página siguiente
    "CONT'?D", "CONT\\.?", 'CONTINU[A-ZÁÉÍÓÚÜÑa-záéíóúüñ]*', 'M[ÁA]S', 'MORE', 'SIGUE',
    // Que hablan a la vez: es estructura del guion, no una indicación de actuación
    'AL UN[ÍI]SONO', 'A LA VEZ', 'AL MISMO TIEMPO', 'A D[ÚU]O', 'JUNTOS', 'JUNTAS',
    'AMBOS', 'AMBAS', 'LOS DOS', 'LAS DOS', 'SIMULT[ÁA]NEO', 'SOLAPADO',
].join('|') + ')\\.?$', 'i');

export function esAcotacionTecnica(texto: string): boolean {
    return TECNICA.test(texto.trim());
}

/**
 * "(beat)": el tiempo que se calla un actor antes de seguir. No es una
 * indicación que nadie deba LEER en voz alta —quedaría ridículo— sino un
 * silencio. Se convierte en eso: en silencio de verdad.
 */
const BEAT = /^(un|una|a)?\s*beats?\.?$/i;
/** Cuánto dura ese silencio. Un beat es corto: un respiro, no una pausa larga. */
export const PAUSA_BEAT_MS = 900;

export function esBeat(texto: string): boolean {
    return BEAT.test(texto.trim());
}

/**
 * Transiciones de montaje. No abren escena, no son un personaje y no las lee
 * nadie: sólo cortan el diálogo que venía. Se exige MAYÚSCULAS porque así van
 * siempre en un guion, y sin esa condición "Corta a la derecha" —prosa de
 * acción de toda la vida— se tiraría a la basura.
 */
const TRANSICION = /^(CUT TO|CORTE A|CORTA A|SMASH CUT|MATCH CUT|HARD CUT|JUMP CUT|TIME CUT|DISSOLVE|ENCADENADO|FADE|FUNDIDO|INTERCUT|IRIS|WIPE|BACK TO|VOLVEMOS A|SEGUIDO DE)\b/;

/**
 * Muletillas de imprenta: lo que un programa de guion imprime al pie y a la
 * cabeza de cada página. "CONTINUED:", "(MORE)", "SIGUE EN LA PÁGINA
 * SIGUIENTE", "FIN DE LA PRIMERA PARTE". Esto se colaba como PERSONAJE —la
 * línea es corta y va en mayúsculas, que es exactamente lo que busca el
 * detector de pies— y el reparto salía con un actor llamado CONTINUED.
 *
 * Se admite CUALQUIER forma de "continuar" (CONTINU\p{L}*): la lista escrita a
 * mano se dejaba fuera la castellana de toda la vida, CONTINUACIÓN, que según
 * cómo estuviera maquetada la página o se convertía en personaje o se le
 * pegaba a la frase del anterior. Y se dejan pasar unas palabras detrás, que
 * es como se escriben de verdad: "SIGUE EN LA PÁGINA 12", no "SIGUE" a secas.
 */
const MULETILLA = /^(CONTINU\p{L}*|CONT'?D|CONT|SIGUE|VIENE DE|PASA A|M[ÁA]S|MORE|THE END|FIN|TEL[ÓO]N)\b[\p{L}\s.:;·—–-]{0,40}(\([^)]*\))?[\s.:;·—–-]*$/u;

/** El número de página, solo en su renglón: "12.", "- 12 -", "12". */
const NUMERO_DE_PAGINA = /^[\s.\-–—]*\d{1,4}[\s.)\-–—]*$/;

/** ¿Es este renglón imprenta, y no guion? */
export function esRuidoDePagina(linea: string): boolean {
    const l = linea.trim();
    if (!l) return false;
    if (NUMERO_DE_PAGINA.test(l)) return true;
    // Sólo en mayúsculas: "Sigue." puede ser perfectamente una frase de diálogo.
    return l === l.toUpperCase() && (TRANSICION.test(l) || MULETILLA.test(l));
}

/** Un trozo de una línea de diálogo: lo que se dice o lo que se indica. */
interface Fragmento { tipo: 'dialogo' | 'acotacion'; texto: string }

/**
 * Parte una línea de diálogo separando las acotaciones entre paréntesis.
 * "(riendo) Claro que sí" -> [acotación "riendo", diálogo "Claro que sí"]
 *
 * Antes se BORRABAN sin más, así que "(al borde del llanto)" —que es justo lo
 * que el actor necesita oír— se perdía por el camino.
 */
export function partirDialogo(linea: string): Fragmento[] {
    const out: Fragmento[] = [];
    const re = /\(([^)]*)\)/g;
    let ultimo = 0;
    let m: RegExpExecArray | null;

    const empuja = (tipo: Fragmento['tipo'], t: string) => {
        const limpio = t.replace(/\s+/g, ' ').trim();
        if (limpio) out.push({ tipo, texto: limpio });
    };

    while ((m = re.exec(linea)) !== null) {
        empuja('dialogo', linea.slice(ultimo, m.index));
        if (!esAcotacionTecnica(m[1])) empuja('acotacion', m[1]);
        ultimo = m.index + m[0].length;
    }
    empuja('dialogo', linea.slice(ultimo));
    return out;
}

/**
 * Convierte un guion en ESCENAS, cada una con sus turnos {speaker, text}.
 * Soporta "NOMBRE: diálogo" y "NOMBRE" en línea propia seguido de su diálogo.
 * Agrupa líneas consecutivas del mismo hablante y excluye acotaciones.
 *
 * Un guion sin encabezados (una escena pegada a mano) devuelve UNA escena con
 * el encabezado vacío: así el flujo de siempre —pegar y ensayar— no cambia.
 *
 * Las escenas sin diálogo (sólo acción) se conservan para que la numeración
 * siga coincidiendo con el guion de papel; es el reproductor quien decide no
 * ensayarlas.
 */
export function parseScriptScenes(script: string): Scene[] {
    const lines = (script || '').replace(/\t/g, '    ').split('\n');
    const scenes: Scene[] = [];
    let current: Scene | null = null;
    let speaker: string | null = null;
    let dialogo: string[] = [];
    let accion: string[] = [];
    let nextTurnId = 0;

    // LA SANGRÍA ES LA SEÑAL BUENA. Un guion maquetado pone la acción al margen
    // y el diálogo metido hacia dentro. Antes se hacía trim() en la primera
    // línea y esa información se tiraba, así que sin renglones en blanco —que
    // es justo como sale un PDF— la acción se le pegaba al personaje anterior:
    // ANA acababa "diciendo" que Luis dejaba las llaves sobre la mesa.
    const sangriaDe = (s: string) => s.length - s.trimStart().length;
    const sangrias = lines.filter(l => l.trim()).map(sangriaDe);
    const margen = sangrias.length ? Math.min(...sangrias) : 0;
    /** Sólo sirve si el guion de verdad está maquetado con sangrías. */
    const usaSangria = sangrias.length > 0 && Math.max(...sangrias) - margen >= 4;
    /** A qué altura está el diálogo del personaje que habla ahora. */
    let sangriaDialogo: number | null = null;

    const abreEscena = (heading: string): Scene => {
        const escena: Scene = { id: scenes.length, heading, turns: [], speakers: [] };
        scenes.push(escena);
        current = escena;
        return escena;
    };

    const push = (sp: string, texto: string, kind: TurnKind) => {
        const text = texto.replace(/\s+/g, ' ').trim();
        if (!text) return;
        const escena = current ?? abreEscena('');
        escena.turns.push({ id: nextTurnId++, speaker: sp, text, kind });
    };

    const flushDialogo = () => { if (speaker && dialogo.length) push(speaker, dialogo.join(' '), 'dialogo'); dialogo = []; };
    const flushAccion = () => { if (accion.length) push(NARRADOR, accion.join(' '), 'accion'); accion = []; };
    const flush = () => { flushDialogo(); flushAccion(); };

    /**
     * Un "(beat)" no se lee: se calla. Se cierra lo dicho hasta aquí y el
     * silencio se cuelga del turno que acaba de cerrarse, que es donde cae en
     * el papel: después de esa frase y antes de la siguiente.
     */
    const marcaPausa = (ms: number) => {
        flushDialogo();
        const turnos = current?.turns;
        const ultimo = turnos && turnos.length ? turnos[turnos.length - 1] : null;
        if (ultimo) ultimo.pausaMs = (ultimo.pausaMs ?? 0) + ms;
    };

    /** Mete en su sitio los trozos de una línea de diálogo, acotaciones incluidas. */
    const anotaDialogo = (texto: string) => {
        for (const f of partirDialogo(texto)) {
            if (f.tipo === 'dialogo') {
                dialogo.push(f.texto);
            } else if (esBeat(f.texto)) {
                marcaPausa(PAUSA_BEAT_MS);
            } else {
                // La acotación va DELANTE de lo que queda por decir, así que
                // primero se cierra lo dicho hasta aquí.
                flushDialogo();
                push(NARRADOR, f.texto, 'acotacion');
            }
        }
    };

    for (const raw of lines) {
        const line = raw.trim();
        const sangria = sangriaDe(raw);
        if (!line) {
            // Un renglón en blanco cierra el bloque de diálogo, que es como el
            // guion separa lo que dice un personaje de la acción que viene
            // después. Sólo si ya se capturó algo: al extraer un PDF el pie de
            // personaje y su primera frase pueden salir separados por un hueco,
            // y cerrar ahí convertiría la frase en acción.
            if (speaker && dialogo.length) { flushDialogo(); speaker = null; sangriaDialogo = null; }
            flushAccion();
            continue;
        }

        if (SCENE_START.test(line)) { flush(); speaker = null; sangriaDialogo = null; abreEscena(line); continue; }
        if (SCENE_HEADING.test(line)) { flush(); speaker = null; sangriaDialogo = null; continue; }

        // Imprenta, no guion: "CONTINUED:", "FUNDIDO A NEGRO", el número de
        // página. Corta el diálogo que venía y desaparece. Va ANTES del
        // detector de pies a propósito: si no, CONTINUED acababa de personaje.
        if (esRuidoDePagina(line)) { flush(); speaker = null; sangriaDialogo = null; continue; }

        // Acotación en línea completa: "(sin volverse)". Va DELANTE de la frase
        // a la que afecta, que es donde estaba en el papel.
        const soloParen = line.match(/^\(([^)]*)\)$/);
        if (soloParen) {
            const dentro = soloParen[1];
            if (esBeat(dentro)) { marcaPausa(PAUSA_BEAT_MS); continue; }
            flushDialogo(); flushAccion();
            if (!esAcotacionTecnica(dentro)) push(NARRADOR, dentro, 'acotacion');
            continue;
        }

        // Formato "NOMBRE: diálogo"
        const inline = line.match(INLINE_NAME);
        if (inline) {
            const name = inline[1].trim();
            const isShortName = name.split(/\s+/).length <= 3 && name.length <= 25;
            // Evita falsos positivos (frases con ":") exigiendo un nombre corto y
            // sin signos de frase. Las ABREVIATURAS no cuentan como signo: sin
            // esto, "DR. MARTÍNEZ: Respire." no se reconocía como pie, y el
            // doctor sólo existía en las páginas donde alguien escribió "DR"
            // sin punto — dos personajes para una misma persona.
            const sinAbreviaturas = name.replace(/\p{L}{1,4}\.(?=\s|$)/gu, ' ');
            if (isShortName && !/[.!?,;]/.test(sinAbreviaturas)) {
                flush();
                speaker = name.toUpperCase();
                sangriaDialogo = null;
                anotaDialogo(inline[3]);
                continue;
            }
        }

        // Formato "NOMBRE" en línea propia (mayúsculas)
        const standalone = line.match(STANDALONE_NAME);
        if (standalone && line === line.toUpperCase()) {
            flush();
            speaker = standalone[1].trim().toUpperCase();
            sangriaDialogo = null;
            continue;
        }

        if (speaker) {
            // La primera línea después del pie marca a qué altura va el diálogo.
            if (sangriaDialogo === null) sangriaDialogo = sangria;

            // ¿Sigue hablando, o ha vuelto la prosa? En un guion maquetado el
            // diálogo va metido hacia dentro y la acción vuelve al margen. Sin
            // esto, y sin renglones en blanco, "Luis deja las llaves sobre la
            // mesa" acababa saliendo por la boca de ANA.
            const vuelveAlMargen = usaSangria
                && sangriaDialogo > margen + 2
                && sangria <= margen + 2;

            if (vuelveAlMargen) {
                flushDialogo();
                speaker = null;
                sangriaDialogo = null;
                accion.push(line);
            } else {
                anotaDialogo(line);
            }
        } else {
            // Prosa sin nadie hablando: es acción, y la lee el narrador.
            accion.push(line);
        }
    }
    flush();

    canonizar(scenes);
    for (const s of scenes) s.speakers = speakersOf(s.turns);
    return scenes;
}

/**
 * Deja UN nombre por persona y descubre los coros.
 *
 * Dos pasadas, y en este orden por un motivo:
 *
 *  1. Misma clave, misma persona. SONIA, SONÍA y "SONIA (V.O.)" se unen solas
 *     bajo la grafía que más aparece. Aquí no hay nada que preguntar.
 *  2. Pies compartidos. "ANA Y LUIS" sólo se parte en dos si ANA o LUIS
 *     hablan por su cuenta en alguna parte del guion. Sin esa condición, un
 *     personaje llamado JUAN Y MEDIO se convertiría en dos actores.
 */
function canonizar(scenes: Scene[]): void {
    const dialogos = scenes.flatMap(s => s.turns).filter(t => t.kind === 'dialogo');
    if (!dialogos.length) return;

    // clave -> { grafía tal cual : veces }
    const grafias = new Map<string, Map<string, number>>();
    /** Dónde sale por primera vez cada grafía, para desempatar. */
    const estreno = new Map<string, number>();
    dialogos.forEach((t, i) => {
        const k = claveDePersonaje(t.speaker);
        if (!k) return;
        const m = grafias.get(k) ?? new Map<string, number>();
        m.set(t.speaker, (m.get(t.speaker) ?? 0) + 1);
        grafias.set(k, m);
        if (!estreno.has(t.speaker)) estreno.set(t.speaker, i);
    });

    /**
     * La grafía que más se usa. A igualdad manda la que sale ANTES en el guion:
     * es como el guionista presenta al personaje, y suele ser la buena
     * ("DR. MARTÍNEZ" antes que el "DR MARTINEZ" de la página 40).
     */
    const canonDe = new Map<string, string>();
    for (const [k, m] of grafias) {
        let mejor = '', mejorN = -1, mejorEstreno = Infinity;
        for (const [nombre, n] of m) {
            const e = estreno.get(nombre) ?? Infinity;
            if (n > mejorN || (n === mejorN && e < mejorEstreno)) { mejor = nombre; mejorN = n; mejorEstreno = e; }
        }
        canonDe.set(k, mejor.trim().toUpperCase());
    }

    // Quien NO se puede partir habla solo, seguro. Ése es el suelo firme.
    const solos = new Set<string>();
    for (const k of grafias.keys()) if (!partirConjunto(k)) solos.add(k);

    // clave -> miembros del coro (ya con su nombre bueno), si de verdad lo es.
    const coros = new Map<string, string[]>();
    for (const k of grafias.keys()) {
        const partes = partirConjunto(k);
        if (!partes || !partes.some(p => solos.has(p))) continue;
        coros.set(k, partes.map(p => canonDe.get(p) ?? p));
    }

    for (const t of dialogos) {
        const k = claveDePersonaje(t.speaker);
        const miembros = coros.get(k);
        if (miembros) {
            t.speaker = miembros.join(' Y ');   // un solo rótulo para "ANA/LUIS" y "ANA Y LUIS"
            t.conjunto = miembros;
        } else {
            t.speaker = canonDe.get(k) ?? t.speaker;
        }
    }
}

/** Cuántas líneas dice cada personaje. Para enseñar el reparto y para dudar. */
export function censoDeReparto(scenes: Scene[]): { nombre: string; veces: number }[] {
    const veces = new Map<string, number>();
    for (const s of scenes) {
        for (const t of s.turns) {
            if (t.kind !== 'dialogo') continue;
            for (const n of t.conjunto ?? [t.speaker]) veces.set(n, (veces.get(n) ?? 0) + 1);
        }
    }
    return speakersOfScenes(scenes).map(nombre => ({ nombre, veces: veces.get(nombre) ?? 0 }));
}

/**
 * Parejas que HABLAN EN LA MISMA ESCENA, con los dos nombres separados por un
 * carácter nulo. Dos que se responden entre sí no son el mismo con una errata.
 */
export function parejasEnEscena(scenes: Scene[]): Set<string> {
    const out = new Set<string>();
    for (const s of scenes) {
        const quienes = s.speakers;
        for (let i = 0; i < quienes.length; i++) {
            for (let j = i + 1; j < quienes.length; j++) {
                const [a, b] = quienes[i] < quienes[j] ? [quienes[i], quienes[j]] : [quienes[j], quienes[i]];
                out.add(`${a}\u0000${b}`);
            }
        }
    }
    return out;
}

/**
 * Aplica las uniones que ha confirmado el actor: `alias` lleva, por cada
 * nombre a fundir, el nombre con el que se queda. Devuelve escenas NUEVAS (no
 * toca las de entrada), que es lo que espera React.
 */
export function aplicarAlias(scenes: Scene[], alias: Record<string, string>): Scene[] {
    if (!alias || !Object.keys(alias).length) return scenes;
    const de = (n: string) => alias[n] ?? n;
    const salida = scenes.map(s => ({
        ...s,
        turns: s.turns.map(t => {
            if (t.kind !== 'dialogo') return t;
            if (t.conjunto) {
                // Un coro puede quedarse en una sola persona si se funden sus dos
                // miembros; entonces deja de ser coro.
                const miembros = [...new Set(t.conjunto.map(de))];
                return miembros.length > 1
                    ? { ...t, conjunto: miembros, speaker: miembros.join(' Y ') }
                    : { ...t, conjunto: undefined, speaker: miembros[0] };
            }
            return { ...t, speaker: de(t.speaker) };
        }),
        speakers: [] as string[],
    }));
    for (const s of salida) s.speakers = speakersOf(s.turns);
    return salida;
}

/**
 * Secuencia plana de turnos de TODO el guion.
 * Se mantiene como puerta de entrada de siempre: el ensayo de una escena
 * suelta sigue funcionando exactamente igual.
 */
export function parseScriptTurns(script: string): SceneTurn[] {
    return parseScriptScenes(script).flatMap(s => s.turns);
}

/**
 * Personajes distintos que HABLAN, en orden de aparición.
 * El narrador queda fuera a propósito: no es del reparto, no puede ser tu
 * personaje y no cuenta para saber si sales en una escena.
 */
export function speakersOf(turns: SceneTurn[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of turns) {
        if (t.kind !== 'dialogo') continue;
        // Un coro no es un personaje: son dos. "ANA Y LUIS" aporta ANA y LUIS,
        // no un tercer actor al que habría que ponerle voz.
        for (const nombre of t.conjunto ?? [t.speaker]) {
            if (!seen.has(nombre)) { seen.add(nombre); out.push(nombre); }
        }
    }
    return out;
}

/** Los turnos que se van a reproducir, con o sin las acotaciones del narrador. */
export function playableTurns(turns: SceneTurn[], conNarrador: boolean): SceneTurn[] {
    return conNarrador ? turns : turns.filter(t => t.kind === 'dialogo');
}

/** ¿Hay algo que un narrador pueda leer? Si no, ni se ofrece la opción. */
export function hasNarration(scenes: Scene[]): boolean {
    return scenes.some(s => s.turns.some(t => t.kind !== 'dialogo'));
}

/** Todos los personajes del guion entero, en orden de aparición. */
export function speakersOfScenes(scenes: Scene[]): string[] {
    return speakersOf(scenes.flatMap(s => s.turns));
}

/** Las escenas en las que ese personaje tiene al menos una línea. */
export function scenesWith(scenes: Scene[], role: string): Scene[] {
    return scenes.filter(s => s.speakers.includes(role));
}

/** Las escenas que tienen diálogo (las de sólo acción no se pueden ensayar). */
export function scenesWithDialogue(scenes: Scene[]): Scene[] {
    return scenes.filter(s => s.speakers.length > 0);
}

/**
 * Un nombre corto para enseñar la escena en una lista.
 * "12. INT. COCINA - NOCHE" tal cual si cabe; si no, recortado.
 */
export function sceneLabel(scene: Scene, index: number): string {
    const h = scene.heading.trim();
    if (!h) return `Escena ${index + 1}`;
    return h.length <= 48 ? h : h.slice(0, 47) + '…';
}

/** "Pie de entrada": las primeras N palabras de una línea, con … si hay más. */
export function cueOf(text: string, words = 3): string {
    const parts = (text || '').trim().split(/\s+/).filter(Boolean);
    const head = parts.slice(0, words).join(' ');
    return parts.length > words ? head + '…' : head;
}
