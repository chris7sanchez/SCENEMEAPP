import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parsePdfBuffer } from '@/ai/parse-pdf';
import { assimilateKnowledge } from '@/ai/assimilate-knowledge';

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge-base');
const DATA_FILE = path.join(process.cwd(), 'data', 'custom-knowledge.json');

export async function POST() {
    try {
        if (!fs.existsSync(KNOWLEDGE_DIR)) {
            fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
            return NextResponse.json({ success: true, message: "Created knowledge-base folder. Please add PDFs there." });
        }

        const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));

        if (files.length === 0) {
            return NextResponse.json({ success: false, message: "No PDFs found in knowledge-base folder." });
        }

        // Load existing knowledge
        let currentKnowledge: any[] = [];
        if (fs.existsSync(DATA_FILE)) {
            currentKnowledge = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        }

        const newItems: any[] = [];

        for (const file of files) {
            // Check if already processed (simple check by source name in description or separate tracking)
            // For now, we'll just process everything and append. 
            // Ideally, we should check if file name exists in currentKnowledge sources.
            const alreadyProcessed = currentKnowledge.some(k => k.description && k.description.includes(`(Source: ${file})`));
            if (alreadyProcessed) continue;

            const filePath = path.join(KNOWLEDGE_DIR, file);
            const fileBuffer = fs.readFileSync(filePath);

            // Parse PDF
            const text = await parsePdfBuffer(fileBuffer);

            // Assimilate
            const assimilation = await assimilateKnowledge({ content: text });

            const knowledgeWithSource = assimilation.knowledge.map((k: any) => ({
                ...k,
                source: file,
                description: k.description + ` (Source: ${file})`
            }));

            newItems.push(...knowledgeWithSource);
        }

        if (newItems.length === 0) {
            return NextResponse.json({ success: true, message: "No new files to process." });
        }

        const updatedKnowledge = [...currentKnowledge, ...newItems];

        // Ensure data dir exists
        const dataDir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

        fs.writeFileSync(DATA_FILE, JSON.stringify(updatedKnowledge, null, 2));

        return NextResponse.json({
            success: true,
            message: `Processed ${files.length} files. Added ${newItems.length} new wisdoms.`,
            count: newItems.length
        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || 'Failed to ingest folder' }, { status: 500 });
    }
}
