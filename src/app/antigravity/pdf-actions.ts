'use server';

export async function extractTextFromPdf(formData: FormData): Promise<string> {
    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    try {
        // Dynamic import to prevent build-time/init-time crashes
        const pdfModule = await import('pdf-parse');
        const pdfParse = pdfModule.default || pdfModule;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdfParse(buffer);

        if (!data || !data.text || data.text.trim().length === 0) {
            throw new Error("El PDF está vacío o no tiene texto seleccionable (quizás es una imagen escaneada).");
        }

        return data.text;
    } catch (error: any) {
        console.error("Server PDF Parse Error:", error);
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
}
