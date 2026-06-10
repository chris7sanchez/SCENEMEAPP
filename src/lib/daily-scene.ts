// Lógica pura del WE SCENE STUDIO (sin dependencias de React/Firebase/IA).
// Testeable de forma aislada.

export interface SceneLine {
    character: string;
    text: string;
}

export interface DailyScene {
    title: string;
    synopsis?: string;
    characters: string[];
    lines: SceneLine[];
}

/**
 * Clave de la "escena del día": YYYY-MM-DD en la zona horaria indicada.
 * La misma fecha civil (en esa TZ) devuelve siempre la misma clave, de modo
 * que toda la app comparte una sola escena por día.
 */
export function dailyKey(date: Date = new Date(), tz = 'Europe/Madrid'): string {
    // 'en-CA' produce el formato ISO YYYY-MM-DD.
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

/**
 * Valida la forma de una escena ANTES de cachearla, para no guardar basura
 * que la IA pudiera devolver mal formada.
 */
export function isValidScene(s: any): s is DailyScene {
    if (!s || typeof s !== 'object') return false;
    if (typeof s.title !== 'string' || s.title.trim().length === 0) return false;
    if (!Array.isArray(s.lines) || s.lines.length < 2) return false;
    for (const line of s.lines) {
        if (!line || typeof line !== 'object') return false;
        if (typeof line.character !== 'string' || line.character.trim().length === 0) return false;
        if (typeof line.text !== 'string' || line.text.trim().length === 0) return false;
    }
    return true;
}

/** Limpia un nombre de archivo de caracteres peligrosos para una ruta de Storage. */
export function sanitizeFilename(name: string): string {
    const cleaned = (name || '')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^[._-]+/, '')
        .slice(0, 80);
    return cleaned || 'tarea';
}

/**
 * Ruta de Firebase Storage para una tarea subida.
 * Cada usuario queda aislado bajo su uid (las reglas de Storage refuerzan esto).
 */
export function buildSubmissionPath(
    uid: string,
    dateKey: string,
    filename: string,
    ts: number = Date.now(),
): string {
    return `submissions/${uid}/${dateKey}/${ts}_${sanitizeFilename(filename)}`;
}
