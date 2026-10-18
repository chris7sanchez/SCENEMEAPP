# Voces del ensayo (ElevenLabs + audios guardados + describir voz) — Plan de implementación

> **Para agentes:** SUB-SKILL OBLIGATORIA: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea a tarea. Los pasos usan casillas (`- [ ]`).

**Objetivo:** proteger `/api/tts` (sesión + límite diario), no pagar dos veces el mismo audio, catálogo de 10 voces de España en ElevenLabs y "describir voz".

**Arquitectura:** la lógica vive en módulos pequeños de `src/lib/` con dependencias inyectadas (almacén, registro de uso, verificador de token) para poder probarlos sin Firebase. Las rutas de `src/app/api/tts/` solo pegan piezas. El cliente (`src/lib/speech.ts`) manda el token de Firebase y avisa al reproductor cuando cae a la voz del navegador.

**Stack:** Next.js 16 (rutas `runtime = 'nodejs'`), firebase-admin 13 (Auth, Firestore, Storage), Firebase JS 11 en cliente, vitest 4 (entorno `node`), API REST de ElevenLabs.

**Spec:** `docs/superpowers/specs/2026-10-11-voces-elevenlabs-cache-design.md`

**Entrega por fases:** las Tareas 1–6 (protección + audios guardados) se pueden desplegar solas y no necesitan plan de ElevenLabs. Las Tareas 7–11 necesitan una cuenta de ElevenLabs con clave API (plan Creator previsto).

## Restricciones globales

- Idioma: código, comentarios, mensajes y commits en español, como el resto del repo.
- Los ficheros de `src/lib/` que tienen test importan con rutas **relativas** (`./tts-limite`), nunca `@/`: `vitest.config.ts` no resuelve el alias.
- Tests: `npx vitest run <fichero>`; todos: `npm test`. Tipos: `npm run typecheck`. Lint: `npm run lint`.
- Límite diario por defecto: `5000` caracteres (`TTS_LIMITE_DIARIO`).
- Voces propias por usuario: `2` (`VOCES_PROPIAS_POR_USUARIO`).
- Huecos de voz de respaldo: `30` (`ELEVENLABS_VOICE_SLOTS`, plan Creator).
- Caché: `tts-cache/<proveedor>/<sha256>.mp3` en Firebase Storage, privado, borrado a los 90 días.
- Firestore: `tts_uso/<uid>_<AAAA-MM-DD>` (fecha UTC) y `voces_disenadas/<voiceId>`.
- El ensayo nunca se rompe: cualquier fallo de voz IA cae a la voz del navegador.
- No tocar `src/lib/voces-grabadas.ts` ni el motor `browser`.
- Commits: un commit por tarea, terminando con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

### Tarea 1: firebase-admin compartido

**Ficheros:**
- Crear: `src/lib/firebase-admin.ts`
- Modificar: `src/app/api/admin/verify-password/route.ts` (quitar `ensureAdmin`, usar `obtenerAdmin`)
- Test: `src/lib/firebase-admin.test.ts`

**Interfaces:**
- Produce: `obtenerAdmin(): typeof import('firebase-admin') | null`. Inicializa con `storageBucket = NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, así `admin.storage().bucket()` es el bucket del proyecto.

- [ ] **Paso 1: test que falla**

```ts
// src/lib/firebase-admin.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { obtenerAdmin } from './firebase-admin';

