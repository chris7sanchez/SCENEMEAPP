import React, { useState } from 'react';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import { assimilateKnowledge } from '@/ai/assimilate-knowledge';
import { parsePdfAction } from '@/ai/parse-pdf';
import { Loader2, Plus, Book, Upload, FileText, BookOpen, X, Sun, BrainCircuit, Sparkles } from 'lucide-react';

export default function ArchetypeLibrary({ onClose }: { onClose: () => void }) {
    const [filter, setFilter] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [knowledgeInput, setKnowledgeInput] = useState('');
    const [isAssimilating, setIsAssimilating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [history, setHistory] = useState<any[][]>([]);
    const [customKnowledge, setCustomKnowledge] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    // Load from API on mount
    React.useEffect(() => {
        const storedDate = localStorage.getItem('archetypeLastUpdateDate');
        if (storedDate) setLastUpdated(storedDate);

        fetch('/api/knowledge')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCustomKnowledge(data);
            })
            .catch(err => console.error("Failed to load knowledge", err));
    }, []);

    const updateHistory = (newHistory: any[][]) => {
        setHistory(newHistory);
        localStorage.setItem('archetypeUndoHistory', JSON.stringify(newHistory));
    };

    const saveToApi = async (newData: any[]) => {
        setCustomKnowledge(newData);
        await fetch('/api/knowledge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
        });
        const now = new Date().toLocaleString();
        setLastUpdated(now);
        localStorage.setItem('archetypeLastUpdateDate', now);
    };

    const handleUndo = async () => {
        if (history.length === 0) return;
        const previousState = history[history.length - 1];
        const newHistory = history.slice(0, -1);

        updateHistory(newHistory);
        await saveToApi(previousState);
        alert("Acción deshecha. Se ha restaurado el estado anterior.");
    };

    const handleDeleteLastBatch = async () => {
        if (customKnowledge.length === 0) return;
        if (!confirm("¿Eliminar los últimos datos añadidos? (Esta acción es ciega, borrará lo último ingresado).")) return;

        // Save state for Undo just in case
        updateHistory([...history, customKnowledge]);

        const newState = [...customKnowledge];
        const removed = newState.pop(); // Remove 1
        await saveToApi(newState);
        alert(`Eliminado el último registro: ${removed?.value || 'Desconocido'}`);
    };

    const handleClearAll = async () => {
        if (!confirm("⚠️ ¿ESTÁS SEGURO? \nEsto borrará TODO el conocimiento personalizado asimilado manualmente o por PDF.\nEsta acción no se puede deshacer.")) return;

        // Save current to history just in case
        setHistory(prev => [...prev, customKnowledge]);
        await saveToApi([]);
        alert("Biblioteca purgada. Volviendo a valores de fábrica.");
    };

    const signs = Object.entries(ZODIAC_ARCHETYPES);

    const handleAssimilate = async () => {
        if (!knowledgeInput.trim()) return;
        setIsAssimilating(true);

        // Save to History before changing
        setHistory(prev => [...prev, customKnowledge]);

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
            } else if (!result.text || !result.text.trim()) {
                alert("El PDF parece estar vacío o ser una imagen sin texto (OCR no disponible).");
            } else {
                setKnowledgeInput(prev => prev + "\n\n" + result.text);
                setShowAdd(true); // Automatically open the panel
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
                if (data.count && data.count > 0) {
                    alert(`ÉXITO: ${data.message}`);
                    const kRes = await fetch('/api/knowledge');
                    const kData = await kRes.json();
                    await saveToApi(kData);
                } else {
                    alert("Biblioteca Actualizada. No se ha encontrado nueva información en la carpeta.");
                    const now = new Date().toLocaleString();
                    setLastUpdated(now);
                    localStorage.setItem('archetypeLastUpdateDate', now);
                }
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

    const [activeTab, setActiveTab] = useState<'explorar' | 'asimilar'>('explorar');

    // Helper to get custom knowledge for a sign
    const getCustomForSign = (signName: string) => {
        return customKnowledge.filter(k => k.target.toLowerCase() === signName.toLowerCase() || k.target.toLowerCase().includes(signName.toLowerCase()));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">

                {/* Header */}
                <div className="bg-[#0A0A0A] text-white p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#C55959] to-[#8B3D3D] rounded-2xl flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(197,89,89,0.5)]">
                            <Book size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-serif font-black tracking-tight text-white uppercase">Bibliotheca Pro</h2>
                            <p className="text-[10px] text-[#C55959] font-black uppercase tracking-[0.4em] mt-2">Arquetipos y Correspondencias Alquímicas</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-1 rounded-full border border-white/10">
                        <button
                            onClick={() => setActiveTab('explorar')}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'explorar' ? 'bg-white text-black shadow-xl' : 'text-gray-400 hover:text-white'}`}
                        >
                            Explorar
                        </button>
                        <button
                            onClick={() => setActiveTab('asimilar')}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'asimilar' ? 'bg-white text-black shadow-xl' : 'text-gray-400 hover:text-white'}`}
                        >
                            Asimilar Conocimiento
                        </button>
                    </div>

                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors absolute top-6 right-6">
                        <X size={24} />
                    </button>
                </div>

                {/* Assimilation Panel (Manual Text) */}
                {activeTab === 'asimilar' && (
                    <div className="bg-[#1a1a1a] p-10 text-white border-b border-[#C55959]/30 animate-in fade-in zoom-in duration-500">
                        <div className="max-w-4xl mx-auto">
                            <h3 className="font-serif text-2xl font-black mb-4 flex items-center gap-3">
                                <BrainCircuit size={28} className="text-[#C55959]" />
                                Destilación de Conocimiento
                            </h3>
                            <p className="text-xs text-gray-400 mb-8 leading-relaxed uppercase tracking-widest">
                                Introduce fragmentos de textos antiguos, manuales de psicología o técnicas de actuación. La IA asimilará el contenido y lo integrará en los arquetipos correspondientes.
                            </p>
                            <div className="flex flex-col gap-6">
                                <textarea
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-8 text-sm font-mono focus:border-[#C55959] outline-none h-64 resize-none transition-all shadow-inner"
                                    placeholder="Pega aquí el texto a transmutar..."
                                    value={knowledgeInput}
                                    onChange={(e) => setKnowledgeInput(e.target.value)}
                                />
                                <button
                                    onClick={handleAssimilate}
                                    disabled={isAssimilating || !knowledgeInput.trim()}
                                    className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs hover:bg-[#C55959] hover:text-white transition-all disabled:opacity-20 shadow-2xl flex items-center justify-center gap-4"
                                >
                                    {isAssimilating ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                    {isAssimilating ? 'TRANSMUTANDO...' : 'ASIMILAR EN LA MEMORIA VIVA'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Content */}
                <div className="flex-1 overflow-auto p-12 bg-[#F9F8F4] custom-scrollbar">
                    {activeTab === 'explorar' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {signs.map(([sign, data]) => (
                                <div key={sign} className="bg-white rounded-[32px] shadow-xl border border-black/5 overflow-hidden hover:shadow-2xl transition-all group/card flex flex-col">
                                    <div className="bg-black text-white p-6 flex justify-between items-center group-hover/card:bg-[#C55959] transition-colors duration-500">
                                        <h3 className="font-serif font-black text-xl uppercase tracking-tighter">{sign}</h3>
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-50">{data.keywords[1]}</span>
                                    </div>

                                    <div className="p-8 space-y-6 text-xs flex-1">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-black/5">
                                                <div className="uppercase font-black tracking-widest text-[#C55959] text-[8px] mb-2 flex items-center gap-2">
                                                    <Sun size={10} /> Esencia Consciente
                                                </div>
                                                <p className="font-serif text-gray-800 leading-relaxed italic text-[11px]">{data.sun}</p>
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-2xl border border-black/5">
                                                <div className="uppercase font-black tracking-widest text-gray-400 text-[8px] mb-2 flex items-center gap-2">
                                                    <span>☽</span> Herida y Refugio
                                                </div>
                                                <p className="font-serif text-gray-800 leading-relaxed italic text-[11px]">{data.moon}</p>
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-2xl border border-black/5">
                                                <div className="uppercase font-black tracking-widest text-gray-400 text-[8px] mb-2 flex items-center gap-2">
                                                    <span>↑</span> Vehículo de Acción
                                                </div>
                                                <p className="font-serif text-gray-800 leading-relaxed italic text-[11px]">{data.ascendant}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                                <span className="block text-[8px] font-black uppercase text-green-700 tracking-widest mb-2">Virtud</span>
                                                <p className="text-gray-600 leading-tight text-[10px]">{data.light}</p>
                                            </div>
                                            <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                                                <span className="block text-[8px] font-black uppercase text-red-700 tracking-widest mb-2">Sombra</span>
                                                <p className="text-gray-600 leading-tight text-[10px]">{data.shadow}</p>
                                            </div>
                                        </div>

                                        {/* Custom Knowledge Render */}
                                        {getCustomForSign(sign).length > 0 && (
                                            <div className="pt-6 border-t border-black/5 mt-4 space-y-3">
                                                <span className="block text-[8px] font-black uppercase text-purple-600 tracking-[0.3em] mb-4">Gnosis Adicional</span>
                                                {getCustomForSign(sign).map((k, i) => (
                                                    <div key={i} className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 relative group/item">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-[7px] font-black uppercase tracking-widest text-purple-400">{k.category}</span>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('¿Olvidar este registro?')) {
                                                                        const realUpdated = customKnowledge.filter(item => item.value !== k.value || item.category !== k.category || item.target !== k.target);
                                                                        saveToApi(realUpdated);
                                                                    }
                                                                }}
                                                                className="opacity-0 group-hover/item:opacity-100 text-purple-300 hover:text-purple-600"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                        <div className="font-black text-purple-900 text-[10px] uppercase mb-1">{k.value}</div>
                                                        <p className="text-[10px] text-purple-700 italic font-serif leading-relaxed opacity-80">{k.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center">
                                <Plus size={48} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif font-black uppercase tracking-tight">El Laboratorio está listo</h3>
                                <p className="text-gray-400 mt-2 max-w-sm mx-auto text-xs uppercase tracking-widest leading-loose">
                                    Selecciona una fuente de conocimiento arriba para expandir la inteligencia de ALCHEMISTERY.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER: LAST UPDATE */}
                <div className="bg-[#1a1a1a] p-2 text-center border-t border-white/10 shrink-0 z-50">
                    <p className="text-[10px] uppercase tracking-widest text-[#5B7C99]">
                        Última Actualización de Biblioteca: <span className="text-white font-bold ml-1">{lastUpdated || 'Pendiente'}</span>
                    </p>
                </div>
            </div>
        </div >
    );
}
