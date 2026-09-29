// Las miniaturas del muro del book (components/landing/muro-book.tsx).
//
// El muro enseña los 28 retratos de book reales de public/trabajos/web a la
// vez, pequeños y en perspectiva. Pedir los originales (934x1400, ~100 kB cada
// uno) serían 2,3 MB para verlos a 150 px de ancho; las miniaturas a 300 px
// (el doble, para pantallas retina) son unos 12 kB cada una.
//
// Uso: node scripts/miniaturas-muro.mjs   (vuelve a generarlas todas)

import sharp from 'sharp';
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ORIGEN = 'public/trabajos/web';
const DESTINO = 'public/trabajos/muro';
mkdirSync(DESTINO, { recursive: true });

let total = 0;
for (const f of readdirSync(ORIGEN).filter((n) => n.endsWith('.webp')).sort()) {
    const salida = join(DESTINO, f);
    await sharp(join(ORIGEN, f)).resize({ width: 300 }).webp({ quality: 72, effort: 6 }).toFile(salida);
    total += statSync(salida).size;
}
console.log(`miniaturas en ${DESTINO}: ${(total / 1024).toFixed(0)} kB en total`);
