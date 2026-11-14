# SCENE ME: resumen para retomar (actualizado el 14/11/2026)

Para pegar o adjuntar en otra conversación de Claude Code. Repo:
chris7sanchez/SCENEMEAPP (público). Todo en castellano. Respuestas cortas,
un paso cada vez (ver CLAUDE.md).

Junta dos conversaciones: la de la pantalla de Servicios (PR 14) y la de
Fotogramas y guiones con IA (26/10/2026, ya en `main` y en producción).

## 1. Hecho

### Pantalla de Servicios nueva (borrador, sin fusionar)

- PR 14 (borrador, abierto): https://github.com/chris7sanchez/SCENEMEAPP/pull/14,
  rama `portada-3-pasos`, sale de `main` 62883c3.
- Cambia sólo `src/components/steps/step0-intro.tsx` (pantalla de `/creator`,
  pestaña Servicios).
- Contenido: titular «Tu éxito en 3 pasos»; tres tarjetas con foto, número y
  nombre (1 Tu book, 2 Tu escena, 3 Tu selftape); tira «Entrena gratis cada
  día» con botón «Entrar a ensayar» (`/studio`) y etiqueta «Escena creada con IA».
- Toques: Book → flujo photo, paso 1. Escena → flujo scene, paso 1.
  Selftape → `/booking?service=selftape`.
- Salen de esta pantalla: «Ver trabajos» y el bloque PACKTOR PRO (con él se va
  el único enlace a `/booking?service=packtor`).
- Se mantienen `#servicios`, InstallPrompt y la pantalla de arranque.
- Probado en local: `tsc --noEmit` sin errores, vitest 292 de 292, eslint del
  fichero de 5 problemas a 1 (el que queda ya estaba en `main`). Medido en
  390×844, 375×667, 360×740 y escritorio. No se ejecutó `next build`.
- Tipografías: Archivo 800 en mayúsculas e Instrument Serif cursiva para los
  números. Dorado #F4B625.

### Fotogramas: referencias de cine con IA (en producción)

- Ruta `/fotogramas`; hoy se entra desde la pestaña Studios (la barra pasó a
  tres pestañas el 10/11).
- Escribes una película, un director, un actor o lo que quieres ver («hombre
  llorando bajo la lluvia») y Gemini propone 6 escenas reales. Comprobado en
  producción con sesión iniciada: 6 escenas para «moulin rouge» y 6 para
  «hombre llorando bajo la lluvia».
- En cada escena: «Ver clips» (YouTube), «Google Imágenes» con la búsqueda
  hecha y «Capturar».
- El actor pega (Ctrl+V), arrastra o sube su captura a su deck privado
  (Firebase Storage, `users/{uid}/fotogramas/`). La IA etiqueta cada captura:
  plano, ángulo, luz, color, emoción, composición.
- Decks: filtro por película, nota o etiqueta; compartir por enlace
  (`/fotogramas/d/{id}`, sin indexar) con botón «Denunciar» que retira el
  enlace al momento.
- **Todo gratis** mientras se valora el interés (`TODO_GRATIS` en
  `src/lib/fotogramas.ts`). El cobro con Stripe está programado y apagado.
- Condiciones de uso (`/terms`, punto 7): contenido que sube el usuario y retirada.

**Por qué no hay imágenes de películas propias:** TMDB exige licencia comercial
(149 USD/mes) para una app que gana dinero, aunque sea de forma indirecta
(captar clientes cuenta); OMDb prohíbe montar un negocio con sus datos; la API
de imágenes de Google no admite clientes nuevos y se apaga el 1/1/2027. Montar
una biblioteca con una cuenta personal y pasarla a la app tampoco vale: la
copia privada no cubre a una empresa. Por eso la app sólo recomienda escenas y
cada actor sube sus capturas (la app es el sitio donde las guarda, como
Pinterest). Detalle en `docs/SEGURIDAD.md`.

### Guiones con IA (en producción)

- Mis Estudios → Guiones: además de la hemeroteca (243 guiones), «Buscar con
  IA» dice si un guion está publicado, quién lo escribió y dónde suele estar.
  Si ya está en la hemeroteca se abre en el lector; si no, búsqueda de Google
  ya escrita. La IA nunca pone enlaces.
- «Referencias de cine» en el lector, en los guiones guardados y en cada
  resultado: abre Fotogramas con la escena cargada y la IA busca escenas de
  películas parecidas. Botón «Deck para este papel».
- Lector en el móvil: la barra de pestañas tapaba la última fila de botones; corregido.

### Documentos

- Legal y marca: https://claude.ai/artifact/89dXVB1wtTND7w1e5MaYtL (pestañas
  «Qué hacer», «Borradores» y «Encargo para el código»).
- Cesión de uso de imagen (también en Word):
  https://claude.ai/artifact/8dVvqvfw7uhwSUSgNhS6Tz. Cesión gratuita, con
  XALVAJE (xalvajeproducciones.com) y Xperimentalacting studio como medios de
  promoción. Hay que revisarla con un abogado.
- Tablero: https://claude.ai/artifact/KDocE75qqvGLT39q7UrG9Z.
  Permisos: https://claude.ai/artifact/EpkoeHKNHxBx2PduMGcuWp.
