import React, { useState } from 'react';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { assimilateKnowledge } from '@/ai/assimilate-knowledge';
import { parsePdfAction } from '@/ai/parse-pdf';
import { Loader2, Plus, Book, Upload, FileText, BookOpen } from 'lucide-react';

export default function ArchetypeLibrary({ onClose }: { onClose: () => void }) {
    const [filter, setFilter] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [knowledgeInput, setKnowledgeInput] = useState('');
    const [isAssimilating, setIsAssimilating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [customKnowledge, setCustomKnowledge] = useState<any[]>([]);

    // Load from API on mount
    React.useEffect(() => {
        fetch('/api/knowledge')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCustomKnowledge(data);
            })
            .catch(err => console.error("Failed to load knowledge", err));
    }, []);

    const saveToApi = async (newData: any[]) => {
        setCustomKnowledge(newData);
        await fetch('/api/knowledge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
        });
    };

    const signs = Object.entries(ZODIAC_ARCHETYPES);

    const handleAssimilate = async () => {
        if (!knowledgeInput.trim()) return;
        setIsAssimilating(true);
        try {
            const result = await assimilateKnowledge({ content: knowledgeInput });
            const newKnowledge = result.knowledge;

            const updated = [...customKnowledge, ...newKnowledge];
            await saveToApi(updated);

            setKnowledgeInput('');
            setShowAdd(false);
            alert(`Sabiduría Asimilada: ${result.summary}`);
        } catch (e) {
            console.error(e);
            alert("Error asimilando conocimiento.");
        } finally {
            setIsAssimilating(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert("Por favor, sube un archivo PDF.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await parsePdfAction(formData);
            if (result.error) {
                alert(`Error al leer PDF: ${result.error}`);
            } else {
                setKnowledgeInput(prev => prev + "\n\n" + result.text);
                alert("PDF Procesado. Texto añadido al área de asimilación. Revisa y pulsa 'Asimilar'.");
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión al procesar PDF.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleScanFolder = async () => {
        setIsScanning(true);
        try {
            const res = await fetch('/api/ingest-folder', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                // Reload
                const kRes = await fetch('/api/knowledge');
                const kData = await kRes.json();
                setCustomKnowledge(kData);
            } else {
                alert(data.message || "Error scanning folder.");
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to server.");
        } finally {
            setIsScanning(false);
        }
    };

    // Helper to get custom knowledge for a sign
    const getCustomForSign = (signName: string) => {
        return customKnowledge.filter(k => k.target.toLowerCase() === signName.toLowerCase() || k.target.toLowerCase().includes(signName.toLowerCase()));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">

                {/* Header */}
                {/* Header */}
                <div className="bg-[#1a1a1a] text-white p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-[#C55959]">Biblioteca de Arquetipos</h2>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Base de Conocimiento Astrológico</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        {/* Scan Folder Button */}
                        <button
                            onClick={handleScanFolder}
                            disabled={isScanning}
                            className="bg-[#5B7C99] text-white border border-[#5B7C99] px-4 py-2 rounded text-[10px] uppercase font-bold tracking-wider hover:bg-white hover:text-[#5B7C99] transition-colors flex items-center gap-2 shadow-lg"
                            title="Escanear carpeta knowledge-base"
                        >
                            {isScanning ? <Loader2 className="animate-spin" size={14} /> : <BookOpen size={14} />}
                            <span>Escanear Carpeta</span>
                        </button>

                        {/* Upload PDF Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="bg-[#C55959] text-white border border-[#C55959] px-4 py-2 rounded text-[10px] uppercase font-bold tracking-wider hover:bg-white hover:text-[#C55959] transition-colors flex items-center gap-2 shadow-lg"
                        >
                            {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                            <span>{isUploading ? 'Leyendo...' : 'Subir PDF'}</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="application/pdf"
                            className="hidden"
                        />

                        {/* Manual Entry Toggle */}
                        <button
                            onClick={() => setShowAdd(!showAdd)}
                            className={`px-4 py-2 rounded text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center gap-2 border ${showAdd ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/30 hover:bg-white/10'}`}
                        >
                            <Plus size={14} /> <span>Manual</span>
                        </button>

                        <div className="hidden md:block w-px h-8 bg-white/10 mx-2"></div>

                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors text-2xl ml-2"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Assimilation Panel (Manual Text) */}
                {showAdd && (
                    <div className="bg-[#2a2a2a] p-6 text-white border-b border-[#C55959] animate-slideDown">
                        <h3 className="font-serif text-lg mb-2 flex items-center gap-2"><Book size={18} /> Asimilación Manual</h3>
                        <p className="text-xs text-gray-400 mb-4 max-w-2xl">
                            Escribe o pega notas sueltas aquí. Para libros completos, usa los botones de arriba (Subir PDF o Escanear Carpeta).
                        </p>
                        <div className="flex gap-4">
                            <textarea
                                className="flex-1 bg-black/30 border border-white/10 rounded p-4 text-sm font-mono focus:border-[#C55959] outline-none h-32 resize-none"
                                placeholder="Escribe aquí tu conocimiento..."
                                value={knowledgeInput}
                                onChange={(e) => setKnowledgeInput(e.target.value)}
                            />
                            <div className="flex flex-col gap-2 justify-end">
                                <button
                                    onClick={handleAssimilate}
                                    disabled={isAssimilating}
                                    className="bg-white text-black px-6 py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-[#C55959] hover:text-white transition-colors disabled:opacity-50 h-full"
                                >
                                    {isAssimilating ? <Loader2 className="animate-spin" /> : 'Asimilar Texto'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Content */}
                <div className="flex-1 overflow-auto p-8 bg-[#F9F8F4]">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {signs.map(([sign, data]) => (
                            <div key={sign} className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="bg-gray-50 border-b border-black/5 p-4 flex justify-between items-center">
                                    <h3 className="font-bold text-lg font-serif text-[#C55959]">{sign}</h3>
                                    <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-full uppercase tracking-wider text-gray-500">
                                        {data.keywords[1]}
                                    </span>
                                </div>

                                <div className="p-4 space-y-4 text-xs">

                                    <div>
                                        <div className="uppercase font-bold tracking-widest text-gray-400 mb-1 flex items-center gap-1">
                                            <span className="text-yellow-500 text-sm">☉</span> Sol (Esencia)
                                        </div>
                                        <p className="font-serif text-gray-700 leading-relaxed italic">{data.sun}</p>
                                    </div>

                                    <div>
                                        <div className="uppercase font-bold tracking-widest text-gray-400 mb-1 flex items-center gap-1">
                                            <span className="text-gray-400 text-sm">☽</span> Luna (Emoción)
                                        </div>
                                        <p className="font-serif text-gray-700 leading-relaxed italic">{data.moon}</p>
                                    </div>

                                    <div>
                                        <div className="uppercase font-bold tracking-widest text-gray-400 mb-1 flex items-center gap-1">
                                            <span className="text-black text-sm">↑</span> Ascendente (Máscara)
                                        </div>
                                        <p className="font-serif text-gray-700 leading-relaxed italic">{data.ascendant}</p>
                                    </div>

                                    <div className="pt-2 border-t border-dashed border-gray-200 grid grid-cols-2 gap-2">
                                        <div className="bg-green-50 p-2 rounded">
                                            <span className="block text-[8px] uppercase font-bold text-green-700 mb-1">Luz (Virtud)</span>
                                            <p className="text-gray-600 leading-tight">{data.light}</p>
                                        </div>
                                        <div className="bg-red-50 p-2 rounded">
                                            <span className="block text-[8px] uppercase font-bold text-red-700 mb-1">Sombra (Defecto)</span>
                                            <p className="text-gray-600 leading-tight">{data.shadow}</p>
                                        </div>
                                    </div>

                                    {/* Custom Knowledge Render */}
                                    {getCustomForSign(sign).length > 0 && (
                                        <div className="pt-2 border-t border-dashed border-purple-200 mt-2">
                                            <span className="block text-[8px] uppercase font-bold text-purple-700 mb-1">Sabiduría Adicional</span>
                                            <div className="space-y-2">
                                                {getCustomForSign(sign).map((k, i) => (
                                                    <div key={i} className="bg-purple-50 p-2 rounded text-[10px] border border-purple-100">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-bold text-purple-900 uppercase tracking-wider">{k.category}</span>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('¿Olvidar este conocimiento?')) {
                                                                        const updated = customKnowledge.filter((_, idx) => _ !== k); // Note: simple filter by ref might fail if reloaded, but let's try
                                                                        // Better: filter by content match since we don't have IDs
                                                                        const realUpdated = customKnowledge.filter(item => item.value !== k.value || item.category !== k.category || item.target !== k.target);
                                                                        saveToApi(realUpdated);
                                                                    }
                                                                }}
                                                                className="text-purple-300 hover:text-purple-700"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                        <div className="font-bold text-purple-800 mb-1">{k.value}</div>
                                                        <div className="text-purple-600 italic leading-tight opacity-80">{k.description}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div >
    );
}
