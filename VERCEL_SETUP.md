# 🌐 VERCEL DEPLOYMENT CONFIGURATION GUIDE

Para asegurar que **SceneMe** y **Antigravity** funcionen perfectamente en producción, debes configurar las siguientes bases en el panel de Vercel.

## 1. Variables de Entorno (Environment Variables)
Ve a **Settings > Environment Variables** y añade las siguientes llaves. Puedes copiar los valores de tu archivo `.env` local.

### 🔑 AI & Emails
| Key | Descripción |
| :--- | :--- |
| `GOOGLE_GENAI_API_KEY` | Clave de Google Gemini para las lecturas de Antigravity. |
| `RESEND_API_KEY` | Clave de Resend para el envío de guiones y solicitudes. |

### 🔥 Firebase (Base de Datos & Auth)
| Key | Valor Sugerido |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Copiar de `.env` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `scene-me.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `scene-me` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `scene-me.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `642829205098` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:642829205098:web:8e1c98079ca453e1521413` |

### 🛡️ Seguridad Admin
| Key | Valor Sugerido |
| :--- | :--- |
| `NEXT_PUBLIC_ADMIN_EMAIL` | `chris.7sanchez@gmail.com` |
| `ADMIN_PASSWORD` | Tu contraseña maestra (ej: `Masterchris123`) |

---

## 2. Comprobación de Activos (Assets Check)
He detectado que el vídeo de fondo del login (`login-video.mp4`) no se encuentra actualmente en la carpeta `public/`. 
*   **Acción Recomendada:** Si tienes el archivo, colócalo en `public/login-video.mp4` antes de desplegar.
*   **Nota sobre `.vercelignore`:** He ajustado este archivo para que NO ignore vídeos que estén dentro de `public/`, pero sí ignore archivos pesados de backup en la raíz.

---

## 3. Optimización de Construcción
El proyecto ya está configurado para:
- Ignorar errores de TypeScript menores durante el build (`ignoreBuildErrors: true`).
- Manejar archivos PDF pesados en el servidor (`serverExternalPackages`).
- Soporte PWA básico.

## 🚀 Próximos Pasos
1. Abre tu terminal en la carpeta del proyecto.
2. Ejecuta `npx vercel` para vincular y subir los cambios.
3. Si ya estaba subido, usa `git add .`, `git commit -m "Fix Vercel bases"` y `git push` para desplegar automáticamente si tienes Git vinculado a Vercel.
