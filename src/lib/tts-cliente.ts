// Lado navegador de /api/tts: manda el token de la sesión y, cuando el servidor
// dice "sin sesión" o "límite", avisa al reproductor (que ya cae solo a la voz
// del navegador; esto es para que el actor sepa POR QUÉ suena distinto).

export type AvisoTts = 'login_requerido' | 'limite_diario';

export const TEXTO_AVISO: Record<AvisoTts, string> = {
    login_requerido: 'Inicia sesión para usar voces IA. Mientras, suena la voz del navegador.',
    limite_diario: 'Has llegado al límite de voz IA de hoy. Sigue la voz del navegador hasta mañana.',
};

export function avisoDeRespuesta(status: number): AvisoTts | null {
    if (status === 401) return 'login_requerido';
    if (status === 429) return 'limite_diario';
    return null;
}

type Oyente = (a: AvisoTts) => void;
const oyentes = new Set<Oyente>();

export function alAvisoTts(fn: Oyente): () => void {
    oyentes.add(fn);
    return () => { oyentes.delete(fn); };
}

export function emitirAvisoTts(a: AvisoTts): void {
    for (const fn of oyentes) fn(a);
}

export async function cabecerasTts(obtenerToken: () => Promise<string | null>): Promise<Record<string, string>> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
        const t = await obtenerToken();
        if (t) h.Authorization = `Bearer ${t}`;
    } catch { /* sin token: el servidor responderá 401 y se avisará */ }
    return h;
}

/** Import dinámico: así speech.ts no arrastra Firebase a los tests de node. */
export async function obtenerTokenSesion(): Promise<string | null> {
    const { auth } = await import('./firebase');
    return (await auth?.currentUser?.getIdToken()) ?? null;
}
