// LAS VOCES DE VERDAD. Tomas grabadas con el micrófono que sustituyen a la
// voz sintética cuando toca esa línea.
//
// Para qué. Una voz de máquina sirve para ensayar el ritmo, pero no para
// ensayar de verdad: no te da la intención, ni el aire, ni el sitio por donde
// te va a entrar tu compañero. Si tu compañero de reparto se sienta diez
// minutos y graba sus líneas, a partir de ahí ensayas CONTRA ÉL.
//
// Dónde se guardan. EN DOS SITIOS, y el orden importa:
//
//  1. IndexedDB, en este navegador. Es la copia rápida: suena al instante y
//     funciona sin sesión y sin cobertura.
//  2. Firestore, en users/{uid}/voces, si hay sesión iniciada. Es la copia que
//     SOBREVIVE: a vaciar el navegador, a una ventana privada, a cambiar de
//     ordenador. Ésa es la que importa de verdad.
//
// La primera versión de esto guardaba SÓLO en el navegador, y Christian perdió
// una tanda entera de tomas grabándolas en una ventana privada (que borra todo
// al cerrarse). Guardar el trabajo de alguien en un sitio que el navegador
// puede tirar sin avisar no es una decisión de diseño: es una trampa.
//
// Por qué Firestore y no Storage: la regla users/{uid}/** ya está publicada y
// funciona hoy; Storage necesitaría unas reglas nuevas que no están puestas.
// Un documento de Firestore admite 1 MB, y una frase grabada a 24 kbps mono
// ocupa unos 3 kB por segundo: una réplica de diez segundos son 30 kB, 40 en
// base64. Caben de sobra. Lo que no quepa se queda en local y se avisa.

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
    const limpio = `${personaje}\u0001${(texto || '').replace(/\s+/g, ' ').trim().toLowerCase()}`;
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
// Convertir el audio a texto y al revés
//
// Un documento de Firestore no admite binario, así que el audio viaja en
// base64. Cuesta un tercio más de tamaño, y a cambio la toma vive en la cuenta
// en vez de en un navegador que puede vaciarse.
// ---------------------------------------------------------------------------

/** Lo máximo que se sube: un documento admite 1 MB y en base64 crece 4/3. */
const TOPE_SUBIDA = 600 * 1024;

function aBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onerror = () => reject(lector.error ?? new Error('no se pudo leer el audio'));
        lector.onload = () => {
            const url = String(lector.result || '');
            resolve(url.slice(url.indexOf(',') + 1));   // fuera el "data:...;base64,"
        };
        lector.readAsDataURL(blob);
    });
}

