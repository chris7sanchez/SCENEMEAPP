import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parsePdf } from '@/ai/parse-pdf'; // We need a non-action version or adapt the action
import { assimilateKnowledge } from '@/ai/assimilate-knowledge';

// We need to import the PDF parser logic directly, not as a server action if possible, 
// OR just use the server action logic here. 
// Since 'parse-pdf' uses 'pdf-parse' which is node-compatible, it should work.
// However, the existing 'parsePdfAction' takes FormData. We need a helper.

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge-base');
const DATA_FILE = path.join(process.cwd(), 'data', 'custom-knowledge.json');

export async function POST() {
    try {
        if (!fs.existsSync(KNOWLEDGE_DIR)) {
            return NextResponse.json({ message: 'No knowledge-base folder found.' });
        }

        const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));

        if (files.length === 0) {
            return NextResponse.json({ message: 'No PDF files found in knowledge-base.' });
        }

        let currentKnowledge = [];
        if (fs.existsSync(DATA_FILE)) {
            currentKnowledge = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        }

        const newItems = [];

        for (const file of files) {
            // Check if already processed (naive check by filename in description or similar? 
            // For now, let's just process everything and maybe user cleans up duplicates, 
            // or we check if we have knowledge from this "Source")

            const filePath = path.join(KNOWLEDGE_DIR, file);
            const fileBuffer = fs.readFileSync(filePath);

            // Parse PDF
            const text = await parsePdf(fileBuffer);

            // Assimilate
            const assimilation = await assimilateKnowledge({ content: text });

            // Add Source Metadata
            const knowledgeWithSource = assimilation.knowledge.map((k: any) => ({
                ...k,
                source: file,
                description: k.description + ` (Source: ${file})`
            }));

            newItems.push(...knowledgeWithSource);
        }

        const updatedKnowledge = [...currentKnowledge, ...newItems];
        fs.writeFileSync(DATA_FILE, JSON.stringify(updatedKnowledge, null, 2));

        return NextResponse.json({
            success: true,
            message: `Processed ${files.length} files. Added ${newItems.length} new wisdoms.`,
            count: newItems.length
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Ingestion failed' }, { status: 500 });
    }
}
