# Seguridad de SCENE ME — repaso de los 20 puntos (18/10/2026)

Repaso completo de la app con la lista de «20 cosas antes de lanzar». Para cada
punto: cómo estaba, qué se ha hecho y qué queda.

| # | Punto | Estado |
|---|---|---|
| 1 | Ocultar API keys | ✅ Las claves de IA, email, voces, Replicate y Google viven sólo en el servidor. La de TMDB viajaba al navegador (`NEXT_PUBLIC_TMDB_KEY`): ahora se usa desde `/api/peliculas`. La config de Firebase del navegador es pública por diseño. |
| 2 | Eliminar secretos de Git | ✅ Revisado todo el historial: no hay claves privadas, tokens ni contraseñas. `.env.production` sólo lleva la config pública de Firebase. |
| 3 | Key pública para la DB | ✅ El navegador sólo usa la clave pública de Firebase; firebase-admin (service account) sólo en el servidor. |
| 4 | Row-Level Security | ✅ Firestore: reglas endurecidas (ver abajo). Supabase (Actorlogía): RLS en todas las tablas, políticas optimizadas. |
| 5 | Encriptar datos sensibles | ✅ Firestore, Storage y Supabase cifran en reposo; todo viaja por HTTPS. No se guardan contraseñas ni datos de pago. |
| 6 | Forzar la autenticación | ✅ Rutas de pago con tope por persona; `generate-script` sólo para el admin (token verificado en el servidor). Reglas: pedidos, publicaciones y comentarios exigen sesión. |
| 7 | Restringir acceso a registros | ✅ Cada usuario sólo lee/escribe lo suyo (Firestore `users/{uid}`, Storage por carpeta, Supabase por `user_id`). |
| 8 | Bloquear manipulación de campos | ✅ Ya no se pueden poner bravos a mano, ni reescribir la escena del día, ni crear pedidos en nombre de otro, ni cambiar el dueño de una publicación. |
| 9 | Proteger session cookies | ✅ La app no usa cookies de sesión: Firebase guarda la sesión en el navegador (IndexedDB). |
| 10 | Hashear contraseñas | ✅ Las gestiona Firebase Auth. La contraseña maestra del admin se compara en tiempo constante. |
| 11 | Rate limiting | ✅ `src/lib/seguridad.ts` (`frenar`) en reservas, contacto, voces, análisis de tomas, carta 3D, guiones, contraseña del admin, películas; y `frenarAccionIA` en todas las acciones de servidor que llaman a Gemini. |
| 12 | Protección contra bots | 🟡 El tope por IP frena los scripts sencillos. Para algo serio: una regla de Vercel Firewall (abajo). |
| 13 | Parametrizar queries | ✅ No hay SQL a mano: Firestore y Supabase usan su SDK. |
| 14 | Validar inputs | ✅ Longitudes y formatos en reservas, contacto, voces (`voice` sólo id), carta 3D (`id`), fondos (sólo 3 carpetas), guiones. |
| 15 | Sanitizar contenido | ✅ Todo lo que escribe un visitante se escapa antes de entrar en un email o en una página (`escaparHtml`). |
| 16 | Restringir archivos | ✅ `storage.rules` nuevas (sólo tu carpeta, sólo imagen/vídeo/audio/PDF, máx. 1 GB). Las herramientas que escriben en disco (`convert`, `ingest-folder`, `knowledge`, `tools/video`) sólo funcionan en desarrollo. |
| 17 | Devolver datos necesarios | ✅ Los errores ya no devuelven `error.message`, trazas ni respuestas de los proveedores; `send-email` ya no devuelve la respuesta de Resend. Borradas las rutas de prueba (`test-ai` enseñaba trozos de la clave de Gemini). |
| 18 | Security headers | ✅ `vercel.json`: HSTS, CSP (`frame-ancestors`, `object-src`, `base-uri`), nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy. |
| 19 | Forzar HTTPS | ✅ Vercel redirige a HTTPS y ahora además va HSTS + `upgrade-insecure-requests`. |
| 20 | Escanear dependencias | ✅ Next 16.0.7 → 16.4.2 (tenía 2 fallos críticos), `npm audit fix`, quitados `next-pwa` y `patch-package` (no se usaban). Quedan avisos en `firebase` 11 y en la telemetría de `genkit` (ver abajo). |

## Reglas de Firebase

`firestore.rules` y `storage.rules` se publican aparte de la web:

```
npm run reglas
```

Antes de publicarlas se prueban en el emulador (`scripts/reglas/`): 12 pruebas
de Firestore y 2 de Storage. Con las reglas antiguas, 7 de los abusos pasaban.

## Pendiente, fuera del código

- **Vercel Firewall**: una regla de rate limit para `/api/*` (p. ej. 60
  peticiones/minuto por IP) hace el tope a prueba de varias instancias.
- **Supabase → Auth → «Leaked password protection»**: rechaza contraseñas que
  aparecen en filtraciones (sólo en plan Pro).
- **Supabase**: el trigger `auto_confirm_email` confirma los emails sin
  verificarlos. Se puede quitar cuando Resend tenga el dominio verificado.
- **`firebase` 11 → 12**: arregla el aviso de `@grpc/grpc-js`, que sólo afecta
  si se usa Firestore cliente desde el servidor. Es un cambio de versión
  grande: con pruebas aparte.
- **La clave de TMDB**: no está configurada en Vercel (nunca llegó a filtrarse).
  Cuando se quiera la búsqueda de películas, se guarda como `TMDB_KEY`, sin
  `NEXT_PUBLIC_`.
- **Vercel → variables «Sensitive»**: `ADMIN_PASSWORD`, `RESEND_API_KEY`,
  `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` y las claves de Gemini están guardadas
  como legibles desde el panel. Marcarlas como *Sensitive* hace que nadie
  (ni con acceso al panel) pueda volver a leerlas.
