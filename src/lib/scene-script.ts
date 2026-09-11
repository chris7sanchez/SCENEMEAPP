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
// "NOMBRE: diálogo" (nombre admite mayúsc/minúsc, hasta 3 palabras)
const INLINE_NAME = /^([\wÁÉÍÓÚÑÜáéíóúñü.'\- ]{1,28}?):\s*(\S.*)$/;
// "NOMBRE" en su propia línea, TODO en mayúsculas, con acotación opcional
const STANDALONE_NAME = /^([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ.'\- ]{1,28})(\s*\([^)]*\))?$/;

/** Quita acotaciones "(...)" dentro de una línea de diálogo. */
function stripParens(s: string): string {
    return s.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
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
    const lines = (script || '').split('\n');
    const scenes: Scene[] = [];
    let current: Scene | null = null;
    let speaker: string | null = null;
    let dialogo: string[] = [];
    let accion: string[] = [];
    let nextTurnId = 0;

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

    for (const raw of lines) {
        const line = raw.trim();
        if (!line) {
            // Un renglón en blanco cierra el bloque de diálogo, que es como el
            // guion separa lo que dice un personaje de la acción que viene
            // después. Sólo si ya se capturó algo: al extraer un PDF el pie de
            // personaje y su primera frase pueden salir separados por un hueco,
            // y cerrar ahí convertiría la frase en acción.
            if (speaker && dialogo.length) { flushDialogo(); speaker = null; }
            flushAccion();
            continue;
        }

        if (SCENE_START.test(line)) { flush(); speaker = null; abreEscena(line); continue; }
        if (SCENE_HEADING.test(line)) { flush(); speaker = null; continue; }

        // Acotación en línea completa: "(sin volverse)". Va DELANTE de la frase
        // a la que afecta, que es donde estaba en el papel.
        const soloParen = line.match(/^\(([^)]*)\)$/);
        if (soloParen) {
            flushDialogo(); flushAccion();
            push(NARRADOR, soloParen[1], 'acotacion');
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
                const body = stripParens(inline[2]);
                if (body) dialogo.push(body);
                continue;
            }
        }

        // Formato "NOMBRE" en línea propia (mayúsculas)
        const standalone = line.match(STANDALONE_NAME);
        if (standalone && line === line.toUpperCase()) {
            flush();
            speaker = standalone[1].trim().toUpperCase();
            continue;
        }

        if (speaker) {
            // Sigue hablando el mismo personaje.
            const body = stripParens(line);
            if (body) dialogo.push(body);
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
