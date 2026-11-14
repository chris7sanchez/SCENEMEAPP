# Voces del ensayo: ElevenLabs + audios guardados + describir voz — Diseño / Spec

Fecha: 2026-10-11
Estado: PROPUESTO (esperando aprobación antes de implementar — HARD GATE)
Método: superpowers (brainstorm → spec → aprobación → plan → TDD)

## 1. Problema

El ensayo con réplicas usa voces IA de pago (ElevenLabs, OpenAI, Cartesia) a
través de `src/app/api/tts/route.ts`. Hoy:

- **`/api/tts` no tiene ninguna protección.** Sin login ni límite: cualquiera
  que conozca la URL puede pedir audio de ElevenLabs y gastar créditos.
- Cada frase se paga cada vez que se pide desde una sesión nueva. El reproductor
  ya guarda en memoria lo pedido en el mismo ensayo (`src/lib/speech.ts`,
  `AiSpeechProvider.cache`), pero al recargar, volver otro día, o cuando varios
  actores ensayan la misma separata, se vuelve a pagar.
- El catálogo de ElevenLabs (`ELEVENLABS_VOICES`) son 9 voces nativas en inglés
  que hablan español; pueden sonar con acento extranjero.
- No hay forma de pedir una voz concreta ("anciana andaluza, voz rota").

Se descartó sustituir ElevenLabs por VoiceStudio/OmniVoice: los pesos de
OmniVoice son CC-BY-NC (no comercial) y además exigiría un servidor con GPU
encendido 24/7. Tampoco se usa un modelo abierto alojado (Qwen3-TTS en fal
cuesta 0,07–0,09 $/1.000 car., casi lo mismo que ElevenLabs).

## 2. Objetivos

1. Proteger `/api/tts`: los motores de pago exigen sesión iniciada y tienen un
   límite diario por usuario.
2. Guardar en el servidor cada audio generado y reutilizarlo: misma frase +
   misma voz + mismos ajustes = no se paga otra vez.
3. Catálogo principal de ElevenLabs con 10 voces de España (5 femeninas,
   5 masculinas, edades variadas).
4. "Describir voz": el actor describe una voz, escucha 3 muestras, elige una y
   queda guardada para sus personajes.
5. Las voces grabadas (`src/lib/voces-grabadas.ts`) y la voz del navegador
   (gratis) siguen exactamente igual.

## 3. No-objetivos

- VoiceStudio, Kokoro, Piper o cualquier modelo propio en producción.
- Servidores GPU propios.
- Cobro / plan Pro (el límite diario es igual para todos los usuarios con sesión).
- Pasar la emoción o la velocidad del reproductor a los ajustes de ElevenLabs.
- Cambiar los motores OpenAI y Cartesia más allá de la protección y la caché.

## 4. Decisiones tomadas (con Christian, 2026-10-11)

| Tema | Decisión |
|---|---|
| Motor principal | ElevenLabs (calidad conocida) |
| Opción gratis | Se queda la voz del navegador actual |
| Voces grabadas | Intactas |
| Caché | Firebase Storage, todos los motores, borrado a los 90 días |
| Límite | 5.000 caracteres/día por usuario en motores de pago |
| Plan ElevenLabs | Aún sin contratar; se diseña para Creator (30 huecos de voz) |
| Voces propias | Máximo 2 por usuario |

## 5. Arquitectura

```
Reproductor (RehearsalPlayer / AiSpeechProvider)
   │  Authorization: Bearer <Firebase ID token>
   ▼
POST /api/tts ──► auth (firebase-admin) ──► caché (Storage) ──hit──► MP3
                        │                        │miss
                        │                        ▼
                        └──► límite diario (Firestore) ──► proveedor ──► guardar ──► MP3

POST /api/tts/disenar          → 3 muestras (ElevenLabs text-to-voice/design)
POST /api/tts/disenar/guardar  → crea la voz (text-to-voice), gestiona huecos
GET  /api/tts/mis-voces        → voces propias del usuario
```

### 5.1 Ficheros

