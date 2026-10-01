// LOS VÍDEOS DE LA WEB, EN HD, DESDE LOS ORIGINALES.
//
// Por qué existe (01/10/2026): los cortes de la portada (public/videos/*-loop.mp4)
// estaban hechos desde copias de 960x540 a 0,2-0,4 Mb/s, y en la web se ven a
// hasta 1920 px de ancho; en una pantalla Retina eso es estirarlos 2-4 veces y
// se pixelaban. Los originales buenos están en el Mac de Christian, en
// video_originals_backup/ (8,6 GB, fuera de git y del despliegue).
//
// Qué hace: para cada corte busca su original en la carpeta (por el nombre),
// encuentra el MISMO momento comparando fotogramas con el corte actual (así no
// cambia lo que se ve, sólo la calidad), y lo vuelve a sacar a 1920x1080
// (o al tamaño del original si es menor) con buena calidad. Rehace también el
// póster. Si un corte ya está en HD, lo deja.
//
// Uso:  node scripts/videos-hd.mjs [carpeta]      (por defecto video_originals_backup)
//       node scripts/videos-hd.mjs [carpeta] --forzar
// Lo llama solo `npm run publicar` si la carpeta existe.
//
// Los segundos de inicio (`desde`) están MEDIDOS: se buscó cada corte dentro de
// su versión -web.mp4 fotograma a fotograma y coincidían exactos.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync, renameSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const CORTES = [
    { loop: 'AMANDA', claves: ['amanda'], desde: 40 },
    { loop: 'SHOGUN', claves: ['shogun', 'rodrigues'], desde: 30 },
    { loop: 'OLIVER', claves: ['oliver'], desde: 12 },
    { loop: 'MIX-cine', claves: ['mix'], desde: 10 },
    { loop: 'MUDANZA', claves: ['mudanza'], desde: 25 },
    { loop: 'Mel_cuban', claves: ['mel_cuban', 'mel cuban', 'cuban'], desde: 15 },
    { loop: 'SONIA_DORADO', claves: ['sonia'], desde: 20 },
    // Silvia: el original trae franjas negras arriba y abajo y un fundido de
    // entrada; el corte se hizo quitando las dos cosas.
    { loop: 'SILVIA', claves: ['silvia'], desde: 0.25, recorte: 'crop=1798:1012:61:34' },
];

const ALTO_HD = 1080;
const carpeta = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'video_originals_backup';
const forzar = process.argv.includes('--forzar');

function sondear(f) {
    let salida = '';
    try { execFileSync(ffmpeg, ['-hide_banner', '-i', f], { stdio: ['ignore', 'ignore', 'pipe'] }); }
    catch (e) { salida = String(e.stderr ?? ''); }
    const dur = salida.match(/Duration: (\d+):(\d+):([\d.]+)/);
    const res = salida.match(/Video:.*?(\d{3,5})x(\d{3,5})/);
    if (!dur || !res) return null;
    return { duracion: +dur[1] * 3600 + +dur[2] * 60 + +dur[3], ancho: +res[1], alto: +res[2] };
}

/** Huella del vídeo: fotogramas diminutos en gris, a 24 por segundo. */
const W = 48, H = 27, N = W * H;
function huella(f, desde, segundos, recorte) {
    const vf = [recorte, `scale=${W}:${H},format=gray,fps=24`].filter(Boolean).join(',');
    const args = ['-v', 'error', '-ss', String(Math.max(0, desde)), '-i', f, '-t', String(segundos), '-vf', vf, '-f', 'rawvideo', '-'];
    return execFileSync(ffmpeg, args, { maxBuffer: 1 << 28 });
}

/** El segundo exacto del original en el que empieza el corte (y cuánto se parece). */
function alinear(original, corte, c) {
    const ref = huella(corte, 0, 1, null);
    const ventana = 3;
    const desdeVentana = Math.max(0, c.desde - ventana);
    const A = huella(original, desdeVentana, ventana * 2 + 1, c.recorte);
    const nl = ref.length / N, na = A.length / N;
    let mejor = [Infinity, 0];
    for (let i = 0; i + nl <= na; i++) {
        let d = 0;
        for (let k = 0; k < ref.length; k += 3) d += Math.abs(A[i * N + k] - ref[k]);
        if (d < mejor[0]) mejor = [d, i];
    }
    return { desde: desdeVentana + mejor[1] / 24, error: mejor[0] / (ref.length / 3) };
}

function archivos(dir) {
    const out = [];
    for (const n of readdirSync(dir)) {
        if (n.startsWith('.')) continue;
        const p = join(dir, n);
        const st = statSync(p);
        if (st.isDirectory()) out.push(...archivos(p));
        else if (st.size > 2 * 1024 * 1024) out.push(p);
    }
    return out;
}

if (!existsSync(carpeta)) {
    console.log(`   (no hay ${carpeta}: los vídeos se quedan como están)`);
    process.exit(0);
}

const todos = archivos(carpeta);
const resumen = [];

for (const c of CORTES) {
    const corte = `public/videos/${c.loop}-loop.mp4`;
    const poster = `public/videos/${c.loop}-loop-poster.jpg`;
    const actual = existsSync(corte) ? sondear(corte) : null;
    if (!actual) { resumen.push([c.loop, 'sin corte actual en public/videos']); continue; }
    if (actual.alto >= ALTO_HD && !forzar) { resumen.push([c.loop, `ya en HD (${actual.ancho}x${actual.alto})`]); continue; }

    const candidatos = todos
        .filter((f) => c.claves.some((k) => basename(f).toLowerCase().includes(k)))
        .map((f) => ({ f, info: sondear(f) }))
        // medio segundo de margen: hay cortes que llegan justo hasta el final del original
        .filter((x) => x.info && x.info.alto > actual.alto && x.info.duracion > c.desde + actual.duracion - 0.5);
    if (!candidatos.length) { resumen.push([c.loop, 'no encuentro un original mejor']); continue; }

    let elegido = null;
    for (const x of candidatos) {
        try {
            const a = alinear(x.f, corte, c);
            if (!elegido || a.error < elegido.alineado.error) elegido = { ...x, alineado: a };
        } catch { /* fichero que ffmpeg no lee: se ignora */ }
    }
    if (!elegido || elegido.alineado.error > 14) {
        resumen.push([c.loop, 'el original no coincide con el corte; no lo toco']);
        continue;
    }

    const tmp = corte.replace('.mp4', '.tmp.mp4');
    const vf = [c.recorte, `scale=-2:'min(${ALTO_HD},ih)':flags=lanczos`, 'fps=24', 'format=yuv420p', 'setsar=1'].filter(Boolean).join(',');
    execFileSync(ffmpeg, [
        '-v', 'error', '-y', '-ss', elegido.alineado.desde.toFixed(3), '-i', elegido.f, '-t', actual.duracion.toFixed(3),
        '-map', '0:v:0', '-an', '-dn', '-sn', '-map_metadata', '-1', '-vf', vf,
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-maxrate', '6M', '-bufsize', '12M',
        '-profile:v', 'high', '-movflags', '+faststart', tmp,
    ]);
    renameSync(tmp, corte);
    rmSync(poster, { force: true });
    execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', corte, '-frames:v', '1', '-q:v', '3', poster]);
    const nuevo = sondear(corte);
    resumen.push([c.loop, `HD ${nuevo.ancho}x${nuevo.alto} desde «${basename(elegido.f)}» (seg. ${elegido.alineado.desde.toFixed(2)})`]);
}

for (const [n, r] of resumen) console.log(`   ${n.padEnd(13)} ${r}`);
