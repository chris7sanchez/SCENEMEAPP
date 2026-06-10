# Modo Ensayo con Réplicas (Scene Partner) — Diseño / Spec

Fecha: 2026-06-10
Estado: PROPUESTO (esperando aprobación antes de implementar — HARD GATE)
Método: superpowers (brainstorm → spec → aprobación → TDD)

## 1. Problema

Un actor que prepara una escena necesita ensayar SUS líneas en contexto: para
decir bien su frase necesita oír la frase anterior del otro personaje (la
"réplica" / cue line). Hoy depende de un compañero que le lea el otro papel, o
de grabarse a sí mismo. Es lento y depende de otra persona.

Queremos que la app actúe de compañero de reparto: lee en voz alta las líneas
del OTRO personaje, se calla en las del actor y espera, y avanza cuando el actor
termina. Es el "killer feature" diferencial — algo de uso diario.

## 2. Objetivos (MVP)

- Reutilizar el guion que el actor ya pega/sube en Alchemistery (EL CUERPO).
- Parsear el guion en una secuencia ORDENADA de turnos (personaje → línea).
- El actor elige cuál personaje es el SUYO; el resto son "réplicas".
- Reproductor de ensayo:
  - Turno de réplica → TTS lee la línea y la resalta; al terminar, avanza.
  - Turno del actor → pausa, muestra su línea según el modo elegido, espera.
  - Avance: por TOQUE (botón / barra espaciadora) por defecto; detección de voz
    como modo avanzado opcional.
  - Controles: play/pausa, repetir línea, reiniciar, anterior/siguiente, velocidad.
- 3 modos de visualización de las líneas PROPIAS:
  - Texto completo.
  - Solo pie de entrada (cue): primeras ~3 palabras de tu línea como recordatorio.
  - Oculto (para memorizar).
- Voz: empezar con TTS del navegador (Web Speech API), gratis y sin clave.
  Arquitectura con adaptador para enchufar voz IA después SIN reescribir.

## 3. No-objetivos (fuera del MVP)

- Voz IA realista (ElevenLabs/Google TTS) — solo dejar el adaptador listo.
- Grabar/evaluar la actuación del actor (scoring, feedback de dicción).
- Multi-escena / biblioteca de escenas guardadas en la nube.
- Sincronización fina por reconocimiento de palabra exacta (el modo voz solo
  detecta fin de habla, no corrige el texto dicho).
- Integración con la "ficha progresiva" (se diseña aparte; aquí solo dejamos el
  hook de "personajes ensayados").

## 4. Diseño de la experiencia

Punto de entrada: en EL CUERPO, una vez detectados los personajes (ya existe esa
detección), aparece un botón **"ENSAYAR ESCENA"**. Abre un overlay a pantalla
completa (no un 5º tab, para no recargar la barra de navegación).

Flujo del overlay:
1. **Configuración** (1 pantalla):
   - "¿Cuál es tu personaje?" → lista de personajes detectados (chips).
   - Modo de tus líneas: Completo / Pie de entrada / Oculto.
   - Avance: Toque (def.) / Voz.
   - Velocidad de lectura (0.8x–1.4x).
   - Botón "EMPEZAR".
2. **Ensayo** (reproductor):
   - Muestra la línea actual grande y centrada, con el nombre del personaje.
   - Réplicas (otros): se leen con TTS, color/acento distinto, auto-avance al
     terminar el audio.
   - Tus turnos: se muestra según el modo; abajo un botón grande "SIGUIENTE"
     (o barra espaciadora). En modo voz, además escucha el micro y avanza al
     detectar silencio tras hablar.
   - Barra de progreso (turno N de M).
   - Controles: repetir · pausa · saltar · reiniciar · velocidad.
3. **Fin**: "Escena completada", opción de repetir o cambiar de personaje.

## 5. Arquitectura técnica

Separar LÓGICA PURA (testeable sin DOM) de la UI y del TTS.

### 5.1 Parser de turnos — `src/lib/scene-script.ts` (NUEVO, puro)
```ts
export interface SceneTurn { id: number; speaker: string; text: string; }
export function parseScriptTurns(script: string): SceneTurn[]
export function cueOf(text: string, words = 3): string  // primeras N palabras
```
- Reutiliza las heurísticas de `ScriptAnalyzer.parseScript`/`extractCharacterLines`
  pero preservando ORDEN y agrupando líneas consecutivas del mismo hablante.
- Soporta los dos formatos del repo:
  - `NOMBRE` en su línea seguido de líneas de diálogo.
  - `NOMBRE: diálogo` en la misma línea.
