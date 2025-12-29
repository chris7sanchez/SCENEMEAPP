import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // COSMOS, CUERPO, ESPIRITU

    if (!category) {
        return NextResponse.json({ error: 'Category required' }, { status: 400 });
    }

    const dirPath = path.join(process.cwd(), 'public', 'assets', 'backgrounds', category.toUpperCase());

    if (!fs.existsSync(dirPath)) {
        return NextResponse.json({ images: [] });
    }

    try {
        const files = fs.readdirSync(dirPath).filter(file => {
            const ext = path.extname(file).toLowerCase();
            const fullPath = path.join(dirPath, file);
            try {
                const stats = fs.statSync(fullPath);
                // Filter valid extensions AND robust size (> 50KB) to avoid pixelated icons/thumbnails
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext) && stats.size > 50 * 1024;
            } catch {
                return false;
            }
        });

        const imagePaths = files.map(file => `/assets/backgrounds/${category.toUpperCase()}/${file}`);

        return NextResponse.json({ images: imagePaths });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
    }
}
