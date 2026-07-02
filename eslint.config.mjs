import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

// Next.js 16 eliminó `next lint`; ahora ESLint se ejecuta directamente (npm run lint).
export default defineConfig([
    ...nextVitals,
    globalIgnores([
        '.next/**',
        'node_modules/**',
        'public/**',
        'EXQUISIT-ASTOR/**',
        'actorpro/**',
        'scripts/**',
        'debug-pdf*.js',
        'tmp_*.ts',
        'check-models.ts',
        'next-env.d.ts',
    ]),
]);
