import fs from 'fs';
import path from 'path';
import { parsePdfBuffer } from './parse-pdf';
import { assimilateKnowledge } from './assimilate-knowledge';

const LIBRARY_PATH = path.join(process.cwd(), 'public/content/astro-library');
const MASTER_GRIMOIRE_PATH = path.join(process.cwd(), 'src/ai/knowledge/master-grimoire.json');
const CHUNK_SIZE = 15000; // Large chunks for deep context

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log('--- ANTIGRAVITY KNOWLEDGE ASSIMILATOR v2.0 ---');
    
    if (!fs.existsSync(LIBRARY_PATH)) {
        console.error('Library path not found:', LIBRARY_PATH);
        return;
    }

    const files = fs.readdirSync(LIBRARY_PATH).filter(f => f.endsWith('.pdf'));
    console.log(`Found ${files.length} PDFs to assimilate.\n`);

    // Ensure output dir exists
    const outDir = path.dirname(MASTER_GRIMOIRE_PATH);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Load existing grimoire to avoid complete restart, but filter out bad entries if needed
    let masterGrimoire: any[] = [];
    if (fs.existsSync(MASTER_GRIMOIRE_PATH)) {
        masterGrimoire = JSON.parse(fs.readFileSync(MASTER_GRIMOIRE_PATH, 'utf-8'));
    }

    for (const file of files) {
        // Skip files already processed in this run (basic check)
        if (masterGrimoire.some(e => e.source === file)) {
            console.log(`skipping ${file} (already assimilated)`);
            continue;
        }

        console.log(`\n📄 Processing: ${file}`);
        const filePath = path.join(LIBRARY_PATH, file);
        const buffer = fs.readFileSync(filePath);

        let text = '';
        try {
            text = await parsePdfBuffer(buffer);
            if (!text || text.length < 500) {
                console.log(`  [!] Warning: Very little text extracted from ${file}. Skipped.`);
                continue;
            }
        } catch (error) {
            console.error(`  [!] Critical error processing ${file}:`, error);
            continue;
        }

        // Noise reduction: Skip the first 10k chars (usually indices/biblio)
        const contentToProcess = text.length > 20000 ? text.substring(10000) : text;
        const chunks = chunkText(contentToProcess, CHUNK_SIZE);

        for (let i = 0; i < chunks.length; i++) {
            console.log(`  [Chunk ${i + 1}/${chunks.length}] Assimilating...`);
            await sleep(2000); // Politeness delay
            
            // Skip very short chunks or chunks with too many numbers (indices)
            if (chunks[i].length < 1000) continue;
            
            const digitDensity = (chunks[i].match(/\d/g) || []).length / chunks[i].length;
            if (digitDensity > 0.25) {
                console.log(`  [!] Skipping chunk ${i + 1} (high noise density)`);
                continue;
            }

            try {
                const output = await assimilateKnowledge({ content: chunks[i] });
                
                // Only add if targets are specific
                const qualityKnowledge = output.knowledge.filter(k => 
                    k.target.toLowerCase() !== 'general' && 
                    k.description.length > 50
                );

                if (qualityKnowledge.length > 0) {
                    const annotated = qualityKnowledge.map(k => ({
                        ...k,
                        source: file,
                        timestamp: new Date().toISOString()
                    }));
                    
                    masterGrimoire.push(...annotated);
                    fs.writeFileSync(MASTER_GRIMOIRE_PATH, JSON.stringify(masterGrimoire, null, 2));
                    console.log(`  [+] Added ${annotated.length} quality entries. Total: ${masterGrimoire.length}`);
                } else {
                    console.log(`  [!] No quality knowledge found in this chunk.`);
                }
            } catch (chunkError) {
                console.error(`  [!] Knowledge Assimilation failed in chunk:`, chunkError);
            }
        }
    }

    console.log('\n✅ BATCH ASSIMILATION COMPLETE.');
    console.log(`Final Database Size: ${masterGrimoire.length} entries.`);
    console.log(`Path: ${MASTER_GRIMOIRE_PATH}`);
}

function chunkText(text: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.substring(i, i + size));
    }
    return chunks;
}

main().catch(console.error);
