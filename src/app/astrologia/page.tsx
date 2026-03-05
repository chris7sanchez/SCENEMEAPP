import { Suspense } from 'react';
import ScriptAnalyzer from '@/components/antigravity/ScriptAnalyzer';
import { Loader2 } from 'lucide-react';

function LoadingState() {
    return (
        <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            <p className="text-amber-500/50 font-black tracking-[0.3em] uppercase text-[10px]">Iniciando Workspace ALCHEMISTERY...</p>
        </div>
    );
}

export default function AstrologiaPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ScriptAnalyzer />
        </Suspense>
    );
}
