import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ status: 'ERROR', problem: 'API KEY NO CONFIGURADA' });
    }

    // Step 1: list available models for this key
    const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const listData = await listRes.json();

    if (!listRes.ok) {
        return NextResponse.json({
            status: 'ERROR',
            problem: 'No se pudo listar modelos',
            detail: listData?.error?.message,
            keyUsed: `${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`
        });
    }

    // Filter only models that support generateContent
    const available = (listData.models || [])
        .filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map((m: any) => m.name);

    // Step 2: try the first available model
    if (available.length === 0) {
        return NextResponse.json({
            status: 'ERROR',
            problem: 'No hay modelos con generateContent disponibles para esta key',
            allModels: (listData.models || []).map((m: any) => m.name),
            keyUsed: `${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`
        });
    }

    const modelToTest = 'models/gemini-pro-latest';
    const testRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${modelToTest}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Responde solo: OK' }] }],
                generationConfig: { maxOutputTokens: 10 }
            })
        }
    );
    const testData = await testRes.json();

    return NextResponse.json({
        status: testRes.ok ? 'OK' : 'ERROR',
        modelsAvailableForGenerateContent: available,
        modelTested: modelToTest,
        geminiResponse: testData?.candidates?.[0]?.content?.parts?.[0]?.text || null,
        error: testRes.ok ? null : testData?.error?.message,
        keyUsed: `${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`
    });
}
