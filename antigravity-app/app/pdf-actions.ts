'use server';

// Temporary disable to fix build
// const pdf = require('pdf-parse');

export async function extractTextFromPdf(formData: FormData): Promise<string> {
    // const file = formData.get('file') as File;
    // if (!file) throw new Error('No file provided');

    // try {
    //     const arrayBuffer = await file.arrayBuffer();
    //     const buffer = Buffer.from(arrayBuffer);
    //     const data = await pdf(buffer);
    //     return data.text;
    // } catch (error) {
    //     console.error("Error parsing PDF:", error);
    //     throw new Error('Failed to parse PDF file.');
    // }
    return "PDF upload temporarily disabled for updates. Please copy-paste text.";
}
