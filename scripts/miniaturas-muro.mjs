// Las miniaturas del muro del book (components/landing/muro-book.tsx).
//
// El muro enseña los 28 retratos de book reales a la vez, en perspectiva. Las
// columnas de delante se ven grandes y la perspectiva las amplía: a 300 px se
// pixelaban (01/10/2026). Van a 1000 px de ancho, sacadas de los originales de
// 2048 (public/trabajos/*.jpg): 2,1 MB las 28, y sólo se piden al acercarse.
//
// Uso: node scripts/miniaturas-muro.mjs   (vuelve a generarlas todas)

import sharp from 'sharp';
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ORIGEN = 'public/trabajos';
const DESTINO = 'public/trabajos/muro';
mkdirSync(DESTINO, { recursive: true });

let total = 0;
for (const f of readdirSync(ORIGEN).filter((n) => n.endsWith('.jpg')).sort()) {
    const salida = join(DESTINO, f.replace(/\.jpg$/, '.webp'));
    await sharp(join(ORIGEN, f)).resize({ width: 1000 }).webp({ quality: 80, effort: 6 }).toFile(salida);
    total += statSync(salida).size;
}
console.log(`miniaturas en ${DESTINO}: ${(total / 1024).toFixed(0)} kB en total`);
