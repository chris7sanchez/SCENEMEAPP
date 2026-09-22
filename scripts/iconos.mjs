/**
 * EL ICONO, EN TODOS LOS TAMAÑOS QUE PIDE EL MUNDO.
 *
 * De un solo maestro (brand/icono-maestro.webp) salen los siete ficheros que
 * usan la web, iOS y Android. Existe como script y no "a mano una vez" porque
 * el icono se cambia cada pocos meses y hacerlo a ojo garantiza que alguno se
 * quede viejo: la pestaña con el logo de hace dos versiones es un clásico.
 *
 *     node scripts/iconos.mjs
 *
 * DÓNDE ESTÁ EL BORDE DEL ICONO
 *
 * El maestro es una imagen cuadrada con el dibujo dentro de un marco dorado de
 * esquinas redondeadas, y negro alrededor. El borde del icono es EL MARCO, no
 * el borde de la imagen. Así que aquí no se recorta por porcentajes: se busca
 * el marco mirando los píxeles dorados y se recorta por donde está de verdad.
 * Si mañana el maestro viene con más o menos aire, esto sigue acertando.
 *
 * POR QUÉ NO TODOS LOS FICHEROS LLEVAN EL MISMO RECORTE
 *
 *   - Favicon y Android "any": el marco llega al borde. Es el icono entero.
 *   - iOS (apple-touch-icon): iOS recorta TODO icono con su propia esquina
 *     redondeada. Si el marco llegara al borde, iOS le comería las cuatro
 *     esquinas. Se deja un pequeño margen negro para que el marco sobreviva.
 *   - Android "maskable": Android puede recortar el icono en CÍRCULO. Ahí el
 *     dibujo tiene que caber dentro de ese círculo o se queda sin marco. Por
 *     eso ese fichero va aparte y más pequeño dentro del lienzo: es el precio
 *     de que en un móvil con iconos redondos no salga cortado.
 *
 * El manifest declara cada uno con su `purpose`. Antes los dos PNG de Android
 * decían "any maskable" a la vez, que es prometer las dos cosas con un fichero
 * que sólo cumple una.
 */

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAESTRO = join(RAIZ, 'brand', 'icono-maestro.webp');
const PUBLIC = join(RAIZ, 'public');

/** ¿Este píxel es del marco dorado? Claro, cálido y con poco azul. */
const esOro = (r, g, b) => r > 120 && g > 80 && b < g && r - b > 45;

/**
 * El cuadrado que ocupa el marco dorado. Se cuenta cuántos píxeles dorados hay
 * en cada fila y en cada columna: los lados del marco son rectas largas, así
 * que destacan sobre los destellos y el reflejo del objetivo. Se toma la
 * primera y la última que superan el umbral.
 */
async function marcoDorado() {
    const { data, info } = await sharp(MAESTRO).raw().toBuffer({ resolveWithObject: true });
    const { width: W, height: H, channels: C } = info;
    const filas = new Array(H).fill(0);
    const columnas = new Array(W).fill(0);

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const i = (y * W + x) * C;
            if (esOro(data[i], data[i + 1], data[i + 2])) { filas[y]++; columnas[x]++; }
        }
    }

    // Un 10% de la anchura basta para distinguir un lado del marco de un
    // destello suelto, y no tanto como para perderse la parte donde el trazo
    // se difumina.
    const extremos = (perfil, umbral) => {
        let a = 0, z = perfil.length - 1;
        while (a < perfil.length && perfil[a] < umbral) a++;
        while (z > a && perfil[z] < umbral) z--;
        return [a, z];
    };
    const [arriba, abajo] = extremos(filas, H * 0.1);
    const [izq, der] = extremos(columnas, W * 0.1);

    // El marco no tiene por qué salir perfectamente cuadrado del generador de
    // imágenes; se toma el lado mayor y se centra, que es lo que el ojo espera.
    const cx = (izq + der) / 2, cy = (arriba + abajo) / 2;
    const lado = Math.max(der - izq, abajo - arriba) * 1.02; // 1% de aire: que el trazo no se corte al redondear
    const mitad = lado / 2;

    return {
        left: Math.max(0, Math.round(cx - mitad)),
        top: Math.max(0, Math.round(cy - mitad)),
        width: Math.min(Math.round(lado), W, H),
        height: Math.min(Math.round(lado), W, H),
    };
}

/**
 * El icono recortado al marco, a la resolución que se pida.
 *
 * Por debajo de 48 px el dibujo tiene más detalle del que caben píxeles y al
 * reducir se apelmaza en una mancha parda. Un poco de color y de realce no lo
 * arregla -eso pide otro dibujo, más simple-, pero rescata el contorno del
 * marco, que es lo único que se llega a reconocer en una pestaña.
 */
const recorte = (caja, tam) => {
    const img = sharp(MAESTRO).extract(caja).resize(tam, tam, { fit: 'cover', kernel: 'lanczos3' });
    return tam < 48 ? img.modulate({ saturation: 1.25 }).sharpen({ sigma: 0.6 }) : img;
};