describe('obtenerAdmin', () => {
    beforeEach(() => {
        delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
        delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    });

    it('devuelve null si faltan las credenciales (no rompe el build)', () => {
        expect(obtenerAdmin()).toBeNull();
    });
});
```

- [ ] **Paso 2: ejecutar y ver que falla**

Run: `npx vitest run src/lib/firebase-admin.test.ts`
Esperado: FAIL, "Failed to resolve import ./firebase-admin".

- [ ] **Paso 3: implementación mínima**

```ts
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// firebase-admin se inicializa de forma perezosa: sin service account (un clon
// sin secretos, un preview de Vercel) devuelve null en vez de romper el build.
export function obtenerAdmin(): typeof admin | null {
    if (admin.apps.length) return admin;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!privateKey || !clientEmail || !projectId) return null;
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    return admin;
}
```

En `src/app/api/admin/verify-password/route.ts`: borrar la función `ensureAdmin` y el `import * as admin`; añadir `import { obtenerAdmin } from '@/lib/firebase-admin';` y sustituir el bloque del `if (password === masterPassword)` por:

```ts
        if (password === masterPassword) {
            const fb = obtenerAdmin();
            if (!fb) {
                return NextResponse.json({ error: 'Firebase admin no configurado' }, { status: 500 });
            }
            // Token personalizado para que el cliente se autentique en Firestore con permisos
            const customToken = await fb.auth().createCustomToken('admin-dashboard');
            return NextResponse.json({ success: true, token: customToken });
        } else {
```

- [ ] **Paso 4: tests y tipos**

Run: `npx vitest run src/lib/firebase-admin.test.ts && npm run typecheck`
Esperado: PASS y sin errores de tipos.

- [ ] **Paso 5: commit**

```bash
git add src/lib/firebase-admin.ts src/lib/firebase-admin.test.ts src/app/api/admin/verify-password/route.ts
git commit -m "refactor: firebase-admin compartido en src/lib/firebase-admin.ts"
```

---

### Tarea 2: caché de audios

**Ficheros:**
- Crear: `src/lib/tts-cache.ts`
- Test: `src/lib/tts-cache.test.ts`

**Interfaces:**
- Produce:
  - `interface DatosClave { proveedor: string; modelo: string; voz: string; ajustes: string; texto: string }`
  - `claveDeAudio(d: DatosClave): string` (sha256 hex, 64 caracteres)
  - `rutaDeAudio(proveedor: string, clave: string): string` → `tts-cache/<proveedor>/<clave>.mp3`
  - `interface AlmacenAudio { leer(ruta: string): Promise<Uint8Array | null>; guardar(ruta: string, audio: Uint8Array): Promise<void> }`
  - `cacheSegura(almacen: AlmacenAudio | null): AlmacenAudio` (nunca lanza)
  - `almacenFirebase(bucket): AlmacenAudio`

- [ ] **Paso 1: test que falla**

```ts
// src/lib/tts-cache.test.ts
import { describe, it, expect, vi } from 'vitest';
import { claveDeAudio, rutaDeAudio, cacheSegura, almacenFirebase, type AlmacenAudio } from './tts-cache';

const base = { proveedor: 'elevenlabs', modelo: 'eleven_multilingual_v2', voz: 'v1', ajustes: '', texto: 'Hola, Ana.' };

describe('claveDeAudio', () => {
    it('misma entrada, misma clave (sha256 hex)', () => {
        expect(claveDeAudio(base)).toBe(claveDeAudio({ ...base }));
        expect(claveDeAudio(base)).toMatch(/^[0-9a-f]{64}$/);
    });

    it('cambiar texto, voz, ajustes o modelo cambia la clave', () => {
        const k = claveDeAudio(base);
        expect(claveDeAudio({ ...base, texto: 'Hola, Ana' })).not.toBe(k);
        expect(claveDeAudio({ ...base, voz: 'v2' })).not.toBe(k);
        expect(claveDeAudio({ ...base, ajustes: 'triste' })).not.toBe(k);
        expect(claveDeAudio({ ...base, modelo: 'otro' })).not.toBe(k);
    });

    it('los campos no se mezclan entre sí', () => {
        expect(claveDeAudio({ ...base, voz: 'a', ajustes: 'bc' }))
            .not.toBe(claveDeAudio({ ...base, voz: 'ab', ajustes: 'c' }));
    });
});

describe('rutaDeAudio', () => {
    it('tts-cache/<proveedor>/<clave>.mp3', () => {
        expect(rutaDeAudio('openai', 'abc')).toBe('tts-cache/openai/abc.mp3');
    });
});

describe('cacheSegura', () => {
    it('sin almacén: no hay nada y guardar no hace nada', async () => {
        const c = cacheSegura(null);
        expect(await c.leer('x')).toBeNull();
        await expect(c.guardar('x', new Uint8Array([1]))).resolves.toBeUndefined();
    });

    it('si el almacén falla, no lanza', async () => {
        const roto: AlmacenAudio = {
            leer: vi.fn(async () => { throw new Error('caído'); }),
            guardar: vi.fn(async () => { throw new Error('caído'); }),
        };
        const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const c = cacheSegura(roto);
        expect(await c.leer('x')).toBeNull();
        await expect(c.guardar('x', new Uint8Array([1]))).resolves.toBeUndefined();
        expect(aviso).toHaveBeenCalledTimes(2);
        aviso.mockRestore();
    });
});

describe('almacenFirebase', () => {
    it('guarda y lee de vuelta por la misma ruta', async () => {
        const ficheros = new Map<string, Buffer>();
        const bucket = {
            file: (ruta: string) => ({
                exists: async (): Promise<[boolean]> => [ficheros.has(ruta)],
                download: async (): Promise<[Buffer]> => [ficheros.get(ruta)!],
                save: async (datos: Buffer, _opts: object) => { ficheros.set(ruta, datos); },
            }),
        };
        const a = almacenFirebase(bucket);
        expect(await a.leer('tts-cache/x/1.mp3')).toBeNull();
        await a.guardar('tts-cache/x/1.mp3', new Uint8Array([7, 8]));
        expect(Array.from((await a.leer('tts-cache/x/1.mp3'))!)).toEqual([7, 8]);
    });
});
```

- [ ] **Paso 2: ejecutar y ver que falla**

Run: `npx vitest run src/lib/tts-cache.test.ts`
Esperado: FAIL, "Failed to resolve import ./tts-cache".

- [ ] **Paso 3: implementación**

```ts
// src/lib/tts-cache.ts
import { createHash } from 'node:crypto';

// Guarda cada audio de voz IA para no pagarlo dos veces. La clave sale de TODO
// lo que cambia el sonido: proveedor, modelo, voz, ajustes y texto.

export interface DatosClave {
    proveedor: string;
    modelo: string;
    voz: string;
    ajustes: string;
    texto: string;
}

/** El separador \u0000 impide que "a"+"bc" choque con "ab"+"c". */
export function claveDeAudio(d: DatosClave): string {
    return createHash('sha256')
        .update([d.proveedor, d.modelo, d.voz, d.ajustes, d.texto].join('\u0000'))
        .digest('hex');
}

export function rutaDeAudio(proveedor: string, clave: string): string {
    return `tts-cache/${proveedor}/${clave}.mp3`;
}

export interface AlmacenAudio {
    leer(ruta: string): Promise<Uint8Array | null>;
    guardar(ruta: string, audio: Uint8Array): Promise<void>;
}

/** Nunca lanza: si el almacén falla, es "no está" o "no se guardó" y el ensayo sigue. */
export function cacheSegura(almacen: AlmacenAudio | null): AlmacenAudio {
    return {
        async leer(ruta) {
            if (!almacen) return null;
            try { return await almacen.leer(ruta); } catch (e) {
                console.warn('[tts-cache] no se pudo leer:', e);
                return null;
            }
        },
        async guardar(ruta, audio) {
            if (!almacen) return;
            try { await almacen.guardar(ruta, audio); } catch (e) {
                console.warn('[tts-cache] no se pudo guardar:', e);
            }
        },
    };
}

interface FicheroBucket {
    exists(): Promise<[boolean]>;
    download(): Promise<[Buffer]>;
    save(datos: Buffer, opts: object): Promise<void>;
}

/** Adaptador a Firebase Storage (bucket de firebase-admin). Ficheros privados. */
export function almacenFirebase(bucket: { file(ruta: string): FicheroBucket }): AlmacenAudio {
    return {
        async leer(ruta) {
            const f = bucket.file(ruta);
            const [existe] = await f.exists();
            if (!existe) return null;
            const [datos] = await f.download();
            return new Uint8Array(datos);
        },
        async guardar(ruta, audio) {
            await bucket.file(ruta).save(Buffer.from(audio), { contentType: 'audio/mpeg', resumable: false });
        },
    };
}
```

- [ ] **Paso 4: ejecutar y ver que pasa**

Run: `npx vitest run src/lib/tts-cache.test.ts`
Esperado: PASS (7 tests).

- [ ] **Paso 5: commit**

```bash
git add src/lib/tts-cache.ts src/lib/tts-cache.test.ts
git commit -m "feat: caché de audios de voz IA (tts-cache)"
```

---

### Tarea 3: límite diario por usuario

**Ficheros:**
- Crear: `src/lib/tts-limite.ts`
- Test: `src/lib/tts-limite.test.ts`

**Interfaces:**
- Produce:
  - `class LimiteSuperado extends Error { usados: number; limite: number }`
  - `idDeUso(uid: string, fecha: Date): string` → `<uid>_<AAAA-MM-DD>` (UTC)
  - `interface RegistroUso { sumarSiCabe(id: string, n: number, limite: number): Promise<{ cabe: boolean; usados: number }> }`
  - `consumirCaracteres(registro: RegistroUso, uid: string, n: number, limite: number, ahora?: Date): Promise<number>` (lanza `LimiteSuperado`)
  - `limiteDiario(): number` (env `TTS_LIMITE_DIARIO`, por defecto 5000)
  - `registroFirestore(db: Firestore): RegistroUso`

- [ ] **Paso 1: test que falla**

```ts
// src/lib/tts-limite.test.ts
import { describe, it, expect, afterEach } from 'vitest';
import { consumirCaracteres, idDeUso, limiteDiario, LimiteSuperado, type RegistroUso } from './tts-limite';

function registroEnMemoria(): RegistroUso & { datos: Map<string, number> } {
    const datos = new Map<string, number>();
    return {
        datos,
        async sumarSiCabe(id, n, limite) {
            const usados = datos.get(id) ?? 0;
            if (usados + n > limite) return { cabe: false, usados };
            datos.set(id, usados + n);
            return { cabe: true, usados: usados + n };
        },
    };
}

const DIA = new Date('2026-10-11T12:00:00Z');

describe('idDeUso', () => {
    it('uid + fecha UTC', () => {
        expect(idDeUso('u1', DIA)).toBe('u1_2026-10-11');
    });
});

describe('consumirCaracteres', () => {
    it('suma mientras cabe, también justo en el límite', async () => {
        const r = registroEnMemoria();
        expect(await consumirCaracteres(r, 'u1', 3000, 5000, DIA)).toBe(3000);
        expect(await consumirCaracteres(r, 'u1', 2000, 5000, DIA)).toBe(5000);
    });

    it('al pasarse lanza LimiteSuperado y no suma', async () => {
        const r = registroEnMemoria();
        await consumirCaracteres(r, 'u1', 4990, 5000, DIA);
        await expect(consumirCaracteres(r, 'u1', 20, 5000, DIA)).rejects.toBeInstanceOf(LimiteSuperado);
        expect(r.datos.get('u1_2026-10-11')).toBe(4990);
    });

    it('un día nuevo empieza de cero', async () => {
        const r = registroEnMemoria();
        await consumirCaracteres(r, 'u1', 5000, 5000, DIA);
        const manana = new Date('2026-10-12T00:00:01Z');
        expect(await consumirCaracteres(r, 'u1', 100, 5000, manana)).toBe(100);
    });

    it('cada usuario tiene su propio contador', async () => {
        const r = registroEnMemoria();
        await consumirCaracteres(r, 'u1', 5000, 5000, DIA);
        expect(await consumirCaracteres(r, 'u2', 100, 5000, DIA)).toBe(100);
    });
});

describe('limiteDiario', () => {
    afterEach(() => { delete process.env.TTS_LIMITE_DIARIO; });

    it('5000 por defecto', () => {
        expect(limiteDiario()).toBe(5000);
    });

    it('lee TTS_LIMITE_DIARIO y descarta valores raros', () => {
        process.env.TTS_LIMITE_DIARIO = '50';
        expect(limiteDiario()).toBe(50);
        process.env.TTS_LIMITE_DIARIO = 'mucho';
        expect(limiteDiario()).toBe(5000);
        process.env.TTS_LIMITE_DIARIO = '-3';
        expect(limiteDiario()).toBe(5000);
    });
});
```

- [ ] **Paso 2: ejecutar y ver que falla**

Run: `npx vitest run src/lib/tts-limite.test.ts`
Esperado: FAIL, "Failed to resolve import ./tts-limite".

- [ ] **Paso 3: implementación**

```ts
// src/lib/tts-limite.ts
import { Timestamp, type Firestore } from 'firebase-admin/firestore';

// Tope diario de caracteres de voz IA por usuario. Los audios ya guardados no
// cuentan (no cuestan): solo se llama aquí cuando hay que generar.

export class LimiteSuperado extends Error {
    constructor(public usados: number, public limite: number) {
        super('limite_diario');
        this.name = 'LimiteSuperado';
    }
}

/** `<uid>_<AAAA-MM-DD>` en UTC: el día cambia a la 1:00 o 2:00 de España. */
export function idDeUso(uid: string, fecha: Date): string {
    return `${uid}_${fecha.toISOString().slice(0, 10)}`;
}

export interface RegistroUso {
    /** Suma `n` solo si cabe en `limite`, de forma atómica. */
    sumarSiCabe(id: string, n: number, limite: number): Promise<{ cabe: boolean; usados: number }>;
}

export async function consumirCaracteres(
    registro: RegistroUso, uid: string, n: number, limite: number, ahora: Date = new Date(),
): Promise<number> {
    const r = await registro.sumarSiCabe(idDeUso(uid, ahora), n, limite);
    if (!r.cabe) throw new LimiteSuperado(r.usados, limite);
    return r.usados;
}

export function limiteDiario(): number {
    const n = Number(process.env.TTS_LIMITE_DIARIO);
    return Number.isFinite(n) && n > 0 ? n : 5000;
}

export function registroFirestore(db: Firestore): RegistroUso {
    return {
        sumarSiCabe: (id, n, limite) => db.runTransaction(async tx => {
            const ref = db.collection('tts_uso').doc(id);
            const snap = await tx.get(ref);
            const usados = (snap.exists ? Number(snap.get('caracteres')) : 0) || 0;
            if (usados + n > limite) return { cabe: false, usados };
            tx.set(ref, { caracteres: usados + n, actualizado: Timestamp.now() }, { merge: true });
            return { cabe: true, usados: usados + n };
        }),
    };
}
```

- [ ] **Paso 4: ejecutar y ver que pasa**

Run: `npx vitest run src/lib/tts-limite.test.ts`
Esperado: PASS (7 tests).

- [ ] **Paso 5: commit**

```bash
git add src/lib/tts-limite.ts src/lib/tts-limite.test.ts
git commit -m "feat: límite diario de caracteres de voz IA por usuario"
```

---

### Tarea 4: usuario de la petición

**Ficheros:**
- Crear: `src/lib/tts-auth.ts`
- Test: `src/lib/tts-auth.test.ts`

**Interfaces:**
- Produce: `type Verificador = (token: string) => Promise<{ uid: string }>` y `uidDeLaPeticion(req: Request, verificar: Verificador | null): Promise<string | null>`

- [ ] **Paso 1: test que falla**

```ts
// src/lib/tts-auth.test.ts
import { describe, it, expect, vi } from 'vitest';
import { uidDeLaPeticion } from './tts-auth';

const pet = (auth?: string) => new Request('https://x/api/tts', { method: 'POST', headers: auth ? { Authorization: auth } : {} });

describe('uidDeLaPeticion', () => {
    it('sin cabecera → null, sin llamar al verificador', async () => {
        const v = vi.fn();
        expect(await uidDeLaPeticion(pet(), v)).toBeNull();
        expect(v).not.toHaveBeenCalled();
    });

    it('cabecera que no es Bearer → null', async () => {
        expect(await uidDeLaPeticion(pet('Basic abc'), vi.fn())).toBeNull();
    });

    it('sin verificador (Firebase sin configurar) → null', async () => {
        expect(await uidDeLaPeticion(pet('Bearer tok'), null)).toBeNull();
    });

    it('token inválido → null', async () => {
        const v = vi.fn(async () => { throw new Error('expirado'); });
        expect(await uidDeLaPeticion(pet('Bearer tok'), v)).toBeNull();
    });

    it('token válido → uid', async () => {
        const v = vi.fn(async (t: string) => ({ uid: t === 'tok' ? 'u1' : 'otro' }));
        expect(await uidDeLaPeticion(pet('Bearer tok'), v)).toBe('u1');
    });
});
```

- [ ] **Paso 2: ejecutar y ver que falla**

Run: `npx vitest run src/lib/tts-auth.test.ts`
Esperado: FAIL, "Failed to resolve import ./tts-auth".

- [ ] **Paso 3: implementación**

```ts
// src/lib/tts-auth.ts

// Quién pide la voz. El cliente manda `Authorization: Bearer <ID token de
// Firebase>`; aquí se verifica. Cualquier fallo es "sin sesión", nunca un 500.

export type Verificador = (token: string) => Promise<{ uid: string }>;

export async function uidDeLaPeticion(req: Request, verificar: Verificador | null): Promise<string | null> {
    const cabecera = req.headers.get('authorization') || '';
    const m = /^Bearer\s+(.+)$/i.exec(cabecera);
    if (!m || !verificar) return null;
    try {
        return (await verificar(m[1].trim())).uid || null;
    } catch {
        return null;
    }
}
```

- [ ] **Paso 4: ejecutar y ver que pasa**

Run: `npx vitest run src/lib/tts-auth.test.ts`
Esperado: PASS (5 tests).

- [ ] **Paso 5: commit**

```bash
git add src/lib/tts-auth.ts src/lib/tts-auth.test.ts
git commit -m "feat: identificar al usuario de /api/tts por su token de Firebase"
```

---

### Tarea 5: `/api/tts` con sesión, caché y límite

**Ficheros:**
- Crear: `src/lib/tts-servicio.ts`
- Test: `src/lib/tts-servicio.test.ts`
- Modificar: `src/app/api/tts/route.ts` (reestructurar; el código de cada proveedor no cambia)

**Interfaces:**
- Consume: `LimiteSuperado` (Tarea 3), `claveDeAudio`/`rutaDeAudio`/`cacheSegura`/`almacenFirebase` (Tarea 2), `uidDeLaPeticion` (Tarea 4), `obtenerAdmin` (Tarea 1), `consumirCaracteres`/`limiteDiario`/`registroFirestore` (Tarea 3).
- Produce:
  - `interface DepsTts { uid: string | null; leer(): Promise<Uint8Array | null>; guardar(audio: Uint8Array): Promise<void>; consumir(uid: string, n: number): Promise<unknown>; generar(): Promise<Response> }`
  - `servirTts(texto: string, d: DepsTts): Promise<Response>`. Respuestas: 401 `{error:'login_requerido'}`, 429 `{error:'limite_diario', restante:0}`, 200 `audio/mpeg` con cabecera `X-TTS-Cache: hit|miss`.

- [ ] **Paso 1: test que falla**

```ts
// src/lib/tts-servicio.test.ts
import { describe, it, expect, vi } from 'vitest';
import { servirTts, type DepsTts } from './tts-servicio';
import { LimiteSuperado } from './tts-limite';

const MP3 = new Uint8Array([1, 2, 3]);

function deps(over: Partial<DepsTts> = {}): DepsTts {
    return {
        uid: 'u1',
        leer: vi.fn(async () => null),
        guardar: vi.fn(async () => {}),
        consumir: vi.fn(async () => 10),
        generar: vi.fn(async () => new Response(MP3, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } })),
        ...over,
    };
}

