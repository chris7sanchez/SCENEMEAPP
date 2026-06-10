# WE SCENE STUDIO — Escena del día + Subida de tarea (MVP)

Fecha: 2026-06-10
Estado: PROPUESTO (HARD GATE — aprobación antes de implementar UI completa)
Método: superpowers (brainstorm → spec → TDD)
Sustituye el foco anterior: el "Modo Ensayo con réplicas"
(2026-06-10-modo-ensayo-replicas-design.md) queda APLAZADO a fase posterior.

## 1. Qué construimos AHORA (solo esto)

1. **Escena del día**: un pulsador que muestra/genera un guion CORTO y FÁCIL,
   UNO al día, **igual para todos** (generado por IA una vez por día).
2. **Espacio personal "Mis tareas"**: cada usuario sube su grabación (VÍDEO con
   audio) para almacenarla y revisarla.

Fuera de alcance ahora: votos, ranking, feed público, recompensas, generador
de guiones general, réplicas/scene-partner.

## 2. Decisiones tomadas
- Escena del día: la MISMA para todos, IA, 1×/día (barato y deja la puerta
  abierta a votación futura: todos hacen la misma escena).
- Tarea subida: VÍDEO con audio.
- Requiere login (ya tenemos Google login). Subir = usuario autenticado.

## 3. Arquitectura

### 3.1 Escena del día (compartida, 1×/día)
- Clave por fecha en TZ Europe/Madrid: `YYYY-MM-DD`.
- Generación PEREZOSA con caché (sin cron): al abrir el Studio, se lee
  `dailyScenes/{fecha}` en Firestore; si no existe, se genera con IA y se
  guarda. Los demás usuarios de ese día leen el doc cacheado → 1 llamada/día.
- Reutiliza el flujo de IA existente (`generate-dialogue`/`generate-script`)
  con un PRESET "corto y fácil": 1 escena, 2 personajes, ~8–12 líneas, tono
  general y apropiado (guardarraíles de contenido; puede haber menores usando
  la app).
- El "pulsador" revela la escena de hoy (y la genera si aún no existe).

### 3.2 Mis tareas (subida de vídeo, privada)
- Captura: subida de archivo desde el dispositivo (cámara del móvil) como vía
  principal (más fiable cross-device). Grabación in-app (MediaRecorder) como
  mejora posterior.
- Almacenamiento: **Firebase Storage** en `submissions/{uid}/{fecha}/{archivo}`.
- Metadatos: Firestore `users/{uid}/submissions/{id}` =
  `{ date, sceneId, storagePath, downloadURL, createdAt, title }`.
- Revisión: lista de las tareas PROPIAS del usuario; reproducción inline
  (elemento <video> con downloadURL). Solo ve las suyas (privado).

### 3.3 Rutas / ubicación
- Nueva ruta `/studio` (WE SCENE STUDIO), con acceso desde el home/creator.
- Secciones: "Escena de hoy" (tarjeta + pulsador) y "Mis tareas" (subir + lista).

## 4. Ficheros

NUEVOS:
- `src/lib/daily-scene.ts` (lógica pura, testeable): `dailyKey(date, tz)`,
  validación de forma de escena `isValidScene(obj)`.
- `src/lib/studio-db.ts`: `getOrCreateDailyScene(date)`, `saveSubmissionMeta()`,
  `listMySubmissions(uid)` (Firestore + Storage).
- `src/ai/generate-daily-scene.ts`: wrapper del flujo IA con el preset corto.
- `src/components/studio/DailyScene.tsx`: tarjeta + pulsador.
- `src/components/studio/MyTasks.tsx`: subir + lista + reproducción.
- `src/components/studio/UploadButton.tsx`: input de archivo + subida a Storage.
- `src/app/studio/page.tsx`: la página.

EDICIÓN mínima:
- Home/creator: enlace/botón a `/studio`.

## 5. Plan de pruebas (TDD)
Lógica pura primero:
1. `dailyKey`: misma fecha → misma clave; TZ Europe/Madrid; frontera de
   medianoche; formato `YYYY-MM-DD`.
2. `isValidScene`: acepta escena con título + ≥2 líneas con personaje+texto;
   rechaza objetos incompletos (para no cachear basura de la IA).
3. Constructor de metadatos de subida: ruta de Storage correcta y nombre de
   archivo saneado (sin caracteres peligrosos).
- Firestore/Storage/IA y la subida real: verificación manual en navegador.
- Tests: decisión pendiente — vitest (recomendado) o harness Node ligero.

## 6. Acciones SOLO del usuario (consola)
1. **Habilitar Firebase Storage** (Console → Storage → Get started) y poner
   reglas: cada usuario solo lee/escribe `submissions/{su uid}/...`.
   (Yo te doy las reglas exactas al desplegar.)
2. Gemini API key en Vercel (ya necesaria para el resto).
- Aviso honesto: el almacenamiento de vídeo tiene COSTE que crece con el uso.

## 7. Rollout
- Commits incrementales; preview en Vercel; verificar en móvil real; luego prod.
