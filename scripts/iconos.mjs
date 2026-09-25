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
 * Margen transparente que se le pone al maestro antes de recortar. El cuadrado
 * del icono se centra en el marco, y si el marco no es cuadrado ese cuadrado
 * puede salirse de la imagen por un lado. Con este colchón, lo que se sale es
 * transparente en vez de un error.
 */
const COLCHON = 0.1;

/**
 * Dónde está el marco, en uno de los dos maestros que existen.
 *
 *   - Con las esquinas TRANSPARENTES (el maestro ya viene recortado a la
 *     forma del icono): el marco es exactamente donde empieza lo opaco. No hay
 *     nada que adivinar.
 *   - Con fondo NEGRO alrededor: se cuentan los píxeles dorados por filas y
 *     columnas. Los lados del marco son rectas largas y destacan sobre los
 *     destellos; se toman la primera y la última que superan el 10%.
 */
function bordes(data, W, H) {
    const alfa = (x, y) => data[(y * W + x) * 4 + 3];
    const esquinasTransparentes = [alfa(0, 0), alfa(W - 1, 0), alfa(0, H - 1), alfa(W - 1, H - 1)]
        .every(a => a < 20);

    if (esquinasTransparentes) {
        let izq = W, der = 0, arriba = H, abajo = 0;
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                if (alfa(x, y) <= 20) continue;
                if (x < izq) izq = x; if (x > der) der = x;
                if (y < arriba) arriba = y; if (y > abajo) abajo = y;
            }
        }
        return { izq, der, arriba, abajo, como: 'por la transparencia' };
    }

    const filas = new Array(H).fill(0);
    const columnas = new Array(W).fill(0);
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4;
            if (esOro(data[i], data[i + 1], data[i + 2])) { filas[y]++; columnas[x]++; }
        }
    }
    const extremos = (perfil, umbral) => {
        let a = 0, z = perfil.length - 1;
        while (a < perfil.length && perfil[a] < umbral) a++;
        while (z > a && perfil[z] < umbral) z--;
        return [a, z];
    };
    const [arriba, abajo] = extremos(filas, H * 0.1);
    const [izq, der] = extremos(columnas, W * 0.1);
    return { izq, der, arriba, abajo, como: 'por el oro del marco' };
}

/**
 * El maestro con su colchón, y el cuadrado del icono dentro de él.
 *
 * El marco no tiene por qué salir perfectamente cuadrado del generador de
 * imágenes; se toma el lado mayor y se centra, que es lo que el ojo espera.
 * Nunca se estira: un icono deformado se nota más que uno con un filo vacío.
 */
async function marcoDorado() {
    const { data, info } = await sharp(MAESTRO).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: W, height: H } = info;
    const { izq, der, arriba, abajo, como } = bordes(data, W, H);

    const cx = (izq + der) / 2, cy = (arriba + abajo) / 2;
    const lado = Math.max(der - izq + 1, abajo - arriba + 1) * 1.02; // 1% de aire: que el trazo no se corte al redondear
    const P = Math.round(Math.max(W, H) * COLCHON);

    const lienzo = await sharp(MAESTRO).ensureAlpha()
        .extend({ top: P, bottom: P, left: P, right: P, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png().toBuffer();

    return {
        lienzo,
        como,
        caja: {
            left: Math.round(P + cx - lado / 2),
            top: Math.round(P + cy - lado / 2),
            width: Math.round(lado),
            height: Math.round(lado),
        },
    };
}

/**
 * El icono recortado al marco, a la resolución que se pida.
 *
 * POR QUÉ LOS PEQUEÑOS SE REDUCEN DE OTRA MANERA
 *
 * Reducir es hacer la media de los píxeles que se juntan. Y la media hecha
 * sobre los valores tal cual vienen del fichero está mal: esos valores no son
 * cantidades de luz, son luz ya codificada para la pantalla (gamma). Al
 * promediarlos, un trazo dorado brillante sobre negro -que es todo este icono-
 * sale mucho más apagado de lo que debería. De ahí la mancha parda.
 *
 * `gamma(2.2)` deshace esa codificación antes de encoger y la vuelve a poner
 * después, así que la media se hace sobre luz de verdad. El marco sigue siendo
 * dorado a 32 píxeles en vez de marrón sucio. Es la misma cuenta que hace
 * cualquier motor de render; aquí sólo hay que pedirla.
 *
 * A 16 píxeles, además, la imagen se aclara tanto al promediar que el negro
 * deja de ser negro y el icono pierde su silueta. Un empujón de contraste lo
 * devuelve: el fondo vuelve a ser oscuro y el marco recorta contra él.
 */
const recorte = ({ lienzo, caja }, tam) => {
    const img = sharp(lienzo).extract(caja);
    if (tam >= 48) return img.resize(tam, tam, { fit: 'cover', kernel: 'lanczos3' });

    const pequeno = img.gamma(2.2).resize(tam, tam, { fit: 'cover', kernel: 'lanczos3' });
    // El contraste, sólo al color. Aplicado también a la transparencia, se
    // comería el borde suavizado de las esquinas redondeadas.
    return (tam <= 16 ? pequeno.linear([1.35, 1.35, 1.35, 1], [-40, -40, -40, 0]) : pequeno)
        .sharpen({ sigma: 0.5 });
};

/** El icono dentro de un lienzo negro más grande: deja margen para las máscaras. */
async function conMargen(caja, tam, proporcionDelDibujo) {
    const dentro = Math.round(tam * proporcionDelDibujo);
    const hueco = Math.round((tam - dentro) / 2);
    return sharp({
        create: { width: tam, height: tam, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    }).composite([{ input: await recorte(caja, dentro).png().toBuffer(), top: hueco, left: hueco }]);
}

const caja = await marcoDorado();
console.log(`Marco encontrado ${caja.como}: ${caja.caja.width}×${caja.caja.height}`);

const hechos = [];
const anota = (f, info) => hechos.push(`  ${f.padEnd(36)} ${info}`);

// Pestaña del navegador y Android: el icono entero, de borde a borde.
for (const [fichero, tam] of [
    ['favicon-16x16.png', 16],
    ['favicon-32x32.png', 32],
    ['android-chrome-192x192.png', 192],
    ['android-chrome-512x512.png', 512],
]) {
    await recorte(caja, tam).png({ compressionLevel: 9 }).toFile(join(PUBLIC, fichero));
    anota(fichero, `${tam}×${tam}, marco al borde`);
}

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
