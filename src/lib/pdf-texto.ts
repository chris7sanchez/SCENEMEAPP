// Reconstruir el TEXTO de un PDF a partir de trozos sueltos con coordenadas.
//
// Por qué existe esto. Un PDF no guarda párrafos: guarda trozos de texto con
// una posición. Muchos —los que salen de Final Draft, InDesign o de cualquier
// fuente con kerning— entregan UN TROZO POR LETRA. Si al juntarlos se pone un
// espacio detrás de cada uno, "ANA" sale como "A N A", y la voz del ensayo lo
// lee deletreando. Eso es exactamente lo que pasaba.
//
// Aquí no se adivinan unidades ni tamaños de fuente: se MIDE el propio PDF.
// Lógica pura y sin dependencias, para poder probarla sin abrir un PDF.

export interface TrozoPdf {
    x: number;
    y: number;
    texto: string;
}

/** Dos trozos están en la misma línea si sus «y» se parecen tanto como esto. */
const TOLERANCIA_LINEA = 0.35;

// LA SANGRÍA HAY QUE CONSERVARLA. Un guion no separa la acción del diálogo con
// renglones en blanco —un PDF no trae ninguno— sino con la COLUMNA en la que
// empieza cada línea: la acción al margen, el diálogo metido hacia dentro y el
// nombre del personaje más adentro todavía. Si se tira esa información, el
// ensayo le cuelga a ANA la frase "Luis deja las llaves sobre la mesa".
//
// Como las unidades de un PDF no son las de nadie, no se traducen a caracteres
// reales: se reparte lo que hay entre el margen izquierdo y la línea más
// metida de la página sobre una escala fija. Al parser sólo le hace falta saber
// qué líneas vuelven al margen, no en qué columna exacta estaban.

/** Escala de la sangría reconstruida: 0 en el margen, esto en lo más metido. */
const SANGRIA_MAX = 16;
/** Por debajo de esta variación, los márgenes son ruido y no maquetación. */
const SANGRIA_MINIMA = 0.15;

/** Mediana: resiste los valores disparatados mucho mejor que la media. */
function mediana(xs: number[]): number {
    if (!xs.length) return 0;
    const orden = [...xs].sort((a, b) => a - b);
    const m = Math.floor(orden.length / 2);
    return orden.length % 2 ? orden[m] : (orden[m - 1] + orden[m]) / 2;
}

/**
 * Junta los trozos de UNA línea, ya ordenados por x.
 *
 * El truco para no depender de la escala del PDF: se calcula el ancho de un
 * carácter A PARTIR DE LA PROPIA LÍNEA —cuánto avanza la x por cada letra— y
 * se mete un espacio sólo cuando el hueco entre dos trozos es mayor que lo que
 * ocupa el texto del primero. Funciona igual si el PDF entrega letra a letra
 * que si entrega palabras enteras, porque el cálculo se normaliza por longitud.
 */
