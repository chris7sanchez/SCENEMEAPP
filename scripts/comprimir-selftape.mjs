// EL VÍDEO DE EJEMPLO DEL SELFTAPE, LISTO PARA LA WEB.
//
// Por qué existe (14/11/2026): SELFTAPES.mp4 está en el Escritorio del iMac de
// Christian y pesa demasiado para subirlo por el chat o servirlo tal cual en la
// web. Este script lo deja en public/videos/selftapes-web.mp4 por debajo de
// 24 MB sin que se note en el móvil, más un póster para que la página no
// enseñe un rectángulo negro mientras carga.
//
// Cómo: H.264 (lo reproduce cualquier móvil) con calidad constante (CRF 20,
// preset lento) y un techo de bitrate calculado con la duración para que no
// pase de 24 MB. Sonido AAC 160 kb/s. Lado largo a 1920 px como mucho, sin
// cambiar la orientación. «faststart» para que empiece a sonar sin descargarse
// entero. Usa el ffmpeg que trae el proyecto (ffmpeg-static), así que no hay
// que instalar nada.
//
// Uso:  npm run comprimir-selftape                     (busca ~/Desktop/SELFTAPES.mp4)
//       npm run comprimir-selftape -- /ruta/al/video.mp4

import { execFileSync } from 'node:child_process';
import { existsSync, statSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const MB_OBJETIVO = 24;
const AUDIO_KBPS = 160;

const candidatos = process.argv[2]
    ? [process.argv[2]]
    : ['Desktop', 'Escritorio'].flatMap(d => ['SELFTAPES.mp4', 'SELFTAPES.MP4', 'SELFTAPES.mov'].map(f => join(homedir(), d, f)));
const origen = candidatos.find(f => existsSync(f));
if (!origen) {
    console.error('✗ No encuentro el vídeo. Busqué en:\n  ' + candidatos.join('\n  '));
    console.error('Pasa la ruta así:  npm run comprimir-selftape -- /ruta/al/video.mp4');
    process.exit(1);
}

let info = '';
try { execFileSync(ffmpeg, ['-hide_banner', '-i', origen], { stdio: ['ignore', 'ignore', 'pipe'] }); }
catch (e) { info = String(e.stderr ?? ''); }
const d = info.match(/Duration: (\d+):(\d+):([\d.]+)/);
if (!d) { console.error('✗ No se pudo leer la duración de', origen); process.exit(1); }
const segundos = +d[1] * 3600 + +d[2] * 60 + +d[3];

// Bitrate máximo de vídeo para que todo quepa en MB_OBJETIVO (con un 3 % de margen).
const kbpsTotal = Math.floor((MB_OBJETIVO * 8 * 1024 * 0.97) / segundos);
const kbpsVideo = Math.max(800, kbpsTotal - AUDIO_KBPS);

const destino = join('public', 'videos', 'selftapes-web.mp4');
const poster = join('public', 'videos', 'selftapes-poster.jpg');
mkdirSync(join('public', 'videos'), { recursive: true });

console.log(`▸ ${origen}  (${(statSync(origen).size / 1048576).toFixed(1)} MB, ${segundos.toFixed(0)} s)`);
console.log(`▸ Vídeo con techo de ${kbpsVideo} kb/s para quedar por debajo de ${MB_OBJETIVO} MB…`);

execFileSync(ffmpeg, [
    '-hide_banner', '-y', '-i', origen,
    // Lado largo a 1920 como mucho, sea horizontal o vertical; tamaños pares para H.264.
    '-vf', "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'",
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-maxrate', `${kbpsVideo}k`, '-bufsize', `${kbpsVideo * 2}k`,
    '-c:a', 'aac', '-b:a', `${AUDIO_KBPS}k`, '-ac', '2',
    '-movflags', '+faststart',
    destino,
], { stdio: 'inherit' });

// Póster: un fotograma a los 2 s (o al principio si es muy corto).
execFileSync(ffmpeg, ['-hide_banner', '-y', '-ss', String(Math.min(2, segundos / 2)), '-i', destino, '-frames:v', '1', '-q:v', '3', poster], { stdio: 'ignore' });

const mb = statSync(destino).size / 1048576;
console.log(`✓ ${destino}: ${mb.toFixed(1)} MB`);
console.log(`✓ ${poster}`);
if (mb > 25) console.log('⚠ Pasa de 25 MB: avisa a Claude para ajustarlo.');
