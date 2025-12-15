import ScriptAnalyzer from "@/components/ScriptAnalyzer";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

export default function Home() {
    return (
        <main className="min-h-screen bg-[#F0EFE9] text-[#1a1a1a] relative overflow-hidden">
            {/* Background Texture layer */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-multiply"
                style={{ backgroundImage: 'url(/master_davinci_chaos_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            </div>

            {/* DIVINE TEXT LAYER: The Emerald Tablet & Alchemical Axioms */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
                <div className="text-6xl md:text-8xl w-[150%] text-justify divine-text-trace select-none opacity-50 transform -rotate-12 translate-y-10">
                    VERUM SINE MENDACIO CERTUM ET VERISSIMUM QUOD EST INFERIUS EST SICUT QUOD EST SUPERIUS ET QUOD EST SUPERIUS EST SICUT QUOD EST INFERIUS AD PERPETRANDA MIRACULA REI UNIUS ET SICUT OMNES RES FUERUNT AB UNO MEDITATIONE UNIUS SIC OMNES RES NATAE AB HAC UNA RE ADAPTATIONE PATER EIUS EST SOL MATER EIUS EST LUNA PORTAVIT ILLUD VENTUS IN VENTRE SUO NUTRIX EIUS TERRA EST PATER OMNIS TELESMI TOTIUS MUNDI EST HIC VIRTUS EIUS INTEGRA EST SI VERSA FUERIT IN TERRAM SEPARABIS TERRAM AB IGNE SUBTILE A SPISSO SUAVITER MAGNO CUM INGENIO ASCENDIT A TERRA IN CAELUM ITERUMQUE DESCENDIT IN TERRAM ET RECIPIT VIM SUPERIORUM ET INFERIORUM SIC HABEBIS GLORIAM TOTIUS MUNDI IDEO FUGIET A TE OMNIS OBSCURITAS.
                </div>
            </div>

            <div className="border-b border-black/10 bg-white/60 backdrop-blur-md sticky top-0 z-50 relative">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="font-serif font-bold text-xl tracking-tighter flex items-center gap-2">
                        <span className="text-2xl">⚡</span> ALCHEMISTERY
                    </div>
                    <div className="text-[10px] uppercase font-mono tracking-widest opacity-60 font-bold text-[#5B7C99]">Antigravity Module v1.0</div>
                </div>
            </div>

            <div className="relative z-10">
                <GlobalErrorBoundary>
                    <ScriptAnalyzer />
                </GlobalErrorBoundary>
            </div>
        </main>
    );
}
