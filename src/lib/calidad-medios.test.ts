import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

/**
 * QUE NADA SE PIXELE.
 *
 * El 01/10/2026 Christian vio la web pixelada: los books salían de copias de
 * 934 px, las miniaturas del muro eran de 300 px y la cortinilla de entrada
 * estiraba un logo de 512 a 500 px de pantalla (una pantalla Retina necesita
 * el DOBLE de píxeles de los que ocupa). Esta prueba fija los mínimos para que
 * no vuelva a entrar una imagen pequeña sin que nadie se entere: si falla,
 * `npm run publicar` no publica.
 *
 * Los vídeos de las escenas los rehace en HD scripts/videos-hd.mjs desde los
 * originales del Mac (dentro de `npm run publicar`); aquí sólo se vigila la
 * cabecera, cuyo original está en el repositorio.
 */

const RAIZ = join(__dirname, '..', '..');
const anchoAlto = async (f: string) => {
    const m = await sharp(join(RAIZ, f)).metadata();
    return { ancho: m.width ?? 0, alto: m.height ?? 0 };
};

describe('calidad de imágenes y vídeos', () => {
    it('los books de la web van a la resolución completa (2048 por el lado largo)', async () => {
        const dir = 'public/trabajos/web';
        const fotos = readdirSync(join(RAIZ, dir)).filter((f) => f.endsWith('.webp'));
        expect(fotos.length).toBeGreaterThan(20);
        const pequeñas: string[] = [];
        for (const f of fotos) {
            const { ancho, alto } = await anchoAlto(`${dir}/${f}`);
            if (Math.max(ancho, alto) < 2000) pequeñas.push(`${f} (${ancho}x${alto})`);
        }
        expect(pequeñas).toEqual([]);
    });

    it('las miniaturas del muro tienen al menos 1000 px de ancho', async () => {
        const dir = 'public/trabajos/muro';
        const pequeñas: string[] = [];
        for (const f of readdirSync(join(RAIZ, dir)).filter((x) => x.endsWith('.webp'))) {
            const { ancho } = await anchoAlto(`${dir}/${f}`);
            if (ancho < 1000) pequeñas.push(`${f} (${ancho})`);
        }
        expect(pequeñas).toEqual([]);
    });

    it('la cortinilla no muestra el logo a más de la mitad de su tamaño', async () => {
        const { ancho } = await anchoAlto('public/splash-logo.webp');
        // El contenedor más grande de la cortinilla: md:w-72 = 288 px.
        const codigo = readFileSync(join(RAIZ, 'src/components/pwa/splash-screen.tsx'), 'utf8');
        expect(codigo).not.toMatch(/md:w-\[(?:[3-9]\d\d)px\]/);
        expect(ancho).toBeGreaterThanOrEqual(288 * 2);
    });

    it('el vídeo de la cabecera no va más comprimido que su original', () => {
        // Un MP4 de 10 s a 1280x720: por debajo de ~2,5 MB se notan los bloques.
        const tamaño = readFileSync(join(RAIZ, 'public/marca/presentacion.mp4')).length;
        expect(tamaño).toBeGreaterThan(2.5 * 1024 * 1024);
    });
});