describe('servirTts', () => {
    it('sin sesión → 401 y no gasta nada', async () => {
        const d = deps({ uid: null });
        const r = await servirTts('Hola', d);
        expect(r.status).toBe(401);
        expect(await r.json()).toEqual({ error: 'login_requerido' });
        expect(d.generar).not.toHaveBeenCalled();
    });

    it('audio guardado → lo sirve sin consumir límite ni llamar al proveedor', async () => {
        const d = deps({ leer: vi.fn(async () => MP3) });
        const r = await servirTts('Hola', d);
        expect(r.status).toBe(200);
        expect(r.headers.get('X-TTS-Cache')).toBe('hit');
        expect(Array.from(new Uint8Array(await r.arrayBuffer()))).toEqual([1, 2, 3]);
        expect(d.consumir).not.toHaveBeenCalled();
        expect(d.generar).not.toHaveBeenCalled();
    });

    it('audio nuevo → consume la longitud del texto, genera y guarda', async () => {
        const d = deps();
        const r = await servirTts('Hola, Ana.', d);
        expect(r.status).toBe(200);
        expect(r.headers.get('X-TTS-Cache')).toBe('miss');
        expect(d.consumir).toHaveBeenCalledWith('u1', 10);
        expect(d.guardar).toHaveBeenCalledWith(MP3);
    });

    it('límite superado → 429 sin llamar al proveedor', async () => {
        const d = deps({ consumir: vi.fn(async () => { throw new LimiteSuperado(5000, 5000); }) });
        const r = await servirTts('Hola', d);
        expect(r.status).toBe(429);
        expect(await r.json()).toEqual({ error: 'limite_diario', restante: 0 });
        expect(d.generar).not.toHaveBeenCalled();
    });

    it('si el registro de uso falla por otra cosa, el ensayo sigue', async () => {
        const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const d = deps({ consumir: vi.fn(async () => { throw new Error('firestore caído'); }) });
        const r = await servirTts('Hola', d);
        expect(r.status).toBe(200);
        expect(d.generar).toHaveBeenCalled();
        aviso.mockRestore();
    });

    it('error del proveedor → se devuelve tal cual y no se guarda', async () => {
        const d = deps({ generar: vi.fn(async () => Response.json({ error: 'no_key' }, { status: 503 })) });
        const r = await servirTts('Hola', d);
        expect(r.status).toBe(503);
        expect(d.guardar).not.toHaveBeenCalled();
    });
});
```

- [ ] **Paso 2: ejecutar y ver que falla**

Run: `npx vitest run src/lib/tts-servicio.test.ts`
Esperado: FAIL, "Failed to resolve import ./tts-servicio".

- [ ] **Paso 3: implementar `servirTts`**

```ts
// src/lib/tts-servicio.ts
import { LimiteSuperado } from './tts-limite';

// Orden de /api/tts: sesión → audio guardado (gratis) → límite → proveedor → guardar.
// Las piezas llegan inyectadas para poder probarlo sin Firebase ni proveedores.

export interface DepsTts {
    uid: string | null;
    leer(): Promise<Uint8Array | null>;
    guardar(audio: Uint8Array): Promise<void>;
    consumir(uid: string, n: number): Promise<unknown>;
    generar(): Promise<Response>;
}

const CABECERAS_AUDIO = { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=86400' };

export async function servirTts(texto: string, d: DepsTts): Promise<Response> {
    if (!d.uid) return Response.json({ error: 'login_requerido' }, { status: 401 });

    const guardado = await d.leer();
    if (guardado) {
        return new Response(guardado, { status: 200, headers: { ...CABECERAS_AUDIO, 'X-TTS-Cache': 'hit' } });
    }

    try {
        await d.consumir(d.uid, texto.length);
    } catch (e) {
        if (e instanceof LimiteSuperado) return Response.json({ error: 'limite_diario', restante: 0 }, { status: 429 });
        // Sin registro de uso no se castiga al actor: se genera igual y queda en el log.
        console.warn('[tts] no se pudo apuntar el uso:', e);
    }

    const r = await d.generar();
    if (!r.ok) return r;
    const audio = new Uint8Array(await r.arrayBuffer());
    await d.guardar(audio);
    return new Response(audio, { status: 200, headers: { ...CABECERAS_AUDIO, 'X-TTS-Cache': 'miss' } });
}
```

- [ ] **Paso 4: ejecutar y ver que pasa**

Run: `npx vitest run src/lib/tts-servicio.test.ts`
Esperado: PASS (6 tests).

- [ ] **Paso 5: reescribir `src/app/api/tts/route.ts`**

El código de cada proveedor se mueve sin cambios a `llamarProveedor`; la voz se resuelve antes para que entre en la clave. Contenido completo:

```ts
import { NextRequest } from 'next/server';
import { obtenerAdmin } from '@/lib/firebase-admin';
import { uidDeLaPeticion } from '@/lib/tts-auth';
import { almacenFirebase, cacheSegura, claveDeAudio, rutaDeAudio } from '@/lib/tts-cache';
import { consumirCaracteres, limiteDiario, registroFirestore } from '@/lib/tts-limite';
import { servirTts } from '@/lib/tts-servicio';

// Genera voz por IA: 'openai' (gpt-4o-mini-tts), 'elevenlabs'
// (eleven_multilingual_v2) o 'cartesia' (sonic-3.5). Devuelve audio MP3.
// Exige sesión (401), respeta el límite diario (429) y reutiliza los audios ya
// generados. Si falta la clave del proveedor responde 503 y el cliente cae a
// la voz del navegador.

export const runtime = 'nodejs';

const OPENAI_VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer'];

const MODELO = { openai: 'gpt-4o-mini-tts', elevenlabs: 'eleven_multilingual_v2', cartesia: 'sonic-3.5' } as const;
type Proveedor = keyof typeof MODELO;

// Mapea una instrucción libre ("con rabia", "triste"...) a una emoción de Cartesia.
function cartesiaEmotion(instr: string): string | undefined {
    const t = (instr || '').toLowerCase();
    if (/rabia|enfad|furi|ira|grit/.test(t)) return 'angry';
    if (/triste|llanto|llor|deprim|dolor/.test(t)) return 'sad';
    if (/fr[ií]o|cortante|distante|seco/.test(t)) return 'distant';
    if (/c[áa]lid|cariñ|tern|cerca|amable/.test(t)) return 'affectionate';
    if (/nervios|ansa|ansied|inquiet/.test(t)) return 'anxious';
    if (/ir[óo]nic|sarcas|burl/.test(t)) return 'sarcastic';
    if (/asust|miedo|temor|p[áa]nic/.test(t)) return 'scared';
    if (/calm|sereno|tranquil|susurr/.test(t)) return 'calm';
    if (/alegr|feliz|content|entusias/.test(t)) return 'happy';
    return undefined;
}

const AUDIO = { 'Content-Type': 'audio/mpeg' };

/** Sin NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, bucket() lanza: se sigue sin caché. */
function bucketSeguro(fb: NonNullable<ReturnType<typeof obtenerAdmin>>) {
    try {
        return fb.storage().bucket();
    } catch (e) {
        console.warn('[tts] sin bucket de Storage, se sigue sin caché:', e);
        return null;
    }
}

async function llamarProveedor(
    provider: Proveedor, text: string, voz: string, instructions: string, fullInstructions: string, rate: number,
): Promise<Response> {
    try {
        if (provider === 'cartesia') {
            const key = process.env.CARTESIA_API_KEY;
            if (!key) return Response.json({ error: 'no_key', message: 'Falta CARTESIA_API_KEY' }, { status: 503 });
            const emotion = cartesiaEmotion(instructions);
            const r = await fetch('https://api.cartesia.ai/tts/bytes', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${key}`, 'Cartesia-Version': '2026-03-01', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model_id: MODELO.cartesia,
                    transcript: text,
                    voice: { mode: 'id', id: voz },
                    language: 'es',
                    output_format: { container: 'mp3', sample_rate: 44100, bit_rate: 128000 },
                    generation_config: { speed: rate, ...(emotion ? { emotion } : {}) },
                }),
            });
            if (!r.ok) {
                const detail = await r.text();
                return Response.json({ error: 'cartesia_error', status: r.status, detail: detail.slice(0, 300) }, { status: 502 });
            }
            return new Response(await r.arrayBuffer(), { status: 200, headers: AUDIO });
        }

        if (provider === 'elevenlabs') {
            const key = process.env.ELEVENLABS_API_KEY;
            if (!key) return Response.json({ error: 'no_key', message: 'Falta ELEVENLABS_API_KEY' }, { status: 503 });
            const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz}`, {
                method: 'POST',
                headers: { 'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
                body: JSON.stringify({
                    text,
                    model_id: MODELO.elevenlabs,
                    voice_settings: { stability: 0.4, similarity_boost: 0.85, style: 0.4, use_speaker_boost: true },
                }),
            });
            if (!r.ok) {
                const detail = await r.text();
                return Response.json({ error: 'elevenlabs_error', status: r.status, detail: detail.slice(0, 300) }, { status: 502 });
            }
            return new Response(await r.arrayBuffer(), { status: 200, headers: AUDIO });
        }

        // OpenAI por defecto
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return Response.json({ error: 'no_key', message: 'Falta OPENAI_API_KEY' }, { status: 503 });
        const r = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: MODELO.openai, voice: voz, input: text, instructions: fullInstructions, response_format: 'mp3' }),
        });
        if (!r.ok) {
            const detail = await r.text();
            return Response.json({ error: 'openai_error', status: r.status, detail: detail.slice(0, 300) }, { status: 502 });
        }
        return new Response(await r.arrayBuffer(), { status: 200, headers: AUDIO });
    } catch (e: any) {
        return Response.json({ error: 'fetch_failed', message: e?.message || String(e) }, { status: 502 });
    }
}

export async function POST(req: NextRequest) {
    let body: any;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: 'bad_request' }, { status: 400 });
    }

    const provider: Proveedor = ['elevenlabs', 'cartesia'].includes(body?.provider) ? body.provider : 'openai';
    const text: string = (body?.text || '').toString().slice(0, 800);
    const instructions: string = (body?.instructions || '').toString().slice(0, 400);
    const rate: number = Math.min(1.5, Math.max(0.6, Number(body?.rate) || 1));
    if (!text.trim()) return Response.json({ error: 'empty_text' }, { status: 400 });

    const baseStyle = 'Habla en español de España con voz humana y natural, ritmo conversacional realista, entonación expresiva y emoción acorde a la escena; nada de tono de locutor de anuncio.';
    const fullInstructions = instructions ? `${baseStyle} ${instructions}` : baseStyle;

    let voz: string;
    if (provider === 'cartesia') {
        voz = (body?.voice || '').toString();
        if (!voz) return Response.json({ error: 'no_voice', message: 'Falta voz de Cartesia' }, { status: 400 });
    } else if (provider === 'elevenlabs') {
        voz = (body?.voice || 'EXAVITQu4vr4xnSDxMaL').toString();
    } else {
        voz = OPENAI_VOICES.includes(body?.voice) ? body.voice : 'alloy';
    }

    // En la clave entra solo lo que cambia el audio de ESE proveedor:
    // ElevenLabs ignora instrucciones y velocidad; OpenAI ignora la velocidad.
    const ajustes = provider === 'cartesia' ? `${cartesiaEmotion(instructions) ?? ''}|${rate}`
        : provider === 'openai' ? fullInstructions
        : '';
    const ruta = rutaDeAudio(provider, claveDeAudio({ proveedor: provider, modelo: MODELO[provider], voz, ajustes, texto: text }));

    const fb = obtenerAdmin();
    const bucket = fb ? bucketSeguro(fb) : null;
    const cache = cacheSegura(bucket ? almacenFirebase(bucket) : null);
    const uid = await uidDeLaPeticion(req, fb ? t => fb.auth().verifyIdToken(t) : null);

    const res = await servirTts(text, {
        uid,
        leer: () => cache.leer(ruta),
        guardar: audio => cache.guardar(ruta, audio),
        consumir: (u, n) => (fb ? consumirCaracteres(registroFirestore(fb.firestore()), u, n, limiteDiario()) : Promise.resolve(0)),
        generar: () => llamarProveedor(provider, text, voz, instructions, fullInstructions, rate),
    });
    // Para medir el ahorro: proporción de "hit" sobre el total en los logs de Vercel.
    console.info(`[tts] ${provider} ${res.status} cache=${res.headers.get('X-TTS-Cache') ?? '-'}`);
    return res;
}
```

- [ ] **Paso 6: tests, tipos y lint**

Run: `npm test && npm run typecheck && npm run lint`
Esperado: todo en verde. Si `fb.storage().bucket()` da un error de tipos con `almacenFirebase`, cambia el parámetro de `almacenFirebase` a `import type { Bucket } from '@google-cloud/storage'` (lo trae firebase-admin) y mantén el test con un objeto que cumpla `{ file(ruta) }` mediante `as unknown as Bucket`.

- [ ] **Paso 7: commit**

```bash
git add src/lib/tts-servicio.ts src/lib/tts-servicio.test.ts src/app/api/tts/route.ts
git commit -m "feat: /api/tts exige sesión, respeta el límite diario y reutiliza audios guardados"
```

---

### Tarea 6: el cliente manda el token y avisa al caer al navegador

**Ficheros:**
- Crear: `src/lib/tts-cliente.ts`
- Test: `src/lib/tts-cliente.test.ts`
- Modificar: `src/lib/speech.ts` (función `fetchUrl` de `AiSpeechProvider`, ≈ líneas 296-318)
- Modificar: `src/components/studio/RehearsalPlayer.tsx` (aviso visible)

**Interfaces:**
- Produce:
  - `type AvisoTts = 'login_requerido' | 'limite_diario'`
  - `TEXTO_AVISO: Record<AvisoTts, string>`
  - `avisoDeRespuesta(status: number): AvisoTts | null`
  - `alAvisoTts(fn: (a: AvisoTts) => void): () => void` y `emitirAvisoTts(a: AvisoTts): void`
  - `cabecerasTts(obtenerToken: () => Promise<string | null>): Promise<Record<string, string>>`
  - `obtenerTokenSesion(): Promise<string | null>` (solo navegador; carga `./firebase` con import dinámico)

- [ ] **Paso 1: test que falla**

```ts
// src/lib/tts-cliente.test.ts
import { describe, it, expect, vi } from 'vitest';
import { alAvisoTts, avisoDeRespuesta, cabecerasTts, emitirAvisoTts, TEXTO_AVISO } from './tts-cliente';