- Prototipo de diseño (sin actualizar a las últimas decisiones):
  https://claude.ai/artifact/XZRsSf5e7UpgpfDM16VxK9.

## 2. Pendiente

1. **Las 3 fotos** (`book.webp`, `escena-bano.webp`, `selftape-beige.webp`) en
   `public/portada/` de la rama `portada-3-pasos`. Comprobado el 14/11: en la
   rama sólo está `LEEME.txt`. Sin ellas las tarjetas salen oscuras. Subida
   manual por la web:
   https://github.com/chris7sanchez/SCENEMEAPP/upload/portada-3-pasos/public/portada
   (enlace sin probar).
2. **Vídeo en la sección Selftape** (`/booking?service=selftape`). Fichero
   SELFTAPES.mp4 del Escritorio de Christian. Texto: «MARCA LA DIFERENCIA
   mandando EL MEJOR SELFTAPE!», «Imagen y sonido PROFESIONAL», «Coaching
   actoral», «Envío de material inmediato». Reducirlo a menos de 25 MB (ffmpeg,
   H.264 + AAC, faststart, póster JPG) sin pérdida visible en el móvil.
   Bloqueado: el chat rechaza el archivo por tamaño y ninguna sesión está
   enlazada a su ordenador.
3. Marcar el **cambio 3 del Encargo como hecho** (PR 14) para que ninguna otra
   sesión lo repita. Christian aún no ha dicho que sí.
4. El resto del Encargo (barra, comunidad y 11 limpiezas/legales) y renombrar
   «prueba» por «selftape» fuera de la pantalla de Servicios.
5. **Clave de YouTube** (`YOUTUBE_API_KEY`, gratis) para que los clips de
   Fotogramas se vean dentro de la app. Sin ella, «Ver clips» abre YouTube fuera.
6. Decidir si Fotogramas se cobra (y cómo encaja con Packtor Pro) o queda como
   gancho gratis para captar clientes de videografía.

## 3. Bloqueos de lanzamiento

- «Pagar» no cobra nada. No hay precio del selftape. El pago como invitado
  falla sin avisar.
- Contadores inventados en `/backlot`.
- Páginas legales en plantilla; faltan datos de la empresa.
- **Permiso de Firestore para la cuenta de servicio de Vercel.** Confirmado en
  los registros de producción (`PERMISSION_DENIED`): es la cuenta del
  calendario y no puede leer Firestore. Rompe compartir decks y denunciar en
  Fotogramas, y `/api/puntos` (que ya tiene recuento provisional).
- 0 de 21 cesiones de imagen firmadas. Sin alta de autónomo. Decisión de marca
  pendiente (SCENE ME frente a SceneMate o SceneMe AI).
- Las condiciones de uso de Fotogramas (punto 7) deben pasar por un abogado
  antes de cobrar nada.

## 4. Reglas y trampas técnicas

- **Vercel publica solo:** cada push a `main` se despliega en producción
  (comprobado: los despliegues vienen de git). `PRODUCT.md` sigue diciendo que
  se publica a mano con `npm run publicar`; está desfasado.
- **No empujar directamente a `main`: siempre rama y PR**, porque cada push a
  `main` sale en producción. Ojo: la conversación de Fotogramas (26/10) sí
  empujó directamente a `main`, antes de conocer esta regla.
- GitHub: el conector MCP es de solo lectura (403). Se escribe con Composio
  (conexión activa) o con `git push` desde una sesión con el repo clonado.
  Composio **sólo pasa texto**: no se pueden subir binarios (fotos, vídeo) desde la nube.
- Comprobación de tipos: `NODE_OPTIONS=--max-old-space-size=6144 npx tsc --noEmit`
  (sin ese límite se queda sin memoria).
- Gemini: las llamadas nuevas van por `src/ai/gemini-json.ts` (llamada directa,
  sin «pensamiento», tope de 22 s). Con el «pensamiento» activado pasaba de 30 s,
  Vercel cortaba y Safari mostraba «The string did not match the expected pattern».
- Los registros de Vercel (plan Hobby) sólo guardan **una hora**: si algo falla,
  hay que mirarlo enseguida.
- En local, `next dev` no carga `.env.production`: sin copiarlo a
  `.env.development.local` (ignorado por git) las páginas con Firebase no cargan.
- `/creator` usa `cn("pb-28 ...", "p-0")` en el paso 0: `p-0` anula `pb-28`. Más
  `min-h-screen` y el `pb-16` del layout, la página siempre se desplaza 64 px de
  más en móvil. Ya pasaba antes y no se ha tocado.
- Texto sobre foto siempre con velo, nada por debajo del 60 % de opacidad,
  objetivos táctiles de 44 px o más (`PRODUCT.md`).
- «Entrena gratis» coincide con el texto de StudioInvite («Tu gimnasio de
  actor. Gratis, cada día»).

## 5. Avisos

- El repo es público: lo que se suba (fotos, vídeo) lo ve cualquiera, aunque no
  se fusione.
- Las personas que salgan en las fotos o el vídeo no tienen cesión firmada.
- No fusionar el PR 14 hasta que estén las fotos.
- Toda la IA (ideas, etiquetas, guiones) la paga SCENE ME con la clave de
  Gemini; hay topes por persona y hora (30 ideas, 60 etiquetas, 30 búsquedas de guiones).
