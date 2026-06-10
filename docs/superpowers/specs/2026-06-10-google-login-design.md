# Spec — Login con Google (Scene Me / Alchemistery)

Fecha: 2026-06-10 · Estado: aprobado por el usuario · Método: Superpowers

## Objetivo
Activar login social con **Google** (web + móvil/PWA), manteniendo el login por email/contraseña y "crear cuenta". Apple queda fuera por ahora (evita el coste de Apple Developer 99$/año; no es necesario al haber email + Google).

## Alcance
- `src/lib/auth.ts`: `loginWithGoogle()` + `completeRedirectLogin()` (getRedirectResult) + helper `ensureUserDoc()`.
- `src/app/page.tsx`: cablear el botón Google (onClick vacío); **eliminar** el botón de Apple.
- Consola de Firebase: activar el proveedor Google (acción del usuario).

## Diseño
- **Flujo automático:** `signInWithPopup(GoogleAuthProvider)` en escritorio; `signInWithRedirect` en móvil/PWA; al cargar la página, `getRedirectResult` completa el login al volver.
- **Detección de entorno:** móvil por userAgent / PWA por `display-mode: standalone`.
- **Primer login:** crear `users/{uid}` si no existe (email, createdAt, provider:'google'), reusando el patrón de `register`.
- **Post-login:** mismo destino que el login por email actual.
- **Errores (sin fallos silenciosos):** popup bloqueado → fallback a redirect; `account-exists-with-different-credential` → mensaje claro.

## Tests (TDD)
- `isMobileEnv()` → redirect en móvil, popup en escritorio.
- `ensureUserDoc(uid,email)` → crea doc si no existe; no sobrescribe si existe (Firestore mock).
- Verificación manual en local + login real tras activar Google en Firebase.

## Fuera de alcance
- Apple Sign-In (futuro).
- Ficha progresiva de actor + réplicas (spec aparte).
