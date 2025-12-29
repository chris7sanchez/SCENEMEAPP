'use server';

import PDFParser from 'pdf2json';

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        // Context null, 1 (true) enables raw text parsing representing the text content
        const pdfParser = new PDFParser(null, true);

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error(errData.parserError);
            reject(new Error('Error parsing PDF structure'));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                // Custom Logic to reconstruct tables/layout
                let fullText = "";

                // Iterate pages
                if (pdfData && pdfData.formImage && pdfData.formImage.Pages) {
                    pdfData.formImage.Pages.forEach((page: any) => {
                        // Extract all text blocks
                        const textBlocks: any[] = [];

                        if (page.Texts) {
                            page.Texts.forEach((t: any) => {
                                const y = t.y;
                                const x = t.x;
                                // Decode text (pdf2json returns URL-encoded text)
                                const text = decodeURIComponent(t.R[0].T);
                                textBlocks.push({ x, y, text });
                            });
                        }

                        // Sort by Y (rows), then X (columns)
                        textBlocks.sort((a, b) => {
                            if (Math.abs(a.y - b.y) < 0.8) { // Same line tolerance (increased)
                                return a.x - b.x;
                            }
                            return a.y - b.y;
                        });

                        // Group into lines to form a "Table-like" structure
                        let currentY = -1;
                        let lineText = "";

                        textBlocks.forEach((block) => {
                            if (currentY === -1 || Math.abs(block.y - currentY) < 0.8) {
                                // Same line
                                currentY = block.y;
                                // Add separator (simulating column)
                                lineText += (lineText ? " | " : "") + block.text;
                            } else {
                                // New line
                                fullText += lineText + "\n";
                                currentY = block.y;
                                lineText = block.text;
                            }
                        });
                        // Flush last line
                        fullText += lineText + "\n\n";
                    });
                }

                if (!fullText.trim()) {
                    // Fallback to raw text if custom parsing failed to find content
                    fullText = pdfParser.getRawTextContent();
                }

                resolve(fullText);
            } catch (e) {
                console.error(e);
                // Fallback
                resolve(pdfParser.getRawTextContent());
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
