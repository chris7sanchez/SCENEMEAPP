'use server';

import { PDFParse } from 'pdf-parse';

export async function extractTextFromPdf(formData: FormData): Promise<string> {
    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create PDFParse instance with buffer data
        const parser = new PDFParse({ data: buffer });

        // Use getText method to extract text content
        const result = await parser.getText();

        if (!result || !result.text || result.text.trim().length === 0) {
            throw new Error("El PDF está vacío o no tiene texto seleccionable (quizás es una imagen escaneada).");
        }

        // Clean up resources
        await parser.destroy();

        return result.text;
    } catch (error: any) {
        console.error("Server PDF Parse Error:", error);
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
}
