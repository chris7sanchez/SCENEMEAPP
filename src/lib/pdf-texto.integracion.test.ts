// Prueba de verdad: se FABRICA un PDF y se comprueba que el guion sale legible.
//
// Las pruebas de al lado (pdf-texto.test.ts) usan trozos inventados. Ésta usa
// un PDF real, generado con la misma librería que ya usa la app, y lo lee con
// pdf2json — el camino exacto por el que el guion salía deletreado.

import { describe, it, expect } from 'vitest';
import { jsPDF } from 'jspdf';
import PDFParser from 'pdf2json';
import { reconstruirPagina, pareceDeletreado, type TrozoPdf } from './pdf-texto';
import { parseScriptScenes, speakersOfScenes } from './scene-script';

/** Un guion corto, maquetado como se maqueta un guion: cada cosa en su sangría. */
const GUION: [string, number][] = [
    ['1. INT. COCINA - NOCHE', 20],
    ['Ana friega. Entra Luis, mojado.', 20],
    ['ANA', 60],
    ['¿De verdad pensabas que no me iba a enterar?', 40],
    ['LUIS', 60],
    ['No quería hacerte daño.', 40],
    ['2. EXT. CALLE - AMANECER', 20],
    ['LUIS', 60],
    ['Debí decírselo.', 40],
];

function construirPdf(): Buffer {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    doc.setFont('courier', 'normal');
    doc.setFontSize(12);
    let y = 80;
    for (const [linea, x] of GUION) { doc.text(linea, x, y); y += 24; }
    return Buffer.from(doc.output('arraybuffer'));
}

function leerTrozos(buf: Buffer): Promise<TrozoPdf[][]> {
    return new Promise((res, rej) => {
        const p = new PDFParser(null, true);
        p.on('pdfParser_dataError', (e: unknown) => rej(e));
        p.on('pdfParser_dataReady', (d: { Pages?: unknown[] }) => {
            const paginas = (d?.Pages ?? []) as Array<{ Texts?: Array<{ x: number; y: number; R?: Array<{ T?: string }> }> }>;
            res(paginas.map(pg => (pg.Texts ?? []).map(t => ({
                x: t.x, y: t.y, texto: decodeURIComponent(t.R?.[0]?.T ?? ''),
            }))));
        });
        p.parseBuffer(buf);
    });
}

/** La reconstrucción VIEJA, tal cual estaba: un espacio detrás de cada trozo. */
function comoAntes(paginas: TrozoPdf[][]): string {
    let fullText = '';
    for (const page of paginas) {
        const blocks = [...page].sort((a, b) => (a.y !== b.y ? a.y - b.y : a.x - b.x));
        let lastY = -1;
        for (const b of blocks) {
            if (lastY !== -1 && Math.abs(b.y - lastY) > 0.5) fullText += '\n';
            fullText += b.texto + ' ';
            lastY = b.y;
        }
        fullText += '\n\n';
    }
    return fullText;
}

describe('leer un PDF de guion de verdad', () => {
    it('el texto sale en frases, no en letras sueltas', async () => {
        const paginas = await leerTrozos(construirPdf());
        const texto = paginas.map(reconstruirPagina).join('\n\n');

        expect(pareceDeletreado(texto)).toBe(false);
        expect(texto).toContain('¿De verdad pensabas que no me iba a enterar?');
        expect(texto).toContain('No quería hacerte daño.');
        expect(texto).toContain('INT. COCINA');
    }, 30000);

    it('el ensayo reconoce escenas y personajes', async () => {
        const paginas = await leerTrozos(construirPdf());
        const escenas = parseScriptScenes(paginas.map(reconstruirPagina).join('\n\n'));

        expect(speakersOfScenes(escenas)).toEqual(['ANA', 'LUIS']);
        expect(escenas.length).toBe(2);
        const dialogo = escenas.flatMap(e => e.turns.filter(t => t.kind === 'dialogo'));
        expect(dialogo.map(t => t.text)).toEqual([
            '¿De verdad pensabas que no me iba a enterar?',
            'No quería hacerte daño.',
            'Debí decírselo.',
        ]);
    }, 30000);

    it('no arrastra el espacio de más que ponía el lector viejo', async () => {
        const paginas = await leerTrozos(construirPdf());
        const antes = comoAntes(paginas);
        const ahora = paginas.map(reconstruirPagina).join('\n\n');

        // AVISO SOBRE EL ALCANCE DE ESTA PRUEBA: el PDF que genera jsPDF sale
        // con un trozo POR LÍNEA, no por letra, así que aquí el lector viejo
        // tampoco deletreaba. Lo único que se demuestra con este fichero es que
        // ya no se cuela un espacio detrás de cada trozo.
        //
        // El caso que de verdad rompía —un trozo por LETRA— no se reproduce con
        // esta librería; está cubierto con trozos hechos a mano en
        // pdf-texto.test.ts. Si algún día aparece un PDF real que deletree,
        // vale la pena guardarlo como fixture aquí.
        expect(paginas.flat().every(t => t.texto.length > 1)).toBe(true);
        expect(ahora.length).toBeLessThan(antes.length);
        expect(ahora).not.toMatch(/ \n/); // sin espacios colgando al final de línea
    }, 30000);
});