function deBase64(b64: string, tipo: string): Blob {
    const binario = atob(b64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    return new Blob([bytes], { type: tipo || 'audio/webm' });
}

// ---------------------------------------------------------------------------
// La copia que sobrevive: Firestore, en users/{uid}/voces
// ---------------------------------------------------------------------------

/** Un identificador válido para un documento: sin barras. */
const idDocumento = (guionId: string, clave: string) =>
    `${guionId}|${clave}`.replace(/\//g, '_');

async function coleccionDeVoces(uid: string) {
    const { db } = await import('./firebase');
    const { collection } = await import('firebase/firestore');
    if (!db) throw new Error('sin Firestore');
    return collection(db, 'users', uid, 'voces');
}

/** Sube una toma a la cuenta. Devuelve por qué no, si no ha podido. */
export async function subirToma(uid: string, toma: TomaVoz): Promise<{ ok: boolean; motivo?: string }> {
    if (!uid) return { ok: false, motivo: 'sin-sesion' };
    if (toma.audio.size > TOPE_SUBIDA) return { ok: false, motivo: 'demasiado-larga' };
    try {
        const [{ doc, setDoc }, col] = await Promise.all([
            import('firebase/firestore'),
            coleccionDeVoces(uid),
        ]);
        await setDoc(doc(col, idDocumento(toma.guionId, toma.clave)), {
            guionId: toma.guionId,
            personaje: toma.personaje,
            texto: toma.texto,
            clave: toma.clave,
            tipo: toma.audio.type || 'audio/webm',
            duracionMs: toma.duracionMs,
            creado: toma.creado,
            audio: await aBase64(toma.audio),
        });
        return { ok: true };
    } catch (e) {
        console.warn('[voces] no se pudo subir la toma:', e);
        return { ok: false, motivo: 'fallo-de-red' };
    }
}

/** Las tomas que este usuario tiene guardadas en su cuenta para este guion. */
export async function tomasDeNube(uid: string, guionId: string): Promise<TomaVoz[]> {
    if (!uid) return [];
    try {
        const [{ getDocs, query, where }, col] = await Promise.all([
            import('firebase/firestore'),
            coleccionDeVoces(uid),
        ]);
        const res = await getDocs(query(col, where('guionId', '==', guionId)));
        return res.docs.map(d => {
            const x = d.data() as Record<string, unknown>;
            return {
                id: d.id,
                guionId: String(x.guionId || ''),
                personaje: String(x.personaje || ''),
                texto: String(x.texto || ''),
                clave: String(x.clave || ''),
                audio: deBase64(String(x.audio || ''), String(x.tipo || '')),
                duracionMs: Number(x.duracionMs || 0),
                creado: Number(x.creado || 0),
            };
        });
    } catch (e) {
        console.warn('[voces] no se pudieron leer las tomas de la cuenta:', e);
        return [];
    }
}

async function borrarDeNube(uid: string, guionId: string, clave: string): Promise<void> {
    if (!uid) return;
    try {
        const [{ doc, deleteDoc }, col] = await Promise.all([
            import('firebase/firestore'),
            coleccionDeVoces(uid),
        ]);
        await deleteDoc(doc(col, idDocumento(guionId, clave)));
    } catch (e) {
        console.warn('[voces] no se pudo borrar de la cuenta:', e);
    }
}

// ---------------------------------------------------------------------------
// El almacén local
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

async function guardarLocal(toma: TomaVoz): Promise<void> {
    try { await transaccion('readwrite', a => a.put(toma)); }
    catch (e) { console.warn('[voces] no se pudo guardar en este navegador:', e); }
}

async function localesDeGuion(guionId: string): Promise<TomaVoz[]> {
    try {
        const bd = await abrir();
        return await new Promise<TomaVoz[]>((resolve, reject) => {
            const tx = bd.transaction(ALMACEN, 'readonly');
            const pet = tx.objectStore(ALMACEN).index('guion').getAll(guionId);
            pet.onsuccess = () => resolve(pet.result as TomaVoz[]);
            pet.onerror = () => reject(pet.error);
            tx.oncomplete = () => bd.close();
        });
    } catch {
        return [];
    }
}

/** Dónde ha quedado una toma recién grabada. */
export interface ResultadoGuardado {
    toma: TomaVoz;
    /** Si ha llegado a la cuenta (y por tanto sobrevive a este navegador). */
    enLaCuenta: boolean;
    /** Por qué no, cuando no: 'sin-sesion' | 'demasiado-larga' | 'fallo-de-red'. */
    motivo?: string;
}

/**
 * Guarda la toma. SIEMPRE en el navegador —para que suene al instante— y
 * ADEMÁS en la cuenta si hay sesión, que es la copia que de verdad dura.
 */
export async function guardarToma(
    t: Omit<TomaVoz, 'id' | 'creado'> & { creado?: number },
    uid?: string | null,
): Promise<ResultadoGuardado> {
    const toma: TomaVoz = { ...t, id: `${t.guionId}|${t.clave}`, creado: t.creado ?? Date.now() };
    await guardarLocal(toma);
    if (!uid) return { toma, enLaCuenta: false, motivo: 'sin-sesion' };
    const subida = await subirToma(uid, toma);
    return { toma, enLaCuenta: subida.ok, motivo: subida.motivo };
}

/**
 * Todas las tomas de un guion, por clave de línea.
 *
 * Se juntan las dos copias y MANDA LA DE LA CUENTA, que es la que ha visto más
 * aparatos. De paso, lo que venga de la cuenta se deja escrito en el navegador:
 * así el ensayo siguiente arranca al instante y funciona sin cobertura.
 *
 * Nunca lanza: si no hay IndexedDB (ventana privada) o no hay red, se ensaya
 * con lo que haya.
 */
export async function tomasDeGuion(guionId: string, uid?: string | null): Promise<Map<string, TomaVoz>> {
    const [locales, nube] = await Promise.all([
        localesDeGuion(guionId),
        uid ? tomasDeNube(uid, guionId) : Promise.resolve([] as TomaVoz[]),
    ]);

    const todas = new Map<string, TomaVoz>();
    for (const t of locales) todas.set(t.clave, t);
    for (const t of nube) {
        todas.set(t.clave, t);
        if (!locales.some(l => l.clave === t.clave)) await guardarLocal(t);
    }
    return todas;
}

export async function borrarToma(guionId: string, clave: string, uid?: string | null): Promise<void> {
    try { await transaccion('readwrite', a => a.delete(`${guionId}|${clave}`)); } catch { /* da igual */ }
    if (uid) await borrarDeNube(uid, guionId, clave);
}

/** Tira todas las tomas de un personaje (para volver a grabarlo entero). */
export async function borrarPersonaje(guionId: string, personaje: string, uid?: string | null): Promise<void> {
    const tomas = await tomasDeGuion(guionId, uid);
    for (const t of tomas.values()) {
        if (t.personaje === personaje) await borrarToma(guionId, t.clave, uid);
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

/**
 * Lo que se graba por segundo. 24 kbps mono en opus es voz limpia y clara
 * —es más de lo que usa una llamada— y deja una réplica de diez segundos en
 * unos 30 kB. Grabar a la calidad por defecto (128 kbps, música) multiplicaría
 * por cinco el tamaño sin que se oiga mejor una frase hablada.
 */
export const BITS_POR_SEGUNDO = 24000;

/** El formato que sepa grabar este navegador. Safari no hace webm. */
export function formatoDeGrabacion(): string {
    if (typeof MediaRecorder === 'undefined') return '';
    for (const tipo of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) {
        try { if (MediaRecorder.isTypeSupported(tipo)) return tipo; } catch { /* */ }
    }
    return '';
}
