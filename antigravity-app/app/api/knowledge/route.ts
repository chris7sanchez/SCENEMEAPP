import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'custom-knowledge.json');

export async function GET() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return NextResponse.json([]);
        }
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch (e) {
        return NextResponse.json({ error: 'Failed to read knowledge' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2));
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save knowledge' }, { status: 500 });
    }
}
