'use server';

import { generateVideoScript } from '@/ai/flows/generate-video-script';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        console.log("[TEST] Starting test script generation...");

        const result = await generateVideoScript({
            genre: "Drama",
            numActors: "2",
            genderActors: "Actor 1: Masculino, Actor 2: Femenino",
            tones: ["Intense"],
            length: "30 seconds",
            logline: "Dos amigos discuten en un bar sobre sus sueños rotos",
            props: "Mesa, vasos",
            endingType: "Sorpréndeme",
            language: "Español"
        });

        console.log("[TEST] Script generated successfully!");

        return NextResponse.json({
            success: true,
            script: result.script,
            length: result.script?.length ?? 0
        });

    } catch (error: any) {
        console.error("[TEST] Error:", error);

        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            details: JSON.stringify(error, null, 2)
        }, { status: 500 });
    }
}
