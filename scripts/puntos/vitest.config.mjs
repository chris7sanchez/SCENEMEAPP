import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Config propia: esta prueba no va en `npm test` (necesita Java y el emulador)
// y, a diferencia de las de src/, importa código del servidor que usa el alias @.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) } },
  test: { environment: 'node', include: ['*.test.mjs'], testTimeout: 30000 },
});