- Excluye encabezados de escena (`INT./EXT./EST.`), acotaciones entre
  paréntesis, y transiciones (`FADE`, `CUT TO:`).
- Normaliza nombres (mayúsculas, sin tildes) para casar con los personajes ya
  detectados.

### 5.2 Motor de voz — `src/lib/speech/` (NUEVO)
```ts
// SpeechProvider.ts
export interface SpeechProvider {
  speak(text: string, opts?: { voice?: string; rate?: number }): Promise<void>;
  cancel(): void;
  listVoices(): SpeechVoice[];
}
// BrowserSpeechProvider.ts  -> Web Speech API (window.speechSynthesis)
// (futuro) AiSpeechProvider.ts -> TTS IA; misma interfaz, cero cambios arriba
export function getSpeechProvider(): SpeechProvider // factory, navegador por def.
```
- `speak()` resuelve la promesa en `utterance.onend` -> así el reproductor avanza.
- Asignación de voz por personaje (round-robin sobre las voces del sistema en
  español) para distinguir réplicas.

### 5.3 Máquina de estados — `src/hooks/useRehearsal.ts` (NUEVO)
Lógica del reproductor como reducer PURO (testeable aparte de React/TTS):
```ts
type Phase = 'idle' | 'speaking' | 'awaiting-user' | 'finished';
interface RehearsalState { phase: Phase; index: number; turns: SceneTurn[]; myRole: string; }
// acciones: START, PARTNER_DONE, USER_ADVANCE, REPEAT, SKIP, PREV, RESTART
function rehearsalReducer(state, action): RehearsalState
```
- El hook envuelve el reducer y conecta efectos: cuando `phase==='speaking'`
  llama a `provider.speak(turn.text)` y al terminar dispara `PARTNER_DONE`;
  cuando es turno del actor pasa a `awaiting-user`.
- Detección de voz (opcional): Web Speech Recognition; al `onspeechend` ->
  `USER_ADVANCE`. Degradación elegante si el navegador no lo soporta.

### 5.4 UI — `src/components/rehearsal/RehearsalPlayer.tsx` (NUEVO)
- Overlay full-screen. Consume `useRehearsal`. Móvil-first (botón SIGUIENTE
  grande, accesible con el pulgar; nunca tapado por barras).

### 5.5 Cableado — `ScriptAnalyzer.tsx` (EDICIÓN mínima)
- Botón "ENSAYAR ESCENA" en EL CUERPO cuando hay personajes detectados.
- Estado `showRehearsal` que monta `RehearsalPlayer` con `script` y la lista de
  personajes.

## 6. Persistencia
- Config del ensayo (rol elegido, modos, mapa de voces) en `localStorage`
  (`sceneme_rehearsal_prefs`). Sin Firestore en el MVP.
- Hook futuro: registrar `{character, scriptHash, ts}` para alimentar la ficha
  (se conecta en el spec de ficha progresiva).

## 7. Plan de pruebas (TDD)
Lógica pura primero (RED -> GREEN -> REFACTOR):
1. `parseScriptTurns`:
   - formato `NOMBRE`/diálogo en líneas -> turnos ordenados correctos.
   - formato `NOMBRE: diálogo` -> idem.
   - excluye encabezados de escena y acotaciones.
   - agrupa líneas consecutivas del mismo hablante en un turno.
2. `cueOf`: primeras N palabras, respeta puntuación, cadena corta.
3. `rehearsalReducer`: START posiciona en turno 0; PARTNER_DONE avanza y marca
   awaiting-user en turno propio; USER_ADVANCE avanza; REPEAT no mueve índice;
   PREV/SKIP en límites; RESTART vuelve a 0; al pasar el último -> finished.
- Verificación de TTS y micro: manual en navegador (no unit-testeable de forma
  fiable). Web Speech API se mockea en los tests del reducer.

Nota: vitest/jsdom NO están instalados en node_modules. Para los tests de lógica
pura uso el harness Node + `typescript.transpileModule` ya usado para
`isMobileEnv`, o instalamos vitest (`npm i -D vitest`) si prefieres una suite
estable. **Decisión pendiente del usuario.**

## 8. Rollout
- Commits incrementales; deploy a preview de Vercel; verificar en móvil real
  antes de prod.
- Sin variables de entorno nuevas (Web Speech API es del navegador).

## 9. Preguntas abiertas
1. ¿Punto de entrada definitivo: botón en EL CUERPO (propuesto) o también acceso
   directo desde el home/creator?
2. ¿Tests con vitest instalado, o seguimos con el harness Node ligero?
3. ¿"Pie de entrada" = primeras palabras de TU línea (propuesto) o las últimas
   palabras de la réplica anterior?
