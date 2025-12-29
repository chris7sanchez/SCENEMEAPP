---
description: Deploy the Antigravity application to Vercel
---

# Deploy to Vercel

1. **Build the project locally** to ensure there are no compilation errors.
   ```bash
   npm run build
   ```

2. **Login to Vercel** (if not already logged in).
   ```bash
   npx vercel login
   ```

3. **Deploy to Preview (Development)**
   This pushes the code to a preview URL.
   ```bash
   npx vercel
   ```
   Follow the interactive prompts:
   - Set up and deploy? [Y]
   - Which scope? [Select your team/user]
   - Link to existing project? [N] (or Y if updating)
   - Project name? [antigravity]
   - In which directory? [./]
   - Want to modify settings? [N]

4. **Deploy to Production**
   Once satisfied with the preview, deploy to the main domain.
   ```bash
   npx vercel --prod
   ```

**Note:** Ensure `GOOGLE_GENAI_API_KEY` is added to Vercel Project Settings > Environment Variables for the AI features to work.
