import { SceneMeLogo } from "@/components/ui/scene-me-logo";

export default function LogoPreviewPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-12 p-8 bg-zinc-900">

            <div className="text-center space-y-2">
                <h1 className="text-white font-display text-3xl">Logo Preview</h1>
                <p className="text-zinc-400">Componente SVG Vectorial</p>
            </div>

            {/* Fondo Oscuro (Simulando Header) */}
            <div className="flex flex-col items-center gap-4 p-8 bg-black border border-white/10 rounded-xl">
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Sobre Fondo Negro</p>
                <SceneMeLogo className="w-32 h-32" />
                <SceneMeLogo className="w-16 h-16" />
            </div>

            {/* Fondo Claro */}
            <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl">
                <p className="text-zinc-400 text-xs uppercase tracking-widest mb-4">Sobre Fondo Blanco</p>
                <SceneMeLogo className="w-32 h-32" />
                <SceneMeLogo className="w-16 h-16" />
            </div>

        </div>
    );
}
