// LAS VOCES DE VERDAD. Tomas grabadas con el micrófono que sustituyen a la
// voz sintética cuando toca esa línea.
//
// Para qué. Una voz de máquina sirve para ensayar el ritmo, pero no para
// ensayar de verdad: no te da la intención, ni el aire, ni el sitio por donde
// te va a entrar tu compañero. Si tu compañero de reparto se sienta diez
// minutos y graba sus líneas, a partir de ahí ensayas CONTRA ÉL.
//
// Dónde se guardan. En IndexedDB, en este navegador. Y no es por pereza:
//
//  - Son blobs de audio. Media hora de tomas son decenas de megas; eso no cabe
//    en localStorage (5 MB y sólo texto) y subirlo a la nube cuesta dinero y
//    reglas de seguridad que ahora mismo no están publicadas.
//  - Grabar es un acto local: estás con el micro delante. Si un día hace falta
//    que las tomas viajen entre aparatos, se suben desde aquí sin cambiar nada
//    de lo que las usa.
//
// Lo que esto NO hace: sincronizar. Las tomas viven en el navegador donde se
// grabaron. Está dicho en la pantalla, no escondido.

/** Una línea grabada por una persona de verdad. */
export interface TomaVoz {
    /** guionId + "|" + clave. Es la clave primaria del almacén. */
    id: string;
    guionId: string;
    personaje: string;
    /** El texto tal cual estaba al grabarlo: si el guion cambia, se ve. */
    texto: string;
    clave: string;
    audio: Blob;
    duracionMs: number;
    creado: number;
}

/**
 * La huella de una línea: quién la dice y qué dice.
 *
 * Se usa el TEXTO, no el número de turno, a propósito. Reordenar escenas,
 * quitar una acotación o volver a leer el PDF cambia la numeración entera; el
 * texto de la frase, no. Así una toma sobrevive a todo eso y sólo se pierde si
 * de verdad se reescribe la frase — que es cuando hay que volver a grabarla.
 *
 * Dos líneas idénticas del mismo personaje comparten toma. Es lo que se quiere:
 * si ANA dice "No." tres veces, se graba una y vale para las tres.
 */
export function claveDeLinea(personaje: string, texto: string): string {
    const limpio = `${personaje}${(texto || '').replace(/\s+/g, ' ').trim().toLowerCase()}`;
    return huella(limpio);
}

/** Huella corta y estable de un texto (FNV-1a de 32 bits, en base 36). */
export function huella(texto: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < texto.length; i++) {
        h ^= texto.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(36) + '-' + texto.length.toString(36);
}

/** El identificador con el que se guardan las tomas de un guion. */
export function idDeGuion(id: string, texto: string): string {
    // Un ensayo suelto (pegado en el cuadro, sin guardar) no tiene identidad
    // propia: se le da una a partir de su texto, para que dos guiones sueltos
    // distintos no se pisen las tomas.
    return id && id !== '__suelto__' ? id : `suelto:${huella(texto || '')}`;
}

// ---------------------------------------------------------------------------
// El almacén
// ---------------------------------------------------------------------------

const BD = 'sm_voces';
const ALMACEN = 'tomas';
const VERSION = 1;

function hayIndexedDB(): boolean {
    return typeof indexedDB !== 'undefined';
}

function abrir(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!hayIndexedDB()) return reject(new Error('sin IndexedDB'));
        const pet = indexedDB.open(BD, VERSION);
        pet.onupgradeneeded = () => {
            const bd = pet.result;
            if (!bd.objectStoreNames.contains(ALMACEN)) {
                const almacen = bd.createObjectStore(ALMACEN, { keyPath: 'id' });
                almacen.createIndex('guion', 'guionId', { unique: false });
            }
        };
        pet.onsuccess = () => resolve(pet.result);
        pet.onerror = () => reject(pet.error ?? new Error('no se pudo abrir'));
    });
}

function transaccion<T>(modo: IDBTransactionMode, fn: (a: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    return abrir().then(bd => new Promise<T>((resolve, reject) => {
        const tx = bd.transaction(ALMACEN, modo);
        const pet = fn(tx.objectStore(ALMACEN));
        pet.onsuccess = () => resolve(pet.result);
        pet.onerror = () => reject(pet.error ?? new Error('fallo en la petición'));
        tx.oncomplete = () => bd.close();
    }));
}

/** Guarda (o reemplaza) la toma de una línea. */
export async function guardarToma(t: Omit<TomaVoz, 'id' | 'creado'> & { creado?: number }): Promise<TomaVoz> {
    const toma: TomaVoz = { ...t, id: `${t.guionId}|${t.clave}`, creado: t.creado ?? Date.now() };
    await transaccion('readwrite', a => a.put(toma));
    return toma;
}

/** Todas las tomas de un guion, por clave de línea. Nunca lanza: si el */
/** navegador no deja usar IndexedDB (modo privado), se ensaya sin tomas. */
export async function tomasDeGuion(guionId: string): Promise<Map<string, TomaVoz>> {
    try {
        const bd = await abrir();
        const todas = await new Promise<TomaVoz[]>((resolve, reject) => {
            const tx = bd.transaction(ALMACEN, 'readonly');
            const pet = tx.objectStore(ALMACEN).index('guion').getAll(guionId);
            pet.onsuccess = () => resolve(pet.result as TomaVoz[]);
            pet.onerror = () => reject(pet.error);
            tx.oncomplete = () => bd.close();
        });
        return new Map(todas.map(t => [t.clave, t]));
    } catch {
        return new Map();
    }
}

export async function borrarToma(guionId: string, clave: string): Promise<void> {
    try { await transaccion('readwrite', a => a.delete(`${guionId}|${clave}`)); } catch { /* da igual */ }
}

/** Tira todas las tomas de un personaje (para volver a grabarlo entero). */
export async function borrarPersonaje(guionId: string, personaje: string): Promise<void> {
    const tomas = await tomasDeGuion(guionId);
    for (const t of tomas.values()) {
        if (t.personaje === personaje) await borrarToma(guionId, t.clave);
    }
}

/** Cuánto ocupan las tomas de un guion, en bytes. Para poder decirlo. */
export function pesoDeTomas(tomas: Iterable<TomaVoz>): number {
    let n = 0;
    for (const t of tomas) n += t.audio?.size ?? 0;
    return n;
}

export function comoPeso(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Grabar
// ---------------------------------------------------------------------------

/** El formato que sepa grabar este navegador. Safari no hace webm. */
export function formatoDeGrabacion(): string {
    if (typeof MediaRecorder === 'undefined') return '';
    for (const tipo of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) {
        try { if (MediaRecorder.isTypeSupported(tipo)) return tipo; } catch { /* */ }
    }
    return '';
}