export function juntarLinea(trozos: TrozoPdf[]): string {
    if (trozos.length === 0) return '';
    if (trozos.length === 1) return trozos[0].texto;

    // Hay DOS clases de PDF y no se pueden tratar igual:
    //
    //  - Los que entregan LETRA A LETRA. Aquí el espacio no viene como trozo:
    //    hay que deducirlo del hueco entre letras, midiendo cuánto avanza la x
    //    por carácter en esta misma línea. Es el caso que se leía deletreado.
    //
    //  - Los que entregan PALABRAS (o frases). Aquí el espacio ya está metido
    //    dentro del avance de cada trozo, así que medir huecos da cero y las
    //    palabras saldrían pegadas. Entre trozo y trozo va un espacio, que es
    //    además lo que hacía el lector viejo y funcionaba bien en este caso.
    const sueltas = trozos.filter(t => t.texto.trim().length === 1).length;
    const letraALetra = sueltas / trozos.length > 0.6;

    let anchoChar = 0;
    if (letraALetra) {
        const avances: number[] = [];
        for (let i = 0; i < trozos.length - 1; i++) {
            const largo = Math.max(1, trozos[i].texto.length);
            const d = trozos[i + 1].x - trozos[i].x;
            if (d > 0) avances.push(d / largo);
        }
        anchoChar = mediana(avances);
    }

    let salida = trozos[0].texto;
    for (let i = 1; i < trozos.length; i++) {
        const previo = trozos[i - 1];
        const actual = trozos[i];

        // Si el propio PDF ya trae el espacio, no se duplica.
        const yaSeparado = /\s$/.test(salida) || /^\s/.test(actual.texto);

        let separar: boolean;
        if (yaSeparado) {
            separar = false;
        } else if (letraALetra && anchoChar > 0) {
            const ocupado = previo.texto.length * anchoChar;
            const hueco = (actual.x - previo.x) - ocupado;
            // Medio carácter de hueco ya es un espacio de verdad. Por debajo de
            // eso son letras pegadas de la misma palabra.
            separar = hueco > anchoChar * 0.5;
        } else {
            separar = true;
        }

        salida += (separar ? ' ' : '') + actual.texto;
    }
    return salida;
}

/**
 * Agrupa los trozos de una página en líneas y las devuelve en orden de lectura.
 * Se agrupa por «y» con tolerancia porque dos letras de la misma línea pueden
 * diferir en una millonésima, y comparar decimales con igualdad exacta las
 * separaba en líneas distintas.
 */
export function reconstruirPagina(trozos: TrozoPdf[]): string {
    if (!trozos.length) return '';

    const orden = [...trozos].sort((a, b) => (a.y !== b.y ? a.y - b.y : a.x - b.x));

    const lineas: TrozoPdf[][] = [];
    let actual: TrozoPdf[] = [orden[0]];
    let yLinea = orden[0].y;

    for (let i = 1; i < orden.length; i++) {
        if (Math.abs(orden[i].y - yLinea) <= TOLERANCIA_LINEA) {
            actual.push(orden[i]);
        } else {
            lineas.push(actual);
            actual = [orden[i]];
            yLinea = orden[i].y;
        }
    }
    lineas.push(actual);

    const filas = lineas.map(l => [...l].sort((a, b) => a.x - b.x));

    // ¿Esta página está MAQUETADA, o es prosa corrida? Si todas las líneas
    // arrancan casi en el mismo sitio, no hay sangrías que conservar y estirar
    // esa diferencia mínima hasta la escala completa se inventaría una columna
    // de diálogo donde sólo hay un párrafo con la primera línea entrada.
    const inicios = filas.map(f => f[0].x);
    const izquierda = Math.min(...inicios);
    const extension = Math.max(...inicios) - izquierda;
    const xs = trozos.map(t => t.x);
    const anchoTexto = Math.max(...xs) - Math.min(...xs);
    const maqueta = extension > 0 && anchoTexto > 0 && extension >= anchoTexto * SANGRIA_MINIMA;

    return filas
        .map(f => {
            const texto = juntarLinea(f).trimEnd();
            if (!texto || !maqueta) return texto;
            const sangria = Math.round(((f[0].x - izquierda) / extension) * SANGRIA_MAX);
            return ' '.repeat(sangria) + texto;
        })
        .join('\n');
}

/**
 * ¿Esto huele a texto deletreado?
 *
 * Sirve para no entregar en silencio un guion ilegible: si la extracción salió
 * mal, es mejor decirlo que dejar que la voz del ensayo se ponga a recitar
 * letras sueltas y que nadie entienda por qué.
 */
export function pareceDeletreado(texto: string): boolean {
    const piezas = (texto || '').trim().split(/\s+/).filter(Boolean);
    if (piezas.length < 40) return false; // muy poco texto para juzgar
    const sueltas = piezas.filter(p => p.replace(/[^\p{L}\p{N}]/gu, '').length <= 1).length;
    return sueltas / piezas.length > 0.6;
}
