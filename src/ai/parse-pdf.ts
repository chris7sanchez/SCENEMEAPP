'use server';

import PDFParser from 'pdf2json';

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error(errData.parserError);
            reject(new Error('Error parsing PDF content'));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                let fullText = "";
                if (pdfData && pdfData.Pages) {
                    pdfData.Pages.forEach((page: any) => {
                        const textBlocks: any[] = [];
                        if (page.Texts) {
                            page.Texts.forEach((t: any) => {
                                let text = t.R[0].T;
                                try {
                                    text = decodeURIComponent(text);
                                } catch (e) {
                                    // Fallback for malformed URIs
                                    text = text.replace(/%([0-9A-F]{2})/g, (match: string, p1: string) => 
                                        String.fromCharCode(parseInt(p1, 16))
                                    );
                                }
                                textBlocks.push({ x: t.x, y: t.y, text });
                            });
                        }

                        // Sort and reconstruct
                        textBlocks.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
                        
                        let lastY = -1;
                        textBlocks.forEach(block => {
                            if (lastY !== -1 && Math.abs(block.y - lastY) > 0.5) {
                                fullText += "\n";
                            }
                            fullText += block.text + " ";
                            lastY = block.y;
                        });
                        fullText += "\n\n";
                    });
                }
                resolve(fullText);
            } catch (e) {
                console.error("Reconstruction Error:", e);
                resolve("");
            }
        });

        pdfParser.parseBuffer(buffer);
    });
}

export async function parsePdfAction(formData: FormData): Promise<{ text: string; error?: string }> {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file uploaded');

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const text = await parsePdfBuffer(buffer);
        return { text };

    } catch (error: any) {
        console.error("PDF Handler Error:", error);
        return { text: '', error: error.message || 'Server error processing PDF' };
    }
}