describe('avisoDeRespuesta', () => {
    it('401 → login, 429 → límite, el resto nada', () => {
        expect(avisoDeRespuesta(401)).toBe('login_requerido');
        expect(avisoDeRespuesta(429)).toBe('limite_diario');
        expect(avisoDeRespuesta(503)).toBeNull();
        expect(avisoDeRespuesta(200)).toBeNull();
    });

    it('cada aviso tiene texto', () => {
        expect(TEXTO_AVISO.login_requerido).toMatch(/sesión/);
        expect(TEXTO_AVISO.limite_diario).toMatch(/límite/);
    });
});

describe('cabecerasTts', () => {
    it('con token añade Authorization Bearer', async () => {
        expect(await cabecerasTts(async () => 'tok')).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer tok' });
    });

    it('sin token o si falla, solo Content-Type', async () => {
        expect(await cabecerasTts(async () => null)).toEqual({ 'Content-Type': 'application/json' });
        expect(await cabecerasTts(async () => { throw new Error('x'); })).toEqual({ 'Content-Type': 'application/json' });
    });
});

describe('alAvisoTts', () => {
    it('avisa a quien escucha y deja de avisar al darse de baja', () => {
        const fn = vi.fn();
        const baja = alAvisoTts(fn);
        emitirAvisoTts('limite_diario');
        baja();
        emitirAvisoTts('login_requerido');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('limite_diario');
    });
});
```

- [ ] **Paso 2: ejecutar y ver que falla**

Run: `npx vitest run src/lib/tts-cliente.test.ts`
Esperado: FAIL, "Failed to resolve import ./tts-cliente".

- [ ] **Paso 3: implementación**

```ts
// src/lib/tts-cliente.ts

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
```

- [ ] **Paso 4: ejecutar y ver que pasa**

Run: `npx vitest run src/lib/tts-cliente.test.ts`
Esperado: PASS (5 tests).

- [ ] **Paso 5: usarlo en `src/lib/speech.ts`**

Añadir arriba, junto a los otros imports:

```ts
import { avisoDeRespuesta, cabecerasTts, emitirAvisoTts, obtenerTokenSesion } from './tts-cliente';
```

En `fetchUrl`, sustituir:

```ts
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal,
            });
            if (!res.ok) throw new Error('tts_' + res.status);
```

por:

```ts
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: await cabecerasTts(obtenerTokenSesion),
                body: JSON.stringify(body),
                signal,
            });
            if (!res.ok) {
                const aviso = avisoDeRespuesta(res.status);
                if (aviso) emitirAvisoTts(aviso);
                throw new Error('tts_' + res.status);
            }
```

- [ ] **Paso 6: aviso visible en `src/components/studio/RehearsalPlayer.tsx`**

Import nuevo:

```ts
import { alAvisoTts, TEXTO_AVISO } from '@/lib/tts-cliente';
```

En `RehearsalPlayer`, junto al resto de `useState`:

```ts
    /** Por qué una voz IA ha caído a la del navegador (sin sesión, límite...). */
    const [aviso, setAviso] = useState<string | null>(null);
    useEffect(() => alAvisoTts(a => setAviso(TEXTO_AVISO[a])), []);
