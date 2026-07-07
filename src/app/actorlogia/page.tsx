import ScriptAnalyzer from '@/components/antigravity/ScriptAnalyzer';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Actorlogía · SCENE ME',
    description: 'Alquimia actoral: la carta natal del personaje a partir de su guion.',
};

export default function ActorlogiaPage() {
    return (
        <main className="min-h-screen relative">
            <div className="relative z-10">
                <Suspense fallback={<div className="min-h-screen bg-[#F2F0E9] animate-pulse" />}>
                    <ScriptAnalyzer />
                </Suspense>
            </div>
        </main>
    );
}
