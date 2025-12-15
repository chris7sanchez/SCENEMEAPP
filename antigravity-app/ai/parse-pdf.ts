'use server';

import pdf from 'pdf-parse';

export async function parsePdf(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    return data.text;
}

export async function parsePdfAction(formData: FormData): Promise<{ text: string; error?: string }> {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error('No file uploaded');
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const text = await parsePdf(buffer);

        return { text };

    } catch (error: any) {
        console.error("PDF Parse Error:", error);
        return { text: '', error: error.message || 'Failed to parse PDF' };
    }
}
