// Parser de guion -> turnos ORDENADOS para el Modo Ensayo con réplicas.
// Lógica pura, sin dependencias (testeable de forma aislada).

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
// "NOMBRE: diálogo" — admite una coletilla técnica: "ANA (V.O.): ..."
const INLINE_NAME = /^([\wÁÉÍÓÚÑÜáéíóúñü.'\- ]{1,28}?)(\s*\([^)]*\))?:\s*(\S.*)$/;
// "NOMBRE" en su propia línea, TODO en mayúsculas, con coletilla opcional
const STANDALONE_NAME = /^([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ.'\- ]{1,28})(\s*\([^)]*\))?$/;

/**
 * Coletillas de oficio que van pegadas al nombre o sueltas y que NO son una
 * indicación de interpretación: nadie quiere oír al narrador decir "punto o
 * ese" antes de cada frase.
 */
const TECNICA = /^(V\.?\s?O\.?|O\.?\s?S\.?|O\.?\s?C\.?|OFF|EN OFF|CONT'?D|CONT\.?|CONTINÚA|CONTINUA|MÁS|MAS|MORE|SIGUE|P\.?\s?O\.?\s?V\.?|SUBT[ÍI]TULO)\.?$/i;

export function esAcotacionTecnica(texto: string): boolean {
    return TECNICA.test(texto.trim());
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

    /** Mete en su sitio los trozos de una línea de diálogo, acotaciones incluidas. */
    const anotaDialogo = (texto: string) => {
        for (const f of partirDialogo(texto)) {
            if (f.tipo === 'dialogo') {
                dialogo.push(f.texto);
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

        // Acotación en línea completa: "(sin volverse)". Va DELANTE de la frase
        // a la que afecta, que es donde estaba en el papel.
        const soloParen = line.match(/^\(([^)]*)\)$/);
        if (soloParen) {
            flushDialogo(); flushAccion();
            if (!esAcotacionTecnica(soloParen[1])) push(NARRADOR, soloParen[1], 'acotacion');
            continue;
        }

        // Formato "NOMBRE: diálogo"
        const inline = line.match(INLINE_NAME);
        if (inline) {
            const name = inline[1].trim();
            const isShortName = name.split(/\s+/).length <= 3 && name.length <= 25;
            // evita falsos positivos (frases con ":") exigiendo nombre corto sin signos de frase
            if (isShortName && !/[.!?,]/.test(name)) {
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

    for (const s of scenes) s.speakers = speakersOf(s.turns);
    return scenes;
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
        if (!seen.has(t.speaker)) { seen.add(t.speaker); out.push(t.speaker); }
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
