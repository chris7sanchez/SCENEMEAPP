import ScriptAnalyzer from '@/components/antigravity/ScriptAnalyzer';
import { Suspense } from 'react';

export default function AntigravityPage() {
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