```

En el `return` de `RehearsalPlayer`, justo antes de la expresión `{grabandoA ? (`:

```tsx
                {aviso && (
                    <div role="status" className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-amber-500/40 bg-zinc-900 px-3 py-2 text-sm text-amber-200">
                        <span>{aviso}</span>
                        <button onClick={() => setAviso(null)} className="shrink-0 text-xs font-bold text-zinc-200 hover:text-white">Cerrar</button>
                    </div>
                )}
```

- [ ] **Paso 7: tests, tipos, lint**

Run: `npm test && npm run typecheck && npm run lint`
Esperado: todo en verde (incluido `genero.test.ts`, que importa `./speech`).

- [ ] **Paso 8: comprobación en el navegador**

Run: `npm run dev` y abrir `http://localhost:9002`, ir al ensayo, motor "Voz IA (OpenAI)":
1. Sin sesión: suena la voz del navegador y aparece el aviso "Inicia sesión…".
2. Con sesión e `TTS_LIMITE_DIARIO=50` en `.env.local`: tras unas réplicas aparece "Has llegado al límite…" y sigue la voz del navegador.
3. Con sesión, recargar y repetir la misma escena: en la terminal del servidor las réplicas repetidas salen `cache=hit`.
4. Legibilidad del aviso (texto ámbar claro sobre fondo zinc-900) en móvil y escritorio.

- [ ] **Paso 9: commit**

```bash
git add src/lib/tts-cliente.ts src/lib/tts-cliente.test.ts src/lib/speech.ts src/components/studio/RehearsalPlayer.tsx
git commit -m "feat: el ensayo manda la sesión a /api/tts y avisa al caer a la voz del navegador"
```

**→ Hito: las Tareas 1–6 ya se pueden desplegar (ver Tarea 12, pasos 1–5).**

---

### Tarea 7: catálogo de 10 voces de España

**Ficheros:**
- Crear: `src/lib/voces-catalogo.ts` (las voces de ElevenLabs salen de `speech.ts`)
- Crear: `scripts/voces-elevenlabs.mjs`
- Test: `src/lib/voces-catalogo.test.ts`
- Modificar: `src/lib/speech.ts` (≈ líneas 499-510: borrar la lista y reexportar)
- Modificar: `src/app/api/tts/route.ts` (voz por defecto de ElevenLabs)

**Interfaces:**
- Produce: `ELEVENLABS_VOICES: SpeechVoice[]` desde `src/lib/voces-catalogo.ts` (y reexportado desde `speech.ts`, así los imports actuales no cambian).

- [ ] **Paso 1: mover la lista sin cambiarla**

```ts
// src/lib/voces-catalogo.ts
import type { SpeechVoice } from './speech';

// Catálogo de ElevenLabs (multilingüe v2). El id es el voice_id. Vive aparte de
// speech.ts para que el servidor pueda leerlo sin cargar código de navegador.
export const ELEVENLABS_VOICES: SpeechVoice[] = [
    { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Bella (femenina, suave)', lang: 'multi' },
    { id: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel (femenina, serena)', lang: 'multi' },
    { id: 'AZnzlk1XvdvUeBnXmlld', label: 'Domi (femenina, intensa)', lang: 'multi' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', label: 'Elli (femenina, joven)', lang: 'multi' },
    { id: 'ErXwobaYiN019PkySvjV', label: 'Antoni (masculina, cálida)', lang: 'multi' },
    { id: 'pNInz6obpgDQGcFmaJgB', label: 'Adam (masculina, profunda)', lang: 'multi' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', label: 'Josh (masculina, joven)', lang: 'multi' },
    { id: 'VR6AewLTigWG4xSOukaG', label: 'Arnold (masculina, firme)', lang: 'multi' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', label: 'Sam (masculina, neutra)', lang: 'multi' },
];
```

En `src/lib/speech.ts`, borrar el bloque `// Voces premade de ElevenLabs…` + `export const ELEVENLABS_VOICES: SpeechVoice[] = [ … ];` y poner en su lugar:

```ts
export { ELEVENLABS_VOICES } from './voces-catalogo';
import { ELEVENLABS_VOICES } from './voces-catalogo';
```

(el `import` es necesario porque `speech.ts` usa `ELEVENLABS_VOICES` dentro de `AiSpeechProvider`).

Run: `npm test && npm run typecheck`
Esperado: verde (es solo un movimiento).

- [ ] **Paso 2: test del catálogo nuevo (falla)**

```ts
// src/lib/voces-catalogo.test.ts
import { describe, it, expect } from 'vitest';
import { ELEVENLABS_VOICES } from './voces-catalogo';
import { generoDeVoz } from './genero';

const ANTIGUAS_EN_INGLES = [
    'EXAVITQu4vr4xnSDxMaL', '21m00Tcm4TlvDq8ikWAM', 'AZnzlk1XvdvUeBnXmlld', 'MF3mGyEYCl7XYWbV9V6O',
    'ErXwobaYiN019PkySvjV', 'pNInz6obpgDQGcFmaJgB', 'TxGEqnHWrfWFTfGW9XjX', 'VR6AewLTigWG4xSOukaG', 'yoZ06aMxZJJ28mfd3POQ',
];

describe('catálogo de ElevenLabs', () => {
    it('10 voces con id único', () => {
        expect(ELEVENLABS_VOICES).toHaveLength(10);
        expect(new Set(ELEVENLABS_VOICES.map(v => v.id)).size).toBe(10);
    });

    it('5 femeninas y 5 masculinas (el reparto automático depende de ello)', () => {
        const g = ELEVENLABS_VOICES.map(generoDeVoz);
        expect(g.filter(x => x === 'f')).toHaveLength(5);
        expect(g.filter(x => x === 'm')).toHaveLength(5);
    });

    it('ya no quedan las voces nativas en inglés', () => {
        for (const v of ELEVENLABS_VOICES) expect(ANTIGUAS_EN_INGLES).not.toContain(v.id);
    });
});
```

Run: `npx vitest run src/lib/voces-catalogo.test.ts`
Esperado: FAIL ("expected length 10, got 9").

- [ ] **Paso 3: script para listar las voces de la cuenta**

```js
// scripts/voces-elevenlabs.mjs
// Imprime las voces de TU cuenta de ElevenLabs listas para pegar en
// src/lib/voces-catalogo.ts. Uso:
//   ELEVENLABS_API_KEY=... node scripts/voces-elevenlabs.mjs
const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
    console.error('Falta ELEVENLABS_API_KEY');
    process.exit(1);
}
const r = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': key } });
if (!r.ok) {
    console.error('ElevenLabs respondió', r.status, (await r.text()).slice(0, 300));
    process.exit(1);
}
const { voices = [] } = await r.json();
const genero = g => (g === 'female' ? 'femenina' : g === 'male' ? 'masculina' : 'neutra');
for (const v of voices) {
    const l = v.labels || {};
    const extra = [l.age, l.accent].filter(Boolean).join(', ');
    const nombre = String(v.name).replace(/'/g, "\\'");
    console.log(`    { id: '${v.voice_id}', label: '${nombre} (${genero(l.gender)}${extra ? ', ' + extra : ''})', lang: 'multi' },`);
}
```

- [ ] **Paso 4: PASO HUMANO (Christian) — elegir las 10 voces**

1. Entrar en elevenlabs.io → Voices → Voice Library.
2. Filtrar: idioma Spanish, acento Spain/Castilian (o peninsular).
3. Escuchar y añadir a "My Voices" 5 voces de mujer y 5 de hombre de edades distintas.
4. Ejecutar `ELEVENLABS_API_KEY=… node scripts/voces-elevenlabs.mjs` y quedarse con las 10 líneas de esas voces. Si alguna sale como `neutra`, cambiar a mano `neutra` por `femenina` o `masculina` en su línea.

- [ ] **Paso 5: pegar las 10 líneas**

Sustituir el contenido del array de `src/lib/voces-catalogo.ts` por las 10 líneas impresas por el script. En `src/app/api/tts/route.ts`, añadir `import { ELEVENLABS_VOICES } from '@/lib/voces-catalogo';` y cambiar la voz por defecto:

```ts
        voz = (body?.voice || ELEVENLABS_VOICES[0].id).toString();
```

- [ ] **Paso 6: tests**

Run: `npm test && npm run typecheck`
Esperado: PASS, incluidos `voces-catalogo.test.ts` y `genero.test.ts`.

- [ ] **Paso 7: commit**

```bash
git add src/lib/voces-catalogo.ts src/lib/voces-catalogo.test.ts src/lib/speech.ts src/app/api/tts/route.ts scripts/voces-elevenlabs.mjs
git commit -m "feat: catálogo de 10 voces de España en ElevenLabs"
```

---

### Tarea 8: reglas de "describir voz"

**Ficheros:**
- Crear: `src/lib/voces-disenadas.ts`
- Test: `src/lib/voces-disenadas.test.ts`

**Interfaces:**
- Produce:
  - `interface VozDisenada { voiceId: string; uid: string; descripcion: string; genero: 'f' | 'm'; creada: number; ultimoUso: number }` (fechas en ms)
  - `TEXTO_MUESTRA: string` (100–1000 caracteres, exigido por ElevenLabs)
  - `descripcionValida(d: string): boolean` (10–900 caracteres tras recortar)
  - `descripcionParaElevenLabs(d: string, genero: 'f' | 'm'): string` (20–1000 caracteres)
  - `etiquetaDeVoz(d: string, genero: 'f' | 'm'): string`
  - `puedeCrearOtra(propias: number, maximo: number): boolean`
  - `hayHueco(usados: number, limite: number): boolean`
  - `elegirVozALiberar(voces: VozDisenada[], catalogo: ReadonlySet<string>): VozDisenada | null`
  - `maximoPorUsuario(): number` (env, por defecto 2) y `huecosDeRespaldo(): number` (env, por defecto 30)

- [ ] **Paso 1: test que falla**

```ts
// src/lib/voces-disenadas.test.ts
import { describe, it, expect, afterEach } from 'vitest';
import {
    TEXTO_MUESTRA, descripcionValida, descripcionParaElevenLabs, etiquetaDeVoz,
    puedeCrearOtra, hayHueco, elegirVozALiberar, maximoPorUsuario, huecosDeRespaldo, type VozDisenada,
} from './voces-disenadas';
import { generoDeVoz } from './genero';

const voz = (voiceId: string, ultimoUso: number): VozDisenada =>
    ({ voiceId, uid: 'u', descripcion: 'x', genero: 'f', creada: 0, ultimoUso });

describe('textos para ElevenLabs', () => {
    it('la muestra cumple 100–1000 caracteres', () => {
        expect(TEXTO_MUESTRA.length).toBeGreaterThanOrEqual(100);
        expect(TEXTO_MUESTRA.length).toBeLessThanOrEqual(1000);
    });

    it('descripción válida entre 10 y 900 caracteres', () => {
        expect(descripcionValida('corta')).toBe(false);
        expect(descripcionValida('anciana andaluza, voz rota')).toBe(true);
        expect(descripcionValida('a'.repeat(901))).toBe(false);
    });

    it('la descripción enviada lleva género y acento y cumple 20–1000', () => {
        const d = descripcionParaElevenLabs('  anciana   andaluza ', 'f');
        expect(d).toBe('Voz de mujer. anciana andaluza. Habla español de España con acento castellano.');
        expect(descripcionParaElevenLabs('a'.repeat(900), 'm').length).toBeLessThanOrEqual(1000);
    });

    it('la etiqueta deja claro el género (para el reparto) y que es tuya', () => {
        const f = etiquetaDeVoz('anciana andaluza, voz rota', 'f');
        expect(f).toBe('anciana andaluza, voz rota (femenina, tuya)');
        expect(generoDeVoz({ label: f })).toBe('f');
        expect(generoDeVoz({ label: etiquetaDeVoz('capitán de barco', 'm') })).toBe('m');
        expect(etiquetaDeVoz('x'.repeat(60), 'm')).toBe('x'.repeat(39) + '… (masculina, tuya)');
    });
});

describe('cupos', () => {
    it('máximo de voces propias por usuario', () => {
        expect(puedeCrearOtra(1, 2)).toBe(true);
        expect(puedeCrearOtra(2, 2)).toBe(false);
    });

    it('huecos de la cuenta', () => {
        expect(hayHueco(29, 30)).toBe(true);
        expect(hayHueco(30, 30)).toBe(false);
    });
});

describe('elegirVozALiberar', () => {
    it('la propia menos usada', () => {
        expect(elegirVozALiberar([voz('a', 300), voz('b', 100), voz('c', 200)], new Set())?.voiceId).toBe('b');
    });

    it('nunca una del catálogo', () => {
        expect(elegirVozALiberar([voz('cat', 1), voz('b', 100)], new Set(['cat']))?.voiceId).toBe('b');
        expect(elegirVozALiberar([voz('cat', 1)], new Set(['cat']))).toBeNull();
    });

    it('sin voces → null', () => {
        expect(elegirVozALiberar([], new Set())).toBeNull();
    });
});

describe('configuración', () => {
    afterEach(() => {
        delete process.env.VOCES_PROPIAS_POR_USUARIO;
        delete process.env.ELEVENLABS_VOICE_SLOTS;
    });

    it('2 voces propias y 30 huecos por defecto', () => {
        expect(maximoPorUsuario()).toBe(2);
        expect(huecosDeRespaldo()).toBe(30);
    });

    it('lee las variables de entorno', () => {
        process.env.VOCES_PROPIAS_POR_USUARIO = '3';
        process.env.ELEVENLABS_VOICE_SLOTS = '160';
        expect(maximoPorUsuario()).toBe(3);
        expect(huecosDeRespaldo()).toBe(160);
    });
});
```

- [ ] **Paso 2: ejecutar y ver que falla**

Run: `npx vitest run src/lib/voces-disenadas.test.ts`
Esperado: FAIL, "Failed to resolve import ./voces-disenadas".

- [ ] **Paso 3: implementación**

```ts
// src/lib/voces-disenadas.ts

// Reglas de "describir voz": textos que se mandan a ElevenLabs, cupos por
// usuario y qué voz liberar cuando la cuenta no tiene huecos. Sin red ni
// Firebase: lo pegan las rutas de /api/tts/disenar y /api/tts/mis-voces.

export interface VozDisenada {
    voiceId: string;
    uid: string;
    descripcion: string;
    genero: 'f' | 'm';
    /** ms desde epoch */
    creada: number;
    /** ms desde epoch; se actualiza una vez por ensayo */
    ultimoUso: number;
}

/** ElevenLabs exige 100–1000 caracteres para las muestras. */
export const TEXTO_MUESTRA = 'Hola, soy tu compañero de escena. Vamos a ensayar juntos esta escena, línea a línea, hasta que te la sepas de memoria. ¿Empezamos?';

const limpia = (s: string) => s.trim().replace(/\s+/g, ' ');

export function descripcionValida(d: string): boolean {
    const n = limpia(d).length;
    return n >= 10 && n <= 900;
}

export function descripcionParaElevenLabs(d: string, genero: 'f' | 'm'): string {
    const quien = genero === 'f' ? 'Voz de mujer' : 'Voz de hombre';
    return `${quien}. ${limpia(d).slice(0, 900)}. Habla español de España con acento castellano.`;
}

/** El género va en la etiqueta porque el reparto automático lo lee de ahí (generoDeVoz). */
export function etiquetaDeVoz(d: string, genero: 'f' | 'm'): string {
    const t = limpia(d);
    const corta = t.length > 40 ? t.slice(0, 39) + '…' : t;
    return `${corta} (${genero === 'f' ? 'femenina' : 'masculina'}, tuya)`;
}

export function puedeCrearOtra(propias: number, maximo: number): boolean {
    return propias < maximo;
}

export function hayHueco(usados: number, limite: number): boolean {
    return usados < limite;
}

/** La voz propia (de cualquier usuario) que lleva más tiempo sin usarse. Nunca una del catálogo. */
export function elegirVozALiberar(voces: VozDisenada[], catalogo: ReadonlySet<string>): VozDisenada | null {
    const candidatas = voces.filter(v => !catalogo.has(v.voiceId));
    if (!candidatas.length) return null;
    return candidatas.reduce((a, b) => (b.ultimoUso < a.ultimoUso ? b : a));
}

const entero = (v: string | undefined, porDefecto: number) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : porDefecto;
};

export function maximoPorUsuario(): number {
    return entero(process.env.VOCES_PROPIAS_POR_USUARIO, 2);
}

export function huecosDeRespaldo(): number {
    return entero(process.env.ELEVENLABS_VOICE_SLOTS, 30);
}
```

- [ ] **Paso 4: ejecutar y ver que pasa**

Run: `npx vitest run src/lib/voces-disenadas.test.ts`
Esperado: PASS (12 tests).

- [ ] **Paso 5: commit**

```bash
git add src/lib/voces-disenadas.ts src/lib/voces-disenadas.test.ts
git commit -m "feat: reglas de describir voz (textos, cupos y voz a liberar)"
```

---

### Tarea 9: cliente de la API de voces de ElevenLabs

**Ficheros:**
- Crear: `src/lib/elevenlabs-voces.ts`
- Test: `src/lib/elevenlabs-voces.test.ts`

**Interfaces:**
- Produce:
  - `class ErrorElevenLabs extends Error { status: number; detalle: string }`
  - `interface Muestra { generatedVoiceId: string; audioBase64: string }`
  - `disenarVoz(key: string, descripcion: string, texto: string): Promise<Muestra[]>` → `POST /v1/text-to-voice/design`
  - `crearVoz(key: string, o: { nombre: string; descripcion: string; generatedVoiceId: string }): Promise<string>` → `POST /v1/text-to-voice`, devuelve `voice_id`
  - `borrarVoz(key: string, voiceId: string): Promise<void>` → `DELETE /v1/voices/{id}`
  - `huecosDeVoz(key: string): Promise<{ usados: number; limite: number } | null>` → `GET /v1/user/subscription` (`voice_slots_used`, `voice_limit`); `null` si falla

- [ ] **Paso 1: test que falla**

```ts
// src/lib/elevenlabs-voces.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { borrarVoz, crearVoz, disenarVoz, ErrorElevenLabs, huecosDeVoz } from './elevenlabs-voces';

afterEach(() => { vi.unstubAllGlobals(); });

function stubFetch(respuesta: Response) {
    const f = vi.fn(async (_url: string, _init?: RequestInit) => respuesta);
    vi.stubGlobal('fetch', f);
    return f;
}

describe('disenarVoz', () => {
    it('llama a /text-to-voice/design y devuelve hasta 3 muestras', async () => {
        const f = stubFetch(Response.json({ previews: [
            { generated_voice_id: 'g1', audio_base_64: 'AAA' },
            { generated_voice_id: 'g2', audio_base_64: 'BBB' },
            { generated_voice_id: 'g3', audio_base_64: 'CCC' },
            { generated_voice_id: 'g4', audio_base_64: 'DDD' },
        ] }));
        const m = await disenarVoz('k', 'Voz de mujer. anciana.', 'texto');
        expect(m).toEqual([
            { generatedVoiceId: 'g1', audioBase64: 'AAA' },
            { generatedVoiceId: 'g2', audioBase64: 'BBB' },
            { generatedVoiceId: 'g3', audioBase64: 'CCC' },
        ]);
        const [url, init] = f.mock.calls[0];
        expect(url).toBe('https://api.elevenlabs.io/v1/text-to-voice/design');
        expect(init?.method).toBe('POST');
        expect((init?.headers as Record<string, string>)['xi-api-key']).toBe('k');
        expect(JSON.parse(String(init?.body))).toEqual({
            voice_description: 'Voz de mujer. anciana.', text: 'texto', model_id: 'eleven_multilingual_ttv_v2',
        });
    });

    it('descarta muestras sin audio', async () => {
        stubFetch(Response.json({ previews: [{ generated_voice_id: 'g1' }] }));
        expect(await disenarVoz('k', 'd', 't')).toEqual([]);
    });

    it('error HTTP → ErrorElevenLabs con el status', async () => {
        stubFetch(new Response('sin créditos', { status: 402 }));
        await expect(disenarVoz('k', 'd', 't')).rejects.toMatchObject({ status: 402, detalle: 'sin créditos' });
    });
});

describe('crearVoz', () => {
    it('manda voice_name, voice_description y generated_voice_id; devuelve voice_id', async () => {
        const f = stubFetch(Response.json({ voice_id: 'v9' }));
        expect(await crearVoz('k', { nombre: 'n', descripcion: 'd', generatedVoiceId: 'g1' })).toBe('v9');
        const [url, init] = f.mock.calls[0];
        expect(url).toBe('https://api.elevenlabs.io/v1/text-to-voice');
        expect(JSON.parse(String(init?.body))).toEqual({
            voice_name: 'n', voice_description: 'd', generated_voice_id: 'g1', labels: { origen: 'sceneme' },
        });
    });

    it('sin voice_id en la respuesta → error', async () => {
        stubFetch(Response.json({}));
        await expect(crearVoz('k', { nombre: 'n', descripcion: 'd', generatedVoiceId: 'g' })).rejects.toBeInstanceOf(ErrorElevenLabs);
    });
});

describe('borrarVoz', () => {
    it('DELETE /voices/{id}', async () => {
        const f = stubFetch(Response.json({ status: 'ok' }));
        await borrarVoz('k', 'v 1');
        expect(f.mock.calls[0][0]).toBe('https://api.elevenlabs.io/v1/voices/v%201');
        expect(f.mock.calls[0][1]?.method).toBe('DELETE');
    });
});

describe('huecosDeVoz', () => {
    it('lee voice_slots_used y voice_limit', async () => {
        stubFetch(Response.json({ voice_slots_used: 12, voice_limit: 30 }));
        expect(await huecosDeVoz('k')).toEqual({ usados: 12, limite: 30 });
    });

    it('si falla → null', async () => {
        stubFetch(new Response('x', { status: 500 }));
        expect(await huecosDeVoz('k')).toBeNull();
    });
});
```

- [ ] **Paso 2: ejecutar y ver que falla**

Run: `npx vitest run src/lib/elevenlabs-voces.test.ts`
Esperado: FAIL, "Failed to resolve import ./elevenlabs-voces".

- [ ] **Paso 3: implementación**

```ts
// src/lib/elevenlabs-voces.ts

// Voces a medida en ElevenLabs: diseñar (3 muestras), crear la elegida,
// borrar y consultar huecos. Docs: /docs/api-reference/text-to-voice/*.

const BASE = 'https://api.elevenlabs.io/v1';

export class ErrorElevenLabs extends Error {
    constructor(public status: number, public detalle: string) {
        super(`elevenlabs_${status}`);
        this.name = 'ErrorElevenLabs';
    }
}

export interface Muestra {
    generatedVoiceId: string;
    audioBase64: string;
}

async function pedir(key: string, ruta: string, init: RequestInit): Promise<Response> {
    const r = await fetch(BASE + ruta, {
        ...init,
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    });
    if (!r.ok) throw new ErrorElevenLabs(r.status, (await r.text()).slice(0, 300));
    return r;
}

export async function disenarVoz(key: string, descripcion: string, texto: string): Promise<Muestra[]> {
    const r = await pedir(key, '/text-to-voice/design', {
        method: 'POST',
        body: JSON.stringify({ voice_description: descripcion, text: texto, model_id: 'eleven_multilingual_ttv_v2' }),
    });
    const d = await r.json();
    const previews: Array<Record<string, unknown>> = Array.isArray(d?.previews) ? d.previews : [];
    return previews
        .map(p => ({ generatedVoiceId: String(p.generated_voice_id ?? ''), audioBase64: String(p.audio_base_64 ?? '') }))
        .filter(m => m.generatedVoiceId && m.audioBase64)
        .slice(0, 3);
}

export async function crearVoz(key: string, o: { nombre: string; descripcion: string; generatedVoiceId: string }): Promise<string> {
    const r = await pedir(key, '/text-to-voice', {
        method: 'POST',
        body: JSON.stringify({
            voice_name: o.nombre,
            voice_description: o.descripcion,
            generated_voice_id: o.generatedVoiceId,
            labels: { origen: 'sceneme' },
        }),
    });
    const d = await r.json();
    if (!d?.voice_id) throw new ErrorElevenLabs(502, 'respuesta sin voice_id');
    return String(d.voice_id);
}

export async function borrarVoz(key: string, voiceId: string): Promise<void> {
    await pedir(key, `/voices/${encodeURIComponent(voiceId)}`, { method: 'DELETE' });
}

export async function huecosDeVoz(key: string): Promise<{ usados: number; limite: number } | null> {
    try {
        const d = await (await pedir(key, '/user/subscription', { method: 'GET' })).json();
        const usados = Number(d?.voice_slots_used);
        const limite = Number(d?.voice_limit);
        return Number.isFinite(usados) && Number.isFinite(limite) ? { usados, limite } : null;
    } catch {
        return null;
    }
}
```

- [ ] **Paso 4: ejecutar y ver que pasa**

Run: `npx vitest run src/lib/elevenlabs-voces.test.ts`
Esperado: PASS (8 tests).

- [ ] **Paso 5: comprobar el formato real (una sola llamada, con la clave de ElevenLabs)**

La documentación no detalla los campos dentro de `previews`. Confirmarlo:

```bash
curl -s https://api.elevenlabs.io/v1/text-to-voice/design \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
  -d '{"voice_description":"Voz de mujer. Anciana andaluza, voz rota. Habla español de España con acento castellano.","text":"Hola, soy tu compañero de escena. Vamos a ensayar juntos esta escena, línea a línea, hasta que te la sepas de memoria. ¿Empezamos?"}' \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print(list(d.keys())); print([sorted(p.keys()) for p in d.get("previews",[])][:1])'
```

Esperado: `previews` con `generated_voice_id` y `audio_base_64`. Si el campo de audio se llama distinto, cambiarlo en `disenarVoz` y en el test, y volver a pasar el Paso 4. La descripción va en español: si las muestras no suenan en español de España, traducir la descripción al inglés en `descripcionParaElevenLabs` (y su test).

Créditos que gasta diseñar: antes y después de la llamada, mirar `character_count` con
`curl -s https://api.elevenlabs.io/v1/user/subscription -H "xi-api-key: $ELEVENLABS_API_KEY" | python3 -c 'import json,sys; print(json.load(sys.stdin)["character_count"])'`.
Si la diferencia no es ≈ `TEXTO_MUESTRA.length × 3`, ajustar el `* 3` de `/api/tts/disenar` (Tarea 10) a lo medido.

- [ ] **Paso 6: commit**

```bash
git add src/lib/elevenlabs-voces.ts src/lib/elevenlabs-voces.test.ts
git commit -m "feat: cliente de voces a medida de ElevenLabs"
```

---

### Tarea 10: rutas de "describir voz" y "mis voces"

**Ficheros:**
- Crear: `src/lib/voces-disenadas-firestore.ts`
- Crear: `src/app/api/tts/disenar/route.ts`
- Crear: `src/app/api/tts/disenar/guardar/route.ts`
- Crear: `src/app/api/tts/mis-voces/route.ts`

**Interfaces:**
- Consume: `obtenerAdmin` (T1), `uidDeLaPeticion` (T4), `consumirCaracteres`/`registroFirestore`/`limiteDiario`/`LimiteSuperado` (T3), `ELEVENLABS_VOICES` (T7), todo lo de T8 y T9.
- Produce (HTTP, todas con `Authorization: Bearer <token>`):
  - `POST /api/tts/disenar` `{ descripcion, genero }` → `200 { muestras: Muestra[] }` | 400 `descripcion_invalida` | 401 | 429 | 502
  - `POST /api/tts/disenar/guardar` `{ generatedVoiceId, descripcion, genero }` → `200 { voz: SpeechVoice }` | 409 `{ error: 'maximo_propias', voces: VozDisenada[] }` | 409 `sin_huecos` | 401 | 502
  - `GET /api/tts/mis-voces` → `200 { voces: SpeechVoice[] }` (y marca `ultimoUso`)
  - `DELETE /api/tts/mis-voces?voiceId=…` → `200 { ok: true }` | 404

Estas rutas solo pegan piezas ya probadas (T3, T8, T9); se comprueban con tipos y a mano (Paso 5).

- [ ] **Paso 1: acceso a Firestore**

```ts
// src/lib/voces-disenadas-firestore.ts
import { Timestamp, type DocumentData, type Firestore } from 'firebase-admin/firestore';
import type { VozDisenada } from './voces-disenadas';

// Registro de las voces a medida: voces_disenadas/<voiceId>. Solo lo toca el
// servidor (firebase-admin); las reglas de Firestore no dan acceso al cliente.

const COL = 'voces_disenadas';

function aVoz(id: string, d: DocumentData): VozDisenada {
    return {
        voiceId: id,
        uid: String(d.uid ?? ''),
        descripcion: String(d.descripcion ?? ''),
        genero: d.genero === 'm' ? 'm' : 'f',
        creada: d.creada?.toMillis?.() ?? 0,
        ultimoUso: d.ultimoUso?.toMillis?.() ?? 0,
    };
}

export async function vocesDe(db: Firestore, uid: string): Promise<VozDisenada[]> {
    const s = await db.collection(COL).where('uid', '==', uid).get();
    return s.docs.map(x => aVoz(x.id, x.data()));
}

export async function todasLasVoces(db: Firestore): Promise<VozDisenada[]> {
    const s = await db.collection(COL).get();
    return s.docs.map(x => aVoz(x.id, x.data()));
}

export async function registrarVoz(db: Firestore, v: Pick<VozDisenada, 'voiceId' | 'uid' | 'descripcion' | 'genero'>): Promise<void> {
    const ahora = Timestamp.now();
    await db.collection(COL).doc(v.voiceId).set({ uid: v.uid, descripcion: v.descripcion, genero: v.genero, creada: ahora, ultimoUso: ahora });
}

export async function olvidarVoz(db: Firestore, voiceId: string): Promise<void> {
    await db.collection(COL).doc(voiceId).delete();
}

export async function marcarUso(db: Firestore, voces: VozDisenada[]): Promise<void> {
    if (!voces.length) return;
    const lote = db.batch();
    const ahora = Timestamp.now();
    for (const v of voces) lote.update(db.collection(COL).doc(v.voiceId), { ultimoUso: ahora });
    await lote.commit();
}
```

- [ ] **Paso 2: `POST /api/tts/disenar`**

```ts
// src/app/api/tts/disenar/route.ts
import { obtenerAdmin } from '@/lib/firebase-admin';
import { uidDeLaPeticion } from '@/lib/tts-auth';
import { consumirCaracteres, limiteDiario, LimiteSuperado, registroFirestore } from '@/lib/tts-limite';
import { descripcionParaElevenLabs, descripcionValida, TEXTO_MUESTRA } from '@/lib/voces-disenadas';
import { disenarVoz, ErrorElevenLabs } from '@/lib/elevenlabs-voces';

// "Describir voz": 3 muestras de ElevenLabs a partir de una descripción.
// Generarlas gasta créditos, así que cuenta para el límite diario.

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const fb = obtenerAdmin();
    if (!fb) return Response.json({ error: 'sin_firebase' }, { status: 503 });
    const uid = await uidDeLaPeticion(req, t => fb.auth().verifyIdToken(t));
    if (!uid) return Response.json({ error: 'login_requerido' }, { status: 401 });
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return Response.json({ error: 'no_key', message: 'Falta ELEVENLABS_API_KEY' }, { status: 503 });

    let body: any;
    try { body = await req.json(); } catch { return Response.json({ error: 'bad_request' }, { status: 400 }); }
    const descripcion = String(body?.descripcion ?? '');
    const genero: 'f' | 'm' = body?.genero === 'm' ? 'm' : 'f';
    if (!descripcionValida(descripcion)) {
        return Response.json({ error: 'descripcion_invalida', message: 'Describe la voz en 10 a 900 caracteres.' }, { status: 400 });
    }

    try {
        await consumirCaracteres(registroFirestore(fb.firestore()), uid, TEXTO_MUESTRA.length * 3, limiteDiario());
    } catch (e) {
        if (e instanceof LimiteSuperado) return Response.json({ error: 'limite_diario', restante: 0 }, { status: 429 });
        console.warn('[tts/disenar] no se pudo apuntar el uso:', e);
    }

    try {
        const muestras = await disenarVoz(key, descripcionParaElevenLabs(descripcion, genero), TEXTO_MUESTRA);
        if (!muestras.length) return Response.json({ error: 'sin_muestras' }, { status: 502 });
        return Response.json({ muestras });
    } catch (e) {
        const detalle = e instanceof ErrorElevenLabs ? `${e.status} ${e.detalle}` : String(e);
        console.warn('[tts/disenar] ElevenLabs falló:', detalle);
        return Response.json({ error: 'elevenlabs_error', detail: detalle }, { status: 502 });
    }
}
```

- [ ] **Paso 3: `POST /api/tts/disenar/guardar`**

```ts
// src/app/api/tts/disenar/guardar/route.ts
import { obtenerAdmin } from '@/lib/firebase-admin';
import { uidDeLaPeticion } from '@/lib/tts-auth';
import { ELEVENLABS_VOICES } from '@/lib/voces-catalogo';
import {
    descripcionParaElevenLabs, descripcionValida, elegirVozALiberar, etiquetaDeVoz,
    hayHueco, huecosDeRespaldo, maximoPorUsuario, puedeCrearOtra,
} from '@/lib/voces-disenadas';
import { olvidarVoz, registrarVoz, todasLasVoces, vocesDe } from '@/lib/voces-disenadas-firestore';
import { borrarVoz, crearVoz, ErrorElevenLabs, huecosDeVoz } from '@/lib/elevenlabs-voces';

// Guarda la muestra elegida como voz de la cuenta de ElevenLabs. Si no quedan
// huecos, libera la voz a medida que lleve más tiempo sin usarse (nunca una
// del catálogo).

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const fb = obtenerAdmin();
    if (!fb) return Response.json({ error: 'sin_firebase' }, { status: 503 });
    const uid = await uidDeLaPeticion(req, t => fb.auth().verifyIdToken(t));
    if (!uid) return Response.json({ error: 'login_requerido' }, { status: 401 });
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return Response.json({ error: 'no_key', message: 'Falta ELEVENLABS_API_KEY' }, { status: 503 });

    let body: any;
    try { body = await req.json(); } catch { return Response.json({ error: 'bad_request' }, { status: 400 }); }
    const generatedVoiceId = String(body?.generatedVoiceId ?? '');
    const descripcion = String(body?.descripcion ?? '');
    const genero: 'f' | 'm' = body?.genero === 'm' ? 'm' : 'f';
    if (!generatedVoiceId || !descripcionValida(descripcion)) return Response.json({ error: 'bad_request' }, { status: 400 });

    const db = fb.firestore();
    const propias = await vocesDe(db, uid);
    if (!puedeCrearOtra(propias.length, maximoPorUsuario())) {
        return Response.json({ error: 'maximo_propias', voces: propias }, { status: 409 });
    }

    try {
        const todas = await todasLasVoces(db);
        const huecos = (await huecosDeVoz(key)) ?? { usados: todas.length + ELEVENLABS_VOICES.length, limite: huecosDeRespaldo() };
        if (!hayHueco(huecos.usados, huecos.limite)) {
            const liberar = elegirVozALiberar(todas, new Set(ELEVENLABS_VOICES.map(v => v.id)));
            if (!liberar) {
                return Response.json({ error: 'sin_huecos', message: 'Ahora no se pueden crear voces, usa el catálogo.' }, { status: 409 });
            }
            await borrarVoz(key, liberar.voiceId);
            await olvidarVoz(db, liberar.voiceId);
        }

        const voiceId = await crearVoz(key, {
            nombre: `SceneMe ${uid.slice(0, 6)} ${Date.now()}`,
            descripcion: descripcionParaElevenLabs(descripcion, genero),
            generatedVoiceId,
        });
        await registrarVoz(db, { voiceId, uid, descripcion, genero });
        return Response.json({ voz: { id: voiceId, label: etiquetaDeVoz(descripcion, genero), lang: 'multi' } });
    } catch (e) {
        const detalle = e instanceof ErrorElevenLabs ? `${e.status} ${e.detalle}` : String(e);
        console.warn('[tts/disenar/guardar] falló:', detalle);
        return Response.json({ error: 'elevenlabs_error', detail: detalle }, { status: 502 });
    }
}
```

- [ ] **Paso 4: `GET` y `DELETE /api/tts/mis-voces`**

```ts
// src/app/api/tts/mis-voces/route.ts
import { obtenerAdmin } from '@/lib/firebase-admin';
import { uidDeLaPeticion } from '@/lib/tts-auth';
import { etiquetaDeVoz } from '@/lib/voces-disenadas';
import { marcarUso, olvidarVoz, vocesDe } from '@/lib/voces-disenadas-firestore';
import { borrarVoz } from '@/lib/elevenlabs-voces';

// Las voces a medida del usuario. Abrir el ensayo (GET) cuenta como "uso":
// así las que se usan no son las primeras en liberarse.

export const runtime = 'nodejs';

export async function GET(req: Request) {
    const fb = obtenerAdmin();
    if (!fb) return Response.json({ voces: [] });
    const uid = await uidDeLaPeticion(req, t => fb.auth().verifyIdToken(t));
    if (!uid) return Response.json({ error: 'login_requerido' }, { status: 401 });

    const db = fb.firestore();
    const propias = await vocesDe(db, uid);
    await marcarUso(db, propias).catch(e => console.warn('[tts/mis-voces] no se pudo marcar el uso:', e));
    return Response.json({ voces: propias.map(v => ({ id: v.voiceId, label: etiquetaDeVoz(v.descripcion, v.genero), lang: 'multi' })) });
}

export async function DELETE(req: Request) {
    const fb = obtenerAdmin();
    if (!fb) return Response.json({ error: 'sin_firebase' }, { status: 503 });
    const uid = await uidDeLaPeticion(req, t => fb.auth().verifyIdToken(t));
    if (!uid) return Response.json({ error: 'login_requerido' }, { status: 401 });
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return Response.json({ error: 'no_key' }, { status: 503 });

    const voiceId = new URL(req.url).searchParams.get('voiceId') ?? '';
    const db = fb.firestore();
    const propia = (await vocesDe(db, uid)).find(v => v.voiceId === voiceId);
    if (!propia) return Response.json({ error: 'no_existe' }, { status: 404 });

    try {
        await borrarVoz(key, voiceId);
    } catch (e) {
        console.warn('[tts/mis-voces] ElevenLabs no la borró (se olvida igual):', e);
    }
    await olvidarVoz(db, voiceId);
    return Response.json({ ok: true });
}
```

- [ ] **Paso 5: tipos, lint y prueba a mano**

Run: `npm run typecheck && npm run lint && npm test`
Esperado: verde.

A mano (con `npm run dev`, sesión iniciada y `ELEVENLABS_API_KEY` en `.env.local`): en la pestaña Red del navegador, copiar el valor de la cabecera `Authorization` de cualquier llamada a `/api/tts` (sin el "Bearer ") y:

```bash
TOKEN=...   # el ID token copiado
curl -s -X POST localhost:9002/api/tts/disenar -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"descripcion":"anciana andaluza, voz rota","genero":"f"}' | python3 -c 'import json,sys; d=json.load(sys.stdin); print([m["generatedVoiceId"] for m in d.get("muestras",[])] or d)'
curl -s localhost:9002/api/tts/mis-voces -H "Authorization: Bearer $TOKEN"
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:9002/api/tts/disenar -H 'Content-Type: application/json' -d '{"descripcion":"anciana andaluza","genero":"f"}'
```

Esperado: 3 `generatedVoiceId`; `{"voces":[]}`; `401` sin token.

- [ ] **Paso 6: commit**

```bash
git add src/lib/voces-disenadas-firestore.ts src/app/api/tts/disenar/route.ts src/app/api/tts/disenar/guardar/route.ts src/app/api/tts/mis-voces/route.ts
git commit -m "feat: rutas para describir voz, guardarla y gestionar mis voces"
```

---

### Tarea 11: botón y panel "Describir voz" en el ensayo

**Ficheros:**
- Crear: `src/components/studio/DescribirVoz.tsx`
- Modificar: `src/components/studio/RehearsalPlayer.tsx` (`RehearsalPlayer`, `Config`, `VoiceEditor`)

**Interfaces:**
- Consume: `cabecerasTts`, `obtenerTokenSesion` (T6); rutas de T10; `ELEVENLABS_VOICES` (T7, vía `@/lib/speech`).
- Produce: `<DescribirVoz personaje generoInicial onElegida onCerrar />`.

- [ ] **Paso 1: el panel**

```tsx
// src/components/studio/DescribirVoz.tsx
'use client';

import React, { useState } from 'react';
import type { SpeechVoice } from '@/lib/speech';
import { cabecerasTts, obtenerTokenSesion } from '@/lib/tts-cliente';

// Panel de "describir voz": el actor escribe cómo es la voz, escucha 3
// muestras de ElevenLabs y se queda con una para el personaje.

interface Muestra { generatedVoiceId: string; audioBase64: string }

const MENSAJES: Record<string, string> = {
    login_requerido: 'Inicia sesión para describir voces.',
    limite_diario: 'Has llegado al límite de voz IA de hoy.',
    descripcion_invalida: 'Describe la voz en 10 a 900 caracteres.',
    sin_huecos: 'Ahora no se pueden crear voces. Usa una del catálogo.',
    maximo_propias: 'Ya tienes el máximo de voces propias. Borra una para crear otra.',
};

async function pedir(url: string, init: RequestInit): Promise<{ ok: boolean; datos: any }> {
    const r = await fetch(url, { ...init, headers: await cabecerasTts(obtenerTokenSesion) });
    const datos = await r.json().catch(() => ({}));
    return { ok: r.ok, datos };
}

export function DescribirVoz({ personaje, generoInicial, onElegida, onCerrar }: {
    personaje: string;
    generoInicial: 'f' | 'm' | null;
    onElegida: (v: SpeechVoice) => void;
    onCerrar: () => void;
}) {
    const [descripcion, setDescripcion] = useState('');
    const [genero, setGenero] = useState<'f' | 'm'>(generoInicial ?? 'f');
    const [muestras, setMuestras] = useState<Muestra[]>([]);
    const [propias, setPropias] = useState<{ voiceId: string; descripcion: string }[]>([]);
    const [ocupado, setOcupado] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fallo = (d: any) => setError(MENSAJES[d?.error] ?? d?.message ?? 'No se pudo. Prueba otra vez en un momento.');

    const conEspera = async (fn: () => Promise<void>) => {
        setOcupado(true);
        setError(null);
        try { await fn(); } catch { setError('Sin conexión. Prueba otra vez.'); } finally { setOcupado(false); }
    };

    const generar = () => conEspera(async () => {
        setMuestras([]);
        const r = await pedir('/api/tts/disenar', { method: 'POST', body: JSON.stringify({ descripcion, genero }) });
        if (r.ok) setMuestras(r.datos.muestras ?? []); else fallo(r.datos);
    });

    const usar = (m: Muestra) => conEspera(async () => {
        const r = await pedir('/api/tts/disenar/guardar', {
            method: 'POST',
            body: JSON.stringify({ generatedVoiceId: m.generatedVoiceId, descripcion, genero }),
        });
        if (r.ok) { onElegida(r.datos.voz); return; }
        if (r.datos?.error === 'maximo_propias') setPropias(r.datos.voces ?? []);
        fallo(r.datos);
    });

    const borrar = (voiceId: string) => conEspera(async () => {
        const r = await pedir(`/api/tts/mis-voces?voiceId=${encodeURIComponent(voiceId)}`, { method: 'DELETE' });
        if (r.ok) setPropias(p => p.filter(v => v.voiceId !== voiceId)); else fallo(r.datos);
    });

    return (
        <div role="dialog" aria-label={`Describir la voz de ${personaje}`} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
            <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-5 text-zinc-100">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black uppercase tracking-widest text-amber-300">Voz de {personaje}</p>
                    <button onClick={onCerrar} className="text-xs font-bold text-zinc-300 hover:text-white">Cerrar</button>
                </div>

                <label className="mt-4 block text-xs uppercase tracking-wide text-zinc-300">¿Cómo es su voz?</label>
                <textarea
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Ej.: anciana andaluza, voz rota, habla despacio"
                    className="mt-1 h-20 w-full resize-y rounded-lg border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                />

                <div className="mt-3 flex gap-2">
                    {(['f', 'm'] as const).map(g => (
                        <button key={g} onClick={() => setGenero(g)}
                            className={`rounded-full px-3 py-1 text-xs font-bold ${genero === g ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}>
                            {g === 'f' ? 'Mujer' : 'Hombre'}
                        </button>
                    ))}
                </div>

                <button onClick={generar} disabled={ocupado}
                    className="mt-4 w-full rounded-full bg-amber-500 py-2.5 text-sm font-black text-black hover:bg-amber-400 disabled:opacity-60">
                    {ocupado ? 'Un momento…' : 'Crear 3 muestras'}
                </button>

                {error && <p role="alert" className="mt-3 text-sm text-amber-200">{error}</p>}

                {propias.length > 0 && (
                    <ul className="mt-3 space-y-2">
                        {propias.map(v => (
                            <li key={v.voiceId} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100">
                                <span className="truncate">{v.descripcion}</span>
                                <button onClick={() => borrar(v.voiceId)} disabled={ocupado} className="shrink-0 text-xs font-bold text-amber-300 hover:text-amber-200">Borrar</button>
                            </li>
                        ))}
                    </ul>
                )}

                {muestras.length > 0 && (
                    <ul className="mt-4 space-y-3">
                        {muestras.map((m, i) => (
                            <li key={m.generatedVoiceId} className="rounded-lg border border-zinc-700 p-3">
                                <p className="mb-2 text-xs font-bold text-zinc-200">Muestra {i + 1}</p>
                                <audio controls src={`data:audio/mpeg;base64,${m.audioBase64}`} className="w-full" />
                                <button onClick={() => usar(m)} disabled={ocupado}
                                    className="mt-2 rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-100 hover:bg-amber-500 hover:text-black disabled:opacity-60">
                                    Usar esta voz
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Paso 2: `RehearsalPlayer` carga "mis voces" y las suma al catálogo**

Ampliar el import de `@/lib/tts-cliente` añadido en la Tarea 6 para que quede así, y añadir el del panel:

```ts
import { alAvisoTts, cabecerasTts, obtenerTokenSesion, TEXTO_AVISO } from '@/lib/tts-cliente';
import { DescribirVoz } from '@/components/studio/DescribirVoz';
```

En `RehearsalPlayer`, junto al resto de `useState`:

```ts
    /** Voces a medida del usuario (ElevenLabs); se suman al catálogo. */
    const [misVoces, setMisVoces] = useState<SpeechVoice[]>([]);
    const vocesEleven = useMemo(() => [...ELEVENLABS_VOICES, ...(uid ? misVoces : [])], [misVoces, uid]);
```

Cambiar la selección de voces:

```ts
    const voices = engine === 'ai' ? OPENAI_TTS_VOICES
        : engine === 'eleven' ? vocesEleven
        : engine === 'cartesia' ? cartesiaVoices
        : browserVoices;
```

Junto al efecto que carga las voces de Cartesia:

```ts
    // Carga las voces a medida al elegir ElevenLabs (y cuenta como "uso").
    useEffect(() => {
        if (engine !== 'eleven' || !uid) return;
        let cancelled = false;
        (async () => {
            try {
                const r = await fetch('/api/tts/mis-voces', { headers: await cabecerasTts(obtenerTokenSesion) });
                const d = await r.json();
                if (!cancelled) setMisVoces(Array.isArray(d?.voces) ? d.voces : []);
            } catch {
                if (!cancelled) setMisVoces([]);
            }
        })();
        return () => { cancelled = true; };
    }, [engine, uid]);
```

En el `<Config … />` del `return`, añadir dos props:

```tsx
                        conSesion={Boolean(uid)}
                        onVozNueva={v => setMisVoces(prev => [...prev, v])}
```

- [ ] **Paso 3: `Config` abre el panel**

En el tipo de props de `Config`, añadir:

```ts
    conSesion: boolean;
    onVozNueva: (v: SpeechVoice) => void;
```

y añadir `conSesion, onVozNueva` a la desestructuración de `props`. Después de `const update = …`:

```ts
    /** Personaje cuya voz se está describiendo (panel abierto). */
    const [describiendo, setDescribiendo] = useState<string | null>(null);
```

En el `<VoiceEditor … />` del mapa de `ordenVisible`, añadir:

```tsx
                                        onDescribir={engine === 'eleven' && conSesion ? () => setDescribiendo(s) : undefined}
```

Y justo antes del `<button onClick={() => { unlockAudio(); onStart(); }} …>` de EMPEZAR:

```tsx
            {describiendo && (
                <DescribirVoz
                    personaje={describiendo === NARRADOR ? 'el narrador' : describiendo}
                    generoInicial={describiendo === NARRADOR ? null : generoDeNombre(describiendo)}
                    onCerrar={() => setDescribiendo(null)}
                    onElegida={v => {
                        onVozNueva(v);
                        update(describiendo, { ...(profiles[describiendo] ?? DEFAULT_PROFILE), voiceId: v.id });
                        setDescribiendo(null);
                    }}
                />
            )}
```

- [ ] **Paso 4: botón en `VoiceEditor`**

En el tipo de props de `VoiceEditor` añadir `onDescribir?: () => void;` y añadirlo a la desestructuración. Dentro de `<div className="flex shrink-0 gap-1.5">`, antes del botón "▶ Probar":

```tsx
                    {onDescribir && (
                        <button
                            onClick={onDescribir}
                            title={`Crear una voz a medida para ${speaker}`}
                            className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-200 transition hover:bg-amber-500 hover:text-black"
                        >
                            ✨ Describir voz
                        </button>
                    )}
```

- [ ] **Paso 5: tipos, lint, tests**

Run: `npm run typecheck && npm run lint && npm test`
Esperado: verde.

- [ ] **Paso 6: prueba en el navegador**

Con `npm run dev`, sesión iniciada, motor "Voz IA Pro (ElevenLabs)":
1. Cada personaje (no el tuyo) muestra "✨ Describir voz"; sin sesión no aparece.
2. Describir "anciana andaluza, voz rota" → 3 muestras que suenan → "Usar esta voz" → el selector del personaje muestra la voz nueva "(femenina, tuya)" y "▶ Probar" suena con ella.
3. Crear una segunda y una tercera voz: la tercera muestra "Ya tienes el máximo…" con la lista para borrar; borrar una y repetir funciona.
4. Recargar: las voces propias siguen en el selector.
5. Legibilidad: mirar el panel en claro y oscuro, en móvil (375 px) y escritorio. Texto zinc-100/amber-200 sobre zinc-900 ≥ 4,5:1.

- [ ] **Paso 7: commit**

```bash
git add src/components/studio/DescribirVoz.tsx src/components/studio/RehearsalPlayer.tsx
git commit -m "feat: describir voz por personaje en el ensayo"
```

---

### Tarea 12: configuración y despliegue

**Ficheros:** ninguno de código (configuración en Vercel y Google Cloud).

- [ ] **Paso 1: variables en Vercel (producción y preview)**

```bash
vercel env add TTS_LIMITE_DIARIO production
vercel env add VOCES_PROPIAS_POR_USUARIO production
vercel env add ELEVENLABS_VOICE_SLOTS production
```

Valores: `5000`, `2`, `30`. Repetir con `preview`. Comprobar que existen `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` y `ELEVENLABS_API_KEY`: `vercel env ls`.

- [ ] **Paso 2: permisos de la cuenta de servicio**

En Google Cloud Console → IAM, la cuenta `GOOGLE_SERVICE_ACCOUNT_EMAIL` necesita los roles "Storage Object Admin" (bucket de Firebase) y "Cloud Datastore User" (Firestore). Sin ellos, la caché falla en silencio (aviso en el log) y el límite no se apunta.

- [ ] **Paso 3: borrado automático a los 90 días**

```bash
gcloud storage buckets describe "gs://$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" --format="value(lifecycle_config)"
```

Si no sale nada (sin reglas previas):

```bash
printf '%s' '{"rule":[{"action":{"type":"Delete"},"condition":{"age":90,"matchesPrefix":["tts-cache/"]}}]}' > lifecycle-tts.json
gcloud storage buckets update "gs://$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" --lifecycle-file=lifecycle-tts.json
gcloud storage buckets describe "gs://$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" --format="value(lifecycle_config)"
rm lifecycle-tts.json
```

Esperado: la regla con `age: 90` y el prefijo `tts-cache/`. Si ya había reglas, añadir esta regla a la lista existente en el JSON en vez de sustituirlas.

- [ ] **Paso 4: reglas de Storage**

En Firebase Console → Storage → Reglas: comprobar que ninguna regla da lectura pública a `tts-cache/` (por ejemplo, un `match /{allPaths=**} { allow read: if true; }`). Si la hay, añadir delante:

```
match /tts-cache/{todo=**} {
  allow read, write: if false;
}
```

- [ ] **Paso 5: verificación final antes de desplegar**

Run: `npm test && npm run typecheck && npm run lint && npm run build`
Esperado: todo en verde.

- [ ] **Paso 6: verificación en producción (tras desplegar)**

1. Sin sesión: `curl -s -o /dev/null -w '%{http_code}\n' -X POST https://www.scenemeapp.com/api/tts -H 'Content-Type: application/json' -d '{"provider":"elevenlabs","text":"hola"}'` → `401`.
2. Con sesión: ensayar una escena, recargar y repetirla. En Vercel → Logs, las réplicas repetidas salen `[tts] elevenlabs 200 cache=hit`.
3. Tras 2 semanas: contar `cache=hit` frente al total de `[tts]` para medir el ahorro real.
