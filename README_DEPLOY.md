# 🚀 Cómo publicar tu App en Internet (Vercel)

¡Tu aplicación está lista! Sigue estos pasos para verla en tu móvil:

1.  **Abre tu terminal** y ejecuta:
    ```bash
    npx vercel
    ```

2.  **Sigue las instrucciones** en pantalla:
    *   Logueate con tu cuenta (GitHub, Google, etc).
    *   Responde `Y` (Yes) a todo para configurar el proyecto.

3.  **Configura las Variables (IMPORTANTE)**:
    *   Vercel te pedirá configurar variables de entorno.
    *   Ve al panel de control de Vercel en tu navegador (el link que te dará).
    *   Ve a **Settings > Environment Variables**.
    *   Copia TODAS las variables de tu archivo `.env` local y pégalas allí.
        *   `GOOGLE_GENAI_API_KEY`
        *   `NEXT_PUBLIC_FIREBASE_API_KEY`
        *   etc...

4.  **¡Listo!**
    *   Vercel te dará una URL (ej: `scene-me.vercel.app`).
    *   Ábrela en tu móvil.

## Panel de Administración
Recuerda que para entrar al admin (`/admin`), necesitas el usuario y contraseña que configuraste en Firebase.
