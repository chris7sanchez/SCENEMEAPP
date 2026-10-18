// LA HEMEROTECA DE GUIONES: lógica pura, sin React ni red, para poder probarla.
//
// El catálogo (src/data/guiones-catalogo.json) lo genera un script a partir de
// las hemerotecas públicas en castellano (Bloguionistas, Aprendercine). Cada
// entrada dice de qué tipo es:
//  - pdf   → el PDF se descarga en el servidor y se lee dentro de la app.
//  - drive → el autor sólo permite VER (no descargar): se abre el visor de
//            Google dentro de la app y el fragmento lo transcribe el actor.
//  - web   → una página externa (Berlanga, Scribd…): se abre fuera.

export type TipoGuion = 'pdf' | 'drive' | 'web';

export interface GuionCatalogo {
    id: string;
    titulo: string;
    autor: string;
    seccion: string;
    anio: number | null;
    fuente: string;
    tipo: TipoGuion;
    url: string;
    idioma: string;
}

/** Un trozo del guion entre dos encabezados de escena. */
export interface EscenaTexto {
    titulo: string;
    texto: string;
}

/** Sin tildes, sin mayúsculas, sin signos: para comparar como compara una persona. */
export function normalizar(s: string): string {
    return s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9ñ\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Busca en el catálogo. Cada palabra de la consulta tiene que aparecer en el
 * título o en el autor; el título manda en la puntuación, y los PDF legibles
 * en la app van antes que los de visor, a igualdad de acierto.
 */
export function buscarGuiones(consulta: string, catalogo: GuionCatalogo[], max = 30): GuionCatalogo[] {
    const palabras = normalizar(consulta).split(' ').filter(Boolean);
    if (palabras.length === 0) return [];
    const puntuados: { g: GuionCatalogo; p: number }[] = [];
    for (const g of catalogo) {
        const t = normalizar(g.titulo);
        const a = normalizar(g.autor);
        let p = 0;
        let todas = true;
        for (const w of palabras) {
            if (t === w) p += 10;
            else if (t.startsWith(w)) p += 6;
            else if (t.includes(w)) p += 4;
            else if (a.includes(w)) p += 2;
            else { todas = false; break; }
        }
        if (!todas) continue;
        if (g.tipo === 'pdf') p += 1;
        puntuados.push({ g, p });
    }
    puntuados.sort((x, y) => y.p - x.p || x.g.titulo.localeCompare(y.g.titulo, 'es'));
    return puntuados.slice(0, max).map(x => x.g);
}

export function driveIdDe(url: string): string | null {
    const m = url.match(/\/file\/d\/([^/?#]+)/) || url.match(/[?&]id=([^&#]+)/);
    return m ? m[1] : null;
}

/** El visor de Google que sí se puede incrustar (sin cabecera X-Frame-Options). */
export function urlVisorDrive(url: string): string | null {
    const id = driveIdDe(url);
    return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

// Lo que ABRE una escena en un guion: INT./EXT. con numeración opcional, o los
// encabezados en castellano por número. Misma idea que en scene-script.ts, pero
// más ancha: los guiones de series españolas escriben "1 EXT/ AMANECER" o
// "2 INT/DÍA. SALA", sin el punto detrás de INT.
const EMPIEZA_ESCENA = /^\s*(\d{1,3}[.)\-]?\s+)?(INT|EXT|EST|INTERIOR|EXTERIOR)(\s*[./\-–]|\s+(D[ÍI]A|NOCHE|TARDE|AMANECER|ATARDECER|MA[ÑN]ANA))|^\s*(ESCENA|SECUENCIA)\s+\d+/i;
// Y el otro orden, el de Almodóvar: número, lugar en mayúsculas y al final
// INT./EXT. ("2. BOOKSTORE. INT. DAY."). Sin minúsculas antes de INT/EXT, para
// no confundirlo con una frase de acción.
const ESCENA_LUGAR_PRIMERO = /^\s*\d{1,3}\s*[.)\-]\s+[^a-záéíóúñ]*\b(INT|EXT)\b/;

/**
 * Parte el texto de un guion por sus encabezados de escena. Lo que va antes del
 * primer encabezado (portada, reparto) se queda como "Inicio". Si no hay
 * encabezados, todo es una sola escena.
 */
export function partirEnEscenas(texto: string): EscenaTexto[] {
    const lineas = texto.replace(/\r\n?/g, '\n').split('\n');
    const escenas: EscenaTexto[] = [];
    let actual: EscenaTexto | null = null;
    for (const linea of lineas) {
        if (EMPIEZA_ESCENA.test(linea) || ESCENA_LUGAR_PRIMERO.test(linea)) {
            if (actual) escenas.push(actual);
            actual = { titulo: linea.trim().slice(0, 80), texto: linea + '\n' };
        } else if (actual) {
            actual.texto += linea + '\n';
        } else {
            actual = { titulo: 'Inicio', texto: linea + '\n' };
        }
    }
    if (actual) escenas.push(actual);
    return escenas
        .map(e => ({ ...e, texto: e.texto.replace(/\n{3,}/g, '\n\n').trim() }))
        .filter(e => e.texto.length > 0);
}