| Fichero | Qué hace | Nuevo/cambia |
|---|---|---|
| `src/lib/firebase-admin.ts` | Inicializa firebase-admin una sola vez (hoy está dentro de `api/admin/verify-password/route.ts`) y exporta `auth`, `db`, `bucket` | Nuevo (y `verify-password` pasa a usarlo) |
| `src/lib/tts-auth.ts` | `usuarioDeLaPeticion(req)`: lee el Bearer, lo verifica, devuelve `uid` o `null` | Nuevo |
| `src/lib/tts-cache.ts` | `claveDeAudio(...)` (sha256 de proveedor+modelo+voz+ajustes+texto), `leerAudio(clave)`, `guardarAudio(clave, bytes)` | Nuevo |
| `src/lib/tts-limite.ts` | `consumirCaracteres(uid, n)`: transacción en Firestore; lanza `LimiteSuperado` si pasa de `TTS_LIMITE_DIARIO` | Nuevo |
| `src/lib/voces-disenadas.ts` | Huecos de ElevenLabs: cuenta voces, elige la propia menos usada para liberar, nunca toca el catálogo | Nuevo |
| `src/app/api/tts/route.ts` | Añade auth + caché + límite antes de llamar al proveedor | Cambia |
| `src/app/api/tts/disenar/route.ts` | Pide 3 muestras a ElevenLabs | Nuevo |
| `src/app/api/tts/disenar/guardar/route.ts` | Crea la voz elegida y la registra | Nuevo |
| `src/app/api/tts/mis-voces/route.ts` | Lista las voces propias del usuario | Nuevo |
| `src/lib/speech.ts` | Envía el ID token; `ELEVENLABS_VOICES` pasa a las 10 voces de España; trata 401/429 cayendo a la voz del navegador | Cambia |
| `src/components/studio/RehearsalPlayer.tsx` | Botón "Describir voz" por personaje (solo motor ElevenLabs y con sesión), panel de 3 muestras, aviso de límite | Cambia |

### 5.2 Datos

Firebase Storage (privado, sin URLs públicas):

```
tts-cache/<proveedor>/<sha256>.mp3
```

Regla de ciclo de vida del bucket: borrar objetos con prefijo `tts-cache/`
a los 90 días (se configura una vez en Google Cloud Console).

Firestore:

```
tts_uso/<uid>_<AAAA-MM-DD>   { caracteres: number, actualizado: Timestamp }
voces_disenadas/<voiceId>    { uid, descripcion, genero: 'f'|'m', creada: Timestamp, ultimoUso: Timestamp }
```

`ultimoUso` se actualiza una vez por ensayo (al abrirlo), no por frase.

### 5.3 Configuración (variables de entorno en Vercel)

| Variable | Valor inicial | Para qué |
|---|---|---|
| `ELEVENLABS_API_KEY` | ya existe | — |
| `ELEVENLABS_VOICE_SLOTS` | `30` | Huecos del plan (Creator). Cambiar si se contrata otro plan |
| `TTS_LIMITE_DIARIO` | `5000` | Caracteres/día por usuario en motores de pago |
| `VOCES_PROPIAS_POR_USUARIO` | `2` | Máximo de voces descritas por usuario |
| `GOOGLE_SERVICE_ACCOUNT_*`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ya existen | firebase-admin |

## 6. Flujos

### 6.1 Pedir una frase (`POST /api/tts`)

1. Motor `browser` no pasa por aquí (sin cambios).
2. Sin token válido → `401 { error: 'login_requerido' }`.
3. Calcula la clave. Si el audio existe en Storage → lo devuelve. **No cuenta
   para el límite.**
4. Si no existe: `consumirCaracteres(uid, texto.length)`. Si se pasa →
   `429 { error: 'limite_diario', restante: 0 }`.
5. Llama al proveedor como hoy. Si va bien, guarda el MP3 en Storage y lo
   devuelve. Si guardar falla → `console.warn` y devuelve el audio igual.

### 6.2 Describir voz

1. El actor pulsa "Describir voz" en un personaje, escribe la descripción y
   elige femenina/masculina.
