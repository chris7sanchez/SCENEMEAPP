// Parser de guion -> turnos ORDENADOS para el Modo Ensayo con réplicas.
// Lógica pura, sin dependencias (testeable de forma aislada).

export interface SceneTurn {
    id: number;
    speaker: string; // SIEMPRE en mayúsculas, sin acotaciones
    text: string;
}

const SCENE_HEADING = /^(INT\.|EXT\.|EST\.|INT\/EXT|FADE|CUT TO:|CORTE A:|DISSOLVE|SMASH CUT)/i;
// "NOMBRE: diálogo" (nombre admite mayúsc/minúsc, hasta 3 palabras)
const INLINE_NAME = /^([\wÁÉÍÓÚÑÜáéíóúñü.'\- ]{1,28}?):\s*(\S.*)$/;
// "NOMBRE" en su propia línea, TODO en mayúsculas, con acotación opcional
const STANDALONE_NAME = /^([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ.'\- ]{1,28})(\s*\([^)]*\))?$/;

/** Quita acotaciones "(...)" dentro de una línea de diálogo. */
function stripParens(s: string): string {
    return s.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Convierte un guion en una secuencia ordenada de turnos {speaker, text}.
 * Soporta "NOMBRE: diálogo" y "NOMBRE" en línea propia seguido de su diálogo.
 * Agrupa líneas consecutivas del mismo hablante. Excluye encabezados de escena
 * y acotaciones.
 */
export function parseScriptTurns(script: string): SceneTurn[] {
    const lines = (script || '').split('\n');
    const turns: SceneTurn[] = [];
    let speaker: string | null = null;
    let buffer: string[] = [];

    const flush = () => {
        if (speaker && buffer.length) {
            const text = buffer.join(' ').replace(/\s+/g, ' ').trim();
            if (text) turns.push({ id: turns.length, speaker, text });
        }
        buffer = [];
    };

    for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;
        if (SCENE_HEADING.test(line)) { flush(); speaker = null; continue; }
        // Acotación en línea completa
        if (/^\([^)]*\)$/.test(line)) continue;

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
                if (body) buffer.push(body);
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

        // Línea de diálogo del hablante actual
        if (speaker) {
            const body = stripParens(line);
            if (body) buffer.push(body);
        }
    }
    flush();
    return turns;
}

/** Lista de personajes distintos, en orden de aparición. */
export function speakersOf(turns: SceneTurn[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of turns) {
        if (!seen.has(t.speaker)) { seen.add(t.speaker); out.push(t.speaker); }
    }
    return out;
}

/** "Pie de entrada": las primeras N palabras de una línea, con … si hay más. */
export function cueOf(text: string, words = 3): string {
    const parts = (text || '').trim().split(/\s+/).filter(Boolean);
    const head = parts.slice(0, words).join(' ');
    return parts.length > words ? head + '…' : head;
}
