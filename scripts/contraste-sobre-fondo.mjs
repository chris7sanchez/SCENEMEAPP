/**
 * CONTRASTE SOBRE EL FONDO DE VERDAD.
 *
 * El otro inspector calcula el contraste a partir del `background-color`
 * computado. Eso vale mientras el fondo sea un color plano. En cuanto hay una
 * FOTOGRAFÍA debajo -el cielo estrellado de la portada- ese cálculo miente:
 * dice que el fondo es negro de leader cuando detrás de esa línea de texto
 * puede haber una estrella.
 *
 * Esto lo mide de verdad:
 *   1. Apunta dónde está cada texto y de qué color es.
 *   2. Vuelve TRANSPARENTE todo el texto, sin tocar el maquetado.
 *   3. Hace una captura: eso es el fondo desnudo, con su cielo y su grano.
 *   4. Para cada texto, mira el percentil 98 de luminancia de los píxeles que
 *      tiene detrás y calcula el contraste contra ese píxel, no contra la media.
 *
 * El p98 y no el máximo: un píxel suelto de una estrella detrás de un hueco
 * entre letras no es el fondo de la letra. El p98 es el peor fondo real.
 *
 *     node scripts/contraste-sobre-fondo.mjs
 */

import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = process.env.URL || 'http://localhost:9002/';
const TAMANOS = [['escritorio', 1440, 900], ['movil', 390, 844]];

const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const tmp = mkdtempSync(join(tmpdir(), 'contraste-'));
const navegador = await puppeteer.launch({
    executablePath: CHROME, headless: 'shell',
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});

let fallosTotales = 0;

for (const [nombre, ancho, alto] of TAMANOS) {
    const pagina = await navegador.newPage();
    await pagina.setViewport({ width: ancho, height: alto, deviceScaleFactor: 1 });
    await pagina.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2500));
    await pagina.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y < h; y += window.innerHeight * 0.8) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); }
        window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 500));
    });

    const textos = await pagina.evaluate(() => {
        const salida = [];
        for (const el of document.querySelectorAll('body *')) {
            const propio = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
            if (!propio) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
            // Lo que vive dentro de un <details> cerrado NO está a la vista, pero
            // sigue dando un rectángulo. Sin esto se mide el fondo de un sitio
            // donde no hay nada escrito y salen fallos que no existen.
            if (el.checkVisibility && !el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true })) continue;
            if (el.closest('details:not([open])') && !el.matches('summary, summary *')) continue;
            // Lo marcado como decoración (aria-hidden) no es texto que haya que
            // leer: los códigos impresos en la tira de la portada se aclaran A
            // PROPÓSITO al pasar por detrás del titular. Las pautas de contraste
            // eximen la decoración pura, y medirla daba falsos fallos.
            if (el.closest('[aria-hidden="true"]')) continue;
            const r = el.getBoundingClientRect();
            if (r.width < 4 || r.height < 4) continue;
            const m = cs.color.match(/rgba?\(([^)]+)\)/);
            if (!m) continue;
            const p = m[1].split(',').map(Number);
            if (p.length > 3 && p[3] < 0.1) continue;
            salida.push({
                texto: propio.slice(0, 40),
                color: [p[0], p[1], p[2]],
                px: parseFloat(cs.fontSize),
                peso: parseInt(cs.fontWeight, 10) || 400,
                x: Math.round(r.left + window.scrollX),
                y: Math.round(r.top + window.scrollY),
                w: Math.round(r.width),
                h: Math.round(r.height),
            });
        }
        return salida;
    });

    // El texto se vuelve invisible SIN mover nada: sólo cambia el color.
    // El subrayado NO lleva el color del texto (se fija aparte), así que si no
    // se apaga también, sus píxeles se cuelan en la medida del fondo y dan un
    // falso fallo de 2:1 en todos los enlaces.
    // El texto pintado con degradado (background-clip: text, el oro metálico de
    // los nombres de las tomas) no se apaga con el color: el degradado sigue
    // ahí y se mediría el oro contra sí mismo. Se le quita el degradado; su
    // `color`, que es el tono más oscuro del cuerpo del oro, es el que se mide.
    await pagina.evaluate(() => {
        for (const el of document.querySelectorAll('body *')) {
            const cs = getComputedStyle(el);
            if (`${cs.backgroundClip} ${cs.webkitBackgroundClip}`.includes('text')) el.style.setProperty('background-image', 'none', 'important');
        }
    });
    await pagina.addStyleTag({ content: '*, *::before, *::after { color: transparent !important; text-shadow: none !important; -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important; caret-color: transparent !important; }' });
    await new Promise((r) => setTimeout(r, 400));

    const plano = join(tmp, `fondo-${nombre}.png`);
    await pagina.screenshot({ path: plano, fullPage: true });
    await pagina.close();

    const img = sharp(plano);
    const meta = await img.metadata();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const ch = info.channels;

    const fallos = [];
    for (const t of textos) {
        const x0 = Math.max(0, t.x), y0 = Math.max(0, t.y);
        const x1 = Math.min(info.width, t.x + t.w), y1 = Math.min(info.height, t.y + t.h);
        if (x1 <= x0 || y1 <= y0) continue;
        const Ls = [];
        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                const i = (y * info.width + x) * ch;
                Ls.push(lum([data[i], data[i + 1], data[i + 2]]));
            }
        }
        if (!Ls.length) continue;
        Ls.sort((a, b) => a - b);
        const peor = Ls[Math.floor(Ls.length * 0.98)];
        const rt = ratio(lum(t.color), peor);
        const grande = t.px >= 24 || (t.px >= 18.66 && t.peso >= 700);
        const minimo = grande ? 3 : 4.5;
        if (rt < minimo) {
            fallos.push({ texto: t.texto, px: Math.round(t.px), ratio: Math.round(rt * 100) / 100, minimo });
        }
    }

    console.log(`\n===== ${nombre.toUpperCase()} (${ancho}x${alto}) — fondo real, ${meta.width}x${meta.height} =====`);
    console.log(`${textos.length} textos medidos contra el pixel del percentil 98 que tienen detras`);
    if (fallos.length) {
        console.log(`FALLAN ${fallos.length}:`);
        console.log(JSON.stringify(fallos.slice(0, 12), null, 1));
    } else {
        console.log('todos pasan');
    }
    fallosTotales += fallos.length;
}

await navegador.close();
console.log(fallosTotales === 0 ? '\nOK: ningun texto falla contra su fondo real' : `\nFALLAN ${fallosTotales} en total`);
process.exit(fallosTotales === 0 ? 0 : 1);
