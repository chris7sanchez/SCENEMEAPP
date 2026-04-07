---
description: Levantar el entorno de desarrollo local de SceneMe
---

# Local Dev — SceneMe

// turbo-all

1. **Instalar dependencias** (solo si hay cambios en `package.json`):
   ```bash
   npm install
   ```

2. **Levantar el servidor local**:
   ```bash
   npm run dev
   ```
   La app estará disponible en **http://localhost:3000**

3. **Desplegar reglas de Firestore actualizadas** (requiere `firebase-tools`):
   ```bash
   npx firebase-tools deploy --only firestore:rules
   ```

**Nota:** Las variables de entorno se leen de `.env.local`. Asegúrate de que `GOOGLE_GENAI_API_KEY` y todas las variables `NEXT_PUBLIC_FIREBASE_*` estén configuradas.