/** El icono dentro de un lienzo negro más grande: deja margen para las máscaras. */
async function conMargen(caja, tam, proporcionDelDibujo) {
    const dentro = Math.round(tam * proporcionDelDibujo);
    const hueco = Math.round((tam - dentro) / 2);
    return sharp({
        create: { width: tam, height: tam, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    }).composite([{ input: await recorte(caja, dentro).png().toBuffer(), top: hueco, left: hueco }]);
}

/**
 * LA MARCA A TAMAÑO DE PESTAÑA.
 *
 * El icono bueno no sirve aquí. A 32 píxeles tiene un objetivo, una claqueta,
 * una tira de película y dos líneas de texto: más cosas que píxeles, y todas
 * juntas dan una mancha parda que no se reconoce. Se probó recortando el
 * objetivo del propio maestro, pero la claqueta lo cruza y el rótulo entra por
 * abajo: no hay reencuadre que lo salve.
 *
 * Así que la pestaña lleva su propio dibujo: el diafragma de la cámara, que es
 * la pieza que ya manda en el icono grande, hecho con cuatro formas y el mismo
 * oro. Se dibuja en vector y no se recorta de una foto porque a este tamaño
 * cada píxel se decide a mano o se pierde.
 *
 * A 16 píxeles ni siquiera cabe el marco: el trazo dorado y el hueco negro de
 * dentro se comen tres de los dieciséis píxeles de ancho y el diafragma se
 * queda en nada. A ese tamaño el diafragma va a sangre. Es lo que hace todo el
 * mundo, y por esto.
 */
function marcaSimple(conMarco) {
    const oro = `<linearGradient id="oro" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFF0BE"/><stop offset="38%" stop-color="#F0C34A"/>
        <stop offset="70%" stop-color="#C9922A"/><stop offset="100%" stop-color="#8A5E12"/>
    </linearGradient>`;

    // Seis palas, como un diafragma de verdad: cada una va del borde al centro
    // y deja a la siguiente el sitio justo para que quede la estrella del medio.
    const diafragma = (cx, cy, fuera, dentro) => {
        let d = '';
        for (let k = 0; k < 6; k++) {
            const a0 = (k * 60 - 90) * Math.PI / 180;
            const a1 = ((k + 1) * 60 - 90) * Math.PI / 180;
            const p = (ang, r) => `${(cx + r * Math.cos(ang)).toFixed(1)} ${(cy + r * Math.sin(ang)).toFixed(1)}`;
            d += `<path d="M${p(a0, fuera)} L${p(a1, fuera)} L${p(a1, dentro)} Z"`
               + ` fill="url(#oro)" stroke="#1a1100" stroke-width="6" stroke-linejoin="round"/>`;
        }
        return d;
    };

    const cuerpo = conMarco
        ? `<rect x="14" y="14" width="484" height="484" rx="108" fill="#000"/>
           <rect x="14" y="14" width="484" height="484" rx="108" fill="none" stroke="url(#oro)" stroke-width="26"/>
           ${diafragma(256, 256, 168, 46)}`
        : `<rect width="512" height="512" rx="112" fill="#000"/>${diafragma(256, 256, 214, 58)}`;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">`
         + `<defs>${oro}</defs>${cuerpo}</svg>`;
}

const caja = await marcoDorado();
console.log(`Marco encontrado: ${caja.width}×${caja.height} en (${caja.left}, ${caja.top})`);

const hechos = [];
const anota = (f, info) => hechos.push(`  ${f.padEnd(36)} ${info}`);

// Android: el icono entero, de borde a borde.
for (const [fichero, tam] of [
    ['android-chrome-192x192.png', 192],
    ['android-chrome-512x512.png', 512],
]) {
    await recorte(caja, tam).png({ compressionLevel: 9 }).toFile(join(PUBLIC, fichero));
    anota(fichero, `${tam}×${tam}, marco al borde`);
}

// La pestaña no: ahí va el dibujo simple.
await sharp(Buffer.from(marcaSimple(true)))
    .resize(32, 32).png({ compressionLevel: 9 }).toFile(join(PUBLIC, 'favicon-32x32.png'));
anota('favicon-32x32.png', '32×32, marca simple con marco');

await sharp(Buffer.from(marcaSimple(false)))
    .resize(16, 16).png({ compressionLevel: 9 }).toFile(join(PUBLIC, 'favicon-16x16.png'));
anota('favicon-16x16.png', '16×16, marca simple sin marco (no cabe)');

// iOS redondea las esquinas por su cuenta: hay que dejarle sitio.
await (await conMargen(caja, 180, 0.9)).png({ compressionLevel: 9 }).toFile(join(PUBLIC, 'apple-touch-icon.png'));
anota('apple-touch-icon.png', '180×180, 5% de margen (iOS recorta las esquinas)');

// Android con iconos redondos: el dibujo tiene que caber en el círculo.
await (await conMargen(caja, 512, 0.68)).png({ compressionLevel: 9 }).toFile(join(PUBLIC, 'android-chrome-maskable-512x512.png'));
anota('android-chrome-maskable-512x512.png', '512×512, dibujo al 68% (cabe en el círculo)');

// La cortinilla de arranque pide el icono en WebP: es lo primero que se
// descarga en cada página y en PNG pesaba diez veces más.
await recorte(caja, 512).webp({ quality: 80 }).toFile(join(PUBLIC, 'splash-logo.webp'));
anota('splash-logo.webp', `512×512, WebP para la cortinilla`);

console.log('\nGenerados:');
console.log(hechos.join('\n'));