2. `POST /api/tts/disenar { descripcion, genero }` → el servidor añade
   "Habla español de España" a la descripción, pide las muestras con un texto
   fijo de prueba en español y devuelve `[{ generatedVoiceId, audioBase64 }]` (3).
   Cuenta la longitud del texto de prueba × 3 para el límite.
3. El actor escucha y elige una → `POST /api/tts/disenar/guardar`.
4. El servidor comprueba: el usuario tiene < `VOCES_PROPIAS_POR_USUARIO` voces.
   Si los huecos de ElevenLabs están llenos, borra la voz propia (de cualquier
   usuario) con `ultimoUso` más antiguo. Nunca borra una voz del catálogo.
5. Crea la voz, la registra en `voces_disenadas` y devuelve
   `{ voiceId, label: "<descripción> (femenina|masculina)" }` para que
   `generoDeVoz` la reconozca.
6. El personaje queda con esa voz. En otros ensayos aparece en "Mis voces".

Si la voz de un personaje ya no existe (fue liberada), el reproductor le asigna
una del catálogo del mismo género con `repartirVoces` (comportamiento actual del
reparto: solo valen voces que existen en el motor elegido). Sin aviso: el
reparto guarda voces de todos los motores y no se puede distinguir una voz
liberada de una de otro motor sin falsos avisos.

## 7. Errores

| Caso | Qué ve el actor |
|---|---|
| Sin sesión y motor de pago | Aviso "Inicia sesión para usar voces IA"; suena la voz del navegador |
| Límite diario alcanzado | Aviso "Has usado tus 5.000 caracteres de hoy"; sigue con la voz del navegador |
| Storage caído | Nada: el audio se genera sin guardar (aviso solo en el log) |
| ElevenLabs caído / sin créditos | Igual que hoy: cae a la voz del navegador |
| Sin huecos y ninguna voz propia liberable | Aviso "Ahora no se pueden crear voces, usa el catálogo" |
| Usuario con 2 voces propias | Aviso: borra una de "Mis voces" para crear otra |

## 8. Pruebas (vitest, TDD)

- `tts-cache`: la misma entrada da la misma clave; cambiar texto, voz o
  ajustes cambia la clave; con caché llena, el proveedor no se llama.
- `tts-limite`: por debajo suma; al pasar de 5.000 lanza `LimiteSuperado`;
  un día nuevo empieza de cero.
- `/api/tts`: sin token → 401; con caché → 200 sin llamar a ElevenLabs ni
  consumir límite; sobre el límite → 429.
- `voces-disenadas`: con huecos llenos elige la propia menos usada; nunca
  elige una del catálogo; respeta el máximo por usuario.
- `genero.test.ts`: las 10 voces nuevas se reparten bien por género.

Verificación manual: con sesión, ensayar una escena, recargar y ensayarla otra
vez; en el log, la segunda vez no hay llamada a ElevenLabs. Bajar
`TTS_LIMITE_DIARIO` a 50 y comprobar el aviso y la voz del navegador.

## 9. A comprobar al implementar

- Créditos que gasta ElevenLabs al generar las 3 muestras de "describir voz".
- Si la descripción funciona en español o hay que traducirla al inglés.
- Que la cuenta de servicio tenga permiso de escritura en el bucket de Storage.
- Si la API de ElevenLabs devuelve los huecos usados/totales de la suscripción;
  si es así, usarla y dejar `ELEVENLABS_VOICE_SLOTS` solo como respaldo.
- Las 10 voces del catálogo: preparo una lista corta de la biblioteca de
  ElevenLabs y Christian elige escuchándolas.

## 10. Coste orientativo

ElevenLabs Multilingual v2: 0,08–0,10 $ por 1.000 caracteres (≈ 1 min de voz).
Tope por usuario y día con el límite: 5.000 car. ≈ 0,40–0,50 $. El ahorro de la
caché depende de cuánto se repitan frases entre sesiones y actores; se medirá
con el log (aciertos de caché / peticiones) tras 2 semanas de uso.
