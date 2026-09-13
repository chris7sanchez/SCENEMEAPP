'use server';

import PDFParser from 'pdf2json';
import { reconstruirPagina, pareceDeletreado, type TrozoPdf } from '@/lib/pdf-texto';

// Sacar el texto de un PDF, con DOS motores y en este orden:
//
//  1) pdf-parse, que es el que ya usaba la parte de Actorlogía y hace bien el
//     trabajo duro: sabe de fuentes, ligaduras y orden de lectura.
//  2) pdf2json, a mano, para los PDF que el primero no sepa abrir.
//
// Antes sólo estaba el segundo, y con una reconstrucción que ponía un espacio
// DETRÁS DE CADA TROZO. Como muchos PDF entregan un trozo por LETRA, un guion
// salía como "A N A ¿ D e v e r d a d..." y el ensayo se ponía a deletrear.
// La lógica de juntar trozos vive ahora en lib/pdf-texto.ts, con sus pruebas.

/** Motor 1: la librería que ya funcionaba en otra parte de la casa. */
async function conPdfParse(buffer: Buffer): Promise<string> {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    try {
        const res = await parser.getText();
        return res?.text ?? '';
    } finally {
        try { await parser.destroy(); } catch { /* da igual */ }
    }
}

/** Motor 2: pdf2json, juntando los trozos por geometría. */
function conPdf2json(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);

        pdfParser.on('pdfParser_dataError', (err: Error | { parserError: Error }) => {
            const causa = err instanceof Error ? err : err?.parserError;
            reject(new Error(`pdf2json: ${causa?.message ?? 'error desconocido'}`));
        });

        pdfParser.on('pdfParser_dataReady', (pdfData: { Pages?: unknown[] }) => {
            try {
                const paginas = (pdfData?.Pages ?? []) as Array<{
                    Texts?: Array<{ x: number; y: number; R?: Array<{ T?: string }> }>;
                }>;
                const texto = paginas.map((page) => {
                    const trozos: TrozoPdf[] = (page.Texts ?? []).map((t) => {
                        const crudo = t.R?.[0]?.T ?? '';
                        let texto: string;
                        try {
                            texto = decodeURIComponent(crudo);
                        } catch {
                            // URI mal formada: se descodifica lo que se pueda.
                            texto = crudo.replace(/%([0-9A-F]{2})/gi, (_m, h: string) =>
                                String.fromCharCode(parseInt(h, 16)));
                        }
                        return { x: t.x, y: t.y, texto };
                    });
                    return reconstruirPagina(trozos);
                }).join('\n\n');
                resolve(texto);
            } catch (e) {
                reject(e instanceof Error ? e : new Error('pdf2json: fallo al reconstruir'));
            }
        });

        pdfParser.parseBuffer(buffer);
    });
}

/**
 * El texto del PDF. Se prueba el motor bueno y, si no da nada aprovechable, el
 * otro. «Aprovechable» incluye que no venga deletreado: más vale gastar el
 * segundo motor que entregar un guion que la voz leería letra a letra.
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
    let primero = '';
    try {
        primero = await conPdfParse(buffer);
    } catch (e) {
        console.warn('[pdf] pdf-parse no pudo con este fichero, pruebo pdf2json:', e);
    }

    if (primero.trim() && !pareceDeletreado(primero)) return primero;

    try {
        const segundo = await conPdf2json(buffer);
        if (segundo.trim() && !pareceDeletreado(segundo)) return segundo;
        // Si los dos salen deletreados, se devuelve el que tenga algo.
        if (segundo.trim() && !primero.trim()) return segundo;
    } catch (e) {
        console.warn('[pdf] pdf2json tampoco pudo:', e);
    }

    return primero; // puede venir vacío: quien llama ya avisa de eso
}

export async function parsePdfAction(formData: FormData): Promise<{ text: string; error?: string }> {
    try {
        const file = formData.get('file') as File | null;
        if (!file) throw new Error('No se recibió ningún archivo');

        const buffer = Buffer.from(await file.arrayBuffer());
        const text = await parsePdfBuffer(buffer);

        if (!text.trim()) {
            return {
                text: '',
                error: 'El PDF no tiene texto seleccionable. Suele pasar con los escaneados: habría que reconocer las letras de la imagen (OCR).',
            };
        }
        // Si aun así salió deletreado, se dice; es mejor que dejar que el
        // ensayo recite letras sueltas y nadie entienda por qué.
        if (pareceDeletreado(text)) {
            return {
                text,
                error: 'El texto se ha extraído partido en letras sueltas. Revísalo antes de ensayar, o pega el guion a mano.',
            };
        }
        return { text };
    } catch (error) {
        console.error('[pdf] error tratando el PDF:', error);
        const msg = error instanceof Error ? error.message : 'Error del servidor al procesar el PDF';
        return { text: '', error: msg };
    }
}
