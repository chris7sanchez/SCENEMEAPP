import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * EL VÍDEO DE LA CABECERA TIENE QUE VERSE SIEMPRE.
 *
 * El 29/09/2026 el vídeo del nombre dejó de verse en Safari y nadie lo notó
 * hasta que lo vio Christian: en Chrome, que es donde se prueba, iba bien. La
 * causa fue una máscara CSS puesta sobre el propio <video>, algo que Safari
 * pinta mal. Y aparte, un vídeo que arranca solo depende de que el navegador
 * lo deje (modo ahorro del iPhone, reproducción automática desactivada).
 *
 * Esta prueba vigila las dos cosas sin navegador, leyendo el código:
 *   1. Ningún <video> de la web lleva una clase con máscara CSS.
 *   2. La cabecera tiene su plan B: la animación como AVIF animado, que no
 *      pasa por la reproducción automática, y salta cuando el vídeo falla.
 */

const RAIZ = join(__dirname, '..', '..');
const CSS = ['src/components/landing/pelicula.css', 'src/app/globals.css'];

function ficheros(dir: string, ext: RegExp): string[] {
    const out: string[] = [];
    for (const nombre of readdirSync(dir)) {
        const ruta = join(dir, nombre);
        if (statSync(ruta).isDirectory()) out.push(...ficheros(ruta, ext));
        else if (ext.test(nombre)) out.push(ruta);
    }
    return out;
}

/** Las clases que alguna regla CSS con máscara usa en su selector. */
function clasesConMascara(): Set<string> {
    const clases = new Set<string>();
    for (const f of CSS) {
        const css = readFileSync(join(RAIZ, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
        for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
            if (!/(^|[^-])mask(-image)?\s*:/.test(m[2]) && !/-webkit-mask(-image)?\s*:/.test(m[2])) continue;
            for (const c of m[1].matchAll(/\.([A-Za-z0-9_-]+)/g)) clases.add(c[1]);
        }
    }
    return clases;
}

/** Las clases que lleva cada <video> del código, resolviendo className={CONSTANTE}. */
function clasesDeLosVideos(): { donde: string; clases: string[] }[] {
    const out: { donde: string; clases: string[] }[] = [];
    for (const f of ficheros(join(RAIZ, 'src'), /\.tsx$/)) {
        const codigo = readFileSync(f, 'utf8');
        for (const m of codigo.matchAll(/<video\b[\s\S]*?\/?>/g)) {
            const etiqueta = m[0];
            let texto = etiqueta.match(/className="([^"]*)"/)?.[1] ?? '';
            const constante = etiqueta.match(/className=\{([A-Z_][A-Z0-9_]*)\}/)?.[1];
            if (constante) {
                const def = codigo.match(new RegExp(`const ${constante}\\s*=\\s*['"\`]([^'"\`]*)['"\`]`));
                texto += ' ' + (def?.[1] ?? '');
            }
            const clases = texto.split(/\s+/).filter(Boolean).map((c) => c.replace(/^[a-z]+:/, ''));
            out.push({ donde: f.replace(RAIZ + '/', ''), clases });
        }
    }
    return out;
}

describe('el vídeo de la cabecera', () => {
    it('ningún <video> lleva una clase con máscara CSS (Safari lo pinta mal)', () => {
        const conMascara = clasesConMascara();
        const videos = clasesDeLosVideos();
        expect(videos.length).toBeGreaterThan(0);
        const malos = videos.flatMap((v) => v.clases.filter((c) => conMascara.has(c)).map((c) => `${v.donde}: .${c}`));
        expect(malos).toEqual([]);
    });

    it('tiene plan B: la animación en AVIF animado, ligera', () => {
        const codigo = readFileSync(join(RAIZ, 'src/components/landing/presentacion.tsx'), 'utf8');
        expect(codigo).toContain("'/marca/presentacion-animada.avif'");
        expect(codigo).toContain('type="image/avif"');
        // Salta cuando el vídeo falla: play() rechazado y error de carga.
        expect(codigo).toMatch(/\.play\(\)\.catch\(aLaAnimada\)/);
        expect(codigo).toMatch(/addEventListener\('error', aLaAnimada\)/);

        const avif = readFileSync(join(RAIZ, 'public/marca/presentacion-animada.avif'));
        // Es un AVIF de verdad y es una SECUENCIA (animado), no una imagen fija.
        expect(avif.subarray(4, 12).toString('latin1')).toBe('ftypavis');
        expect(avif.length).toBeLessThan(1024 * 1024);
    });
});
