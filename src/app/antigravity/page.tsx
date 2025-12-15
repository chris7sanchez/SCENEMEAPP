import ScriptAnalyzer from '@/components/antigravity/ScriptAnalyzer';

export default function AntigravityPage() {
    return (
        <main className="min-h-screen relative bg-[#F2F0E9]">
            {/* Background layer */}
            <div
                className="fixed inset-0 z-0 opacity-15 pointer-events-none mix-blend-multiply"
                style={{
                    backgroundImage: 'url(/antigravity/astral_background_v2.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            <div className="relative z-10 pt-4">
                <ScriptAnalyzer />
            </div>
        </main>
    );
}
