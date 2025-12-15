"use client";
import React, { useState, useEffect } from 'react';
import { BirthData } from './BirthDataForm';
import SynastryOverlay from './SynastryOverlay';
import NatalChart2D from './NatalChart2D';

// Mock Archetypes still used for the "Analysis" part, but Names come from Real Script
const ARCHETYPES = {
    FIRE: { sign: 'Aries', elements: { fire: 80, water: 5, earth: 10, air: 5 }, desc: 'Energía impulsiva y directa.' },
    WATER: { sign: 'Escorpio', elements: { fire: 10, water: 80, earth: 5, air: 5 }, desc: 'Profundidad emocional y misterio.' },
    EARTH: { sign: 'Tauro', elements: { fire: 5, water: 10, earth: 80, air: 5 }, desc: 'Estabilidad y obstinación.' },
    AIR: { sign: 'Géminis', elements: { fire: 10, water: 5, earth: 5, air: 80 }, desc: 'Intelectual y comunicativo.' },
};

export default function ScriptAnalyzer() {
    const [script, setScript] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // State for Detected Characters
    const [detectedCharacters, setDetectedCharacters] = useState<string[]>([]);
    const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(null);
    const [charProfiles, setCharProfiles] = useState<any[]>([]); // Store generated profile for each char

    const [currentUser, setCurrentUser] = useState<BirthData | null>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [comparisonTargetId, setComparisonTargetId] = useState<string>('user');

    // Manual Mode
    const [manualMode, setManualMode] = useState(false);
    const [manualData, setManualData] = useState({
        name: '', sign: 'Aries', fire: 25, water: 25, earth: 25, air: 25, description: ''
    });

    useEffect(() => {
        const userStr = localStorage.getItem('userBirthData');
        const friendsStr = localStorage.getItem('astroFriends');
        if (userStr) setCurrentUser(JSON.parse(userStr));
        if (friendsStr) setFriends(JSON.parse(friendsStr));
    }, []);

    // --- REAL SCRIPT PARSING LOGIC ---
    const parseScript = (text: string) => {
        // Regex Basic approach: Look for lines that are UPPERCASE (min 3 chars), 
        // surrounded by newlines, likely centered or left.
        // Screenplay format: NAME (optional mod) \n Dialogue

        const lines = text.split('\n');
        const names = new Set<string>();

        // Improve regex to catch "INT." "EXT." as scene headings, not characters
        const sceneHeadingRegex = /^(INT\.|EXT\.|EST\.)/;
        const characterRegex = /^\s*([A-ZÁÉÍÓÚÑ]{3,20}(\s[A-ZÁÉÍÓÚÑ]+)*)(\s*\(.*\))?\s*$/;

        // Scan lines
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (characterRegex.test(line) && !sceneHeadingRegex.test(line)) {
                // It's likely a character name if next line is dialogue (not empty, not another NAME)
                // For simplicity in this demo, we'll just capture distinct ALL CAPS lines that aren't Scene Headings
                const nameMatch = line.match(characterRegex);
                if (nameMatch) {
                    names.add(nameMatch[1].trim());
                }
            }
        }
        return Array.from(names);
    };

    const handleAnalyze = () => {
        if (!script.trim()) return;
        setIsAnalyzing(true);

        setTimeout(() => {
            // 1. Detect Characters
            const names = parseScript(script);
            setDetectedCharacters(names);

            // 2. Generate Initial Profiles (Mock AI Guessing for now)
            // In future, this Loop would call the Real LLM for each name
            const profls = names.map(name => {
                // Randomly assign basic archetype for demo
                const types = Object.values(ARCHETYPES);
                const randomType = types[Math.floor(Math.random() * types.length)];
                return {
                    name: name,
                    sign: randomType.sign,
                    elements: randomType.elements,
                    description: randomType.desc + " (Detectado por Análisis de Texto)",
                    birthData: { date: new Date().toISOString(), latitude: 40, longitude: -3 }
                };
            });

            setCharProfiles(profls);
            if (profls.length > 0) setSelectedCharIndex(0);

            setIsAnalyzing(false);
        }, 1500);
    };

    const handleManualSubmit = () => {
        const newProfile = {
            name: manualData.name || 'Manual',
            sign: manualData.sign,
            elements: { fire: manualData.fire, water: manualData.water, earth: manualData.earth, air: manualData.air },
            description: manualData.description || 'Perfil manual',
            birthData: { date: new Date().toISOString(), latitude: 40, longitude: -3 }
        };
        setCharProfiles([newProfile]);
        setDetectedCharacters([newProfile.name]);
        setSelectedCharIndex(0);
        setManualMode(false);
    };

    const handleSaveCharacter = () => {
        if (selectedCharIndex === null) return;
        const char = charProfiles[selectedCharIndex];

        const newCharEntry = {
            id: Date.now().toString(),
            name: `${char.name} (Guión)`,
            sign: char.sign,
            birthData: char.birthData,
            elements: char.elements
        };

        const updatedFriends = [...friends, newCharEntry];
        setFriends(updatedFriends);
        localStorage.setItem('astroFriends', JSON.stringify(updatedFriends));
        alert(`${char.name} guardado en tu Red.`);
    };

    const activeProfile = selectedCharIndex !== null ? charProfiles[selectedCharIndex] : null;

    // Comparison Helper
    const getComparisonData = () => {
        if (comparisonTargetId === 'user' && currentUser) {
            return { date: currentUser.date, lat: currentUser.latitude, lon: currentUser.longitude, name: 'Tu Carta' };
        }
        const friend = friends.find(f => f.id === comparisonTargetId);
        if (friend) {
            return { date: friend.birthData.date, lat: friend.birthData.latitude, lon: friend.birthData.longitude, name: friend.name };
        }
        return null;
    };
    const targetData = getComparisonData();

    return (
        <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-8 min-h-[85vh]">
            {/* Left: Script Input */}
            <div className="flex-1 flex flex-col">
                <header className="mb-6 border-b border-black/10 pb-4">
                    <h1 className="text-3xl font-serif text-[#1a1a1a] mb-1">
                        Lente de Análisis <span className="text-[#5B7C99]">AI</span>
                    </h1>
                    <div className="flex justify-between items-center gap-4">
                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                            Análisis de Guión & Balance Elemental
                        </p>
                        <button
                            onClick={() => setManualMode(!manualMode)}
                            className="text-[10px] uppercase font-bold text-[#5B7C99] underline decoration-dotted whitespace-nowrap"
                        >
                            {manualMode ? 'Volver a Script' : 'Entrada Manual'}
                        </button>
                    </div>
                </header>

                {!manualMode ? (
                    <div className="flex-1 relative group flex flex-col gap-4">
                        <textarea
                            className="w-full flex-1 min-h-[500px] bg-[#F9F8F4] border border-black/20 rounded-sm p-8 text-[#1a1a1a] font-serif text-lg leading-relaxed focus:border-[#5B7C99] outline-none shadow-inner font-courier"
                            placeholder={"PEGAR GUIÓN AQUÍ (Formato Estándar)...\n\nINT. CAFETERÍA - DÍA\n\nJUAN\nHola, ¿cómo estás?\n\nMARIA\n(sonriendo)\nMuy bien, gracias."}
                            style={{ backgroundImage: 'linear-gradient(#00000005 1px, transparent 1px)', backgroundSize: '100% 2rem', lineHeight: '2rem' }}
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                        />
                        <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
                            <span>* Soporta formato PDF (Próximamente)</span>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !script}
                                className={`btn-primary px-8 py-2 ${isAnalyzing ? 'opacity-50' : ''}`}
                            >
                                {isAnalyzing ? 'Escaneando...' : 'Separar Personajes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    // Manual Form Reuse
                    <div className="w-full h-full min-h-[500px] bg-[#F9F8F4] border border-black/20 rounded-sm p-8 flex flex-col gap-4">
                        <h3 className="font-serif text-xl border-b pb-2">Datos del Personaje</h3>
                        <input
                            placeholder="Nombre del Personaje"
                            className="p-3 bg-white border border-black/10"
                            value={manualData.name} onChange={e => setManualData({ ...manualData, name: e.target.value })}
                        />
                        <select
                            className="p-3 bg-white border border-black/10"
                            value={manualData.sign} onChange={e => setManualData({ ...manualData, sign: e.target.value })}
                        >
                            {['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <h3 className="font-serif text-sm mt-4 uppercase tracking-widest">Balance Elemental (%)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="text-xs">Fuego <input type="number" className="w-full p-2 border" value={manualData.fire} onChange={e => setManualData({ ...manualData, fire: Number(e.target.value) })} /></label>
                            <label className="text-xs">Agua <input type="number" className="w-full p-2 border" value={manualData.water} onChange={e => setManualData({ ...manualData, water: Number(e.target.value) })} /></label>
                            <label className="text-xs">Tierra <input type="number" className="w-full p-2 border" value={manualData.earth} onChange={e => setManualData({ ...manualData, earth: Number(e.target.value) })} /></label>
                            <label className="text-xs">Aire <input type="number" className="w-full p-2 border" value={manualData.air} onChange={e => setManualData({ ...manualData, air: Number(e.target.value) })} /></label>
                        </div>

                        <textarea
                            placeholder="Notas de análisis..."
                            className="flex-1 p-3 bg-white border border-black/10 resize-none"
                            value={manualData.description} onChange={e => setManualData({ ...manualData, description: e.target.value })}
                        />
                        <button onClick={handleManualSubmit} className="btn-primary mt-4">Generar Perfil</button>
                    </div>
                )}
            </div>

            {/* Right: Results Panel */}
            <div className={`flex-1 transition-all duration-700 ${activeProfile ? 'opacity-100' : 'opacity-40 grayscale blur-[1px]'}`}>
                {detectedCharacters.length > 0 && (
                    <div className="mb-6 flex gap-2 overflow-x-auto pb-2 border-b border-black/5">
                        {detectedCharacters.map((name, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedCharIndex(idx)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all
                                    ${selectedCharIndex === idx
                                        ? 'bg-[#1a1a1a] text-[#F2F0E9]'
                                        : 'bg-white border border-black/10 text-gray-500 hover:border-black'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                )}

                {activeProfile ? (
                    <div className="h-full flex flex-col space-y-8 animate-fadeIn">
                        {/* Profile Card */}
                        <div className="glass-panel p-8 relative">
                            <div className="absolute top-2 right-2 opacity-10 text-6xl font-serif">{activeProfile.sign === 'Escorpio' ? '♏' : '♈'}</div>
                            <h2 className="text-3xl font-serif text-[#1a1a1a] mb-1">{activeProfile.name}</h2>
                            <p className="text-xs text-[#C55959] font-mono mb-4 uppercase tracking-wider">Arquetipo: {activeProfile.sign}</p>

                            {/* Elemental Bars */}
                            <div className="mb-6 grid grid-cols-4 gap-2 h-24 items-end pb-2 border-b border-black/5">
                                <div className="flex flex-col items-center gap-1 w-full">
                                    <div style={{ height: `${activeProfile.elements?.fire}%` }} className="w-full bg-red-500/60 rounded-t-sm transition-all duration-1000 relative group">
                                        <span className="absolute -top-4 w-full text-center text-[10px] opacity-0 group-hover:opacity-100">{activeProfile.elements?.fire}%</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-red-800">Fuego</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-full">
                                    <div style={{ height: `${activeProfile.elements?.earth}%` }} className="w-full bg-green-600/60 rounded-t-sm transition-all duration-1000 relative group">
                                        <span className="absolute -top-4 w-full text-center text-[10px] opacity-0 group-hover:opacity-100">{activeProfile.elements?.earth}%</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-green-900">Tierra</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-full">
                                    <div style={{ height: `${activeProfile.elements?.air}%` }} className="w-full bg-yellow-400/60 rounded-t-sm transition-all duration-1000 relative group">
                                        <span className="absolute -top-4 w-full text-center text-[10px] opacity-0 group-hover:opacity-100">{activeProfile.elements?.air}%</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-800">Aire</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-full">
                                    <div style={{ height: `${activeProfile.elements?.water}%` }} className="w-full bg-blue-500/60 rounded-t-sm transition-all duration-1000 relative group">
                                        <span className="absolute -top-4 w-full text-center text-[10px] opacity-0 group-hover:opacity-100">{activeProfile.elements?.water}%</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-900">Agua</span>
                                </div>
                            </div>

                            <p className="font-headings text-gray-800 italic">
                                "{activeProfile.description}"
                            </p>
                            <button onClick={handleSaveCharacter} className="mt-6 text-[10px] uppercase font-bold hover:text-[#5B7C99] underline decoration-dotted">[ Guardar ]</button>
                        </div>

                        {/* Comparison Tool */}
                        <div className="glass-panel p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-serif text-xl border-b border-black/10">Lente Comparativa</h3>
                                <select className="bg-transparent border-b border-black font-mono text-xs px-2 py-1 outline-none cursor-pointer text-black" value={comparisonTargetId} onChange={(e) => setComparisonTargetId(e.target.value)}>
                                    <option value="user">Vs. Mí Mismo</option>
                                    {friends.map(f => <option key={f.id} value={f.id}>Vs. {f.name}</option>)}
                                </select>
                            </div>

                            {/* Side-by-Side Source Charts - Responsive & Fitted */}
                            <div className="flex justify-center gap-8 mb-8 w-full px-4">
                                {/* Chart A (Base) */}
                                <div className="flex-1 flex flex-col items-center min-w-[120px]">
                                    <span className="text-[10px] font-bold uppercase mb-4 text-gray-500 tracking-widest text-center truncate w-full">{targetData?.name || 'Base'}</span>
                                    <div className="w-full max-w-[200px] aspect-square relative border border-black/5 rounded-full bg-[#F9F8F4] p-4 shadow-sm">
                                        {targetData && <NatalChart2D date={targetData.date} latitude={targetData.lat} longitude={targetData.lon} transparent={true} />}
                                    </div>
                                </div>

                                {/* Chart B (Active Character) */}
                                <div className="flex-1 flex flex-col items-center min-w-[120px]">
                                    <span className="text-[10px] font-bold uppercase mb-4 text-gray-500 tracking-widest text-center truncate w-full">{activeProfile.name}</span>
                                    <div className="w-full max-w-[200px] aspect-square relative border border-black/5 rounded-full bg-[#F9F8F4] p-4 shadow-sm filter hue-rotate-[160deg]">
                                        <NatalChart2D date={activeProfile.birthData.date} latitude={40} longitude={-3} transparent={true} />
                                    </div>
                                </div>
                            </div>

                            {/* The Camera (Fusion) */}
                            <div className="flex-1 flex flex-col items-center justify-center border-t border-black/5 pt-4">
                                <span className="text-[10px] text-[#5B7C99] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    Cámara de Fusión (Overlay)
                                </span>
                                {targetData && <SynastryOverlay
                                    userDate={targetData.date} userLat={targetData.lat} userLon={targetData.lon} userName={targetData.name}
                                    otherDate={activeProfile.birthData.date} otherLat={activeProfile.birthData.latitude} otherLon={activeProfile.birthData.longitude} otherName={activeProfile.name}
                                />}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border border-dashed border-black/20 rounded p-12 bg-white/40">
                        <div className="text-4xl text-gray-400 mb-4 font-serif">?</div>
                        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest text-center">
                            Esperando Guión...<br />Pega tu texto a la izquierda.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
