"use client";
import React, { useState, useEffect } from 'react';
import { BirthData, calculateRealPlanets, findPossibleBirthDates } from '@/utils/astronomy';
import { calculateAspects, Aspect } from '@/utils/astrology';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import SynastryOverlay from '@/components/antigravity/SynastryOverlay';
import NatalChart2D from '@/components/antigravity/NatalChart2D';
import { analyzeCharacter } from '@/ai/analyze-character';
import { analyzeSynastry } from '@/ai/analyze-synastry';
import { refineCharacter } from '@/ai/refine-character';
import { generateDailyReading } from '@/ai/daily-reading';
import { DailyReadingOutput, AnalyzeSynastryOutput } from '@/ai/schemas';
import {
    Loader2, UserPlus, Users, Sparkles, BookOpen, Sun, Atom, Ghost, Book,
    Upload, Trash2, Save, ChevronDown, ChevronLeft, Pencil, Plus, Minus, Download, X,
    BrainCircuit, Activity, Maximize2, Clapperboard, Zap, Fingerprint
} from 'lucide-react';
import ArchetypeLibrary from '@/components/antigravity/ArchetypeLibrary';
import ElementalDiagram from '@/components/antigravity/ElementalDiagram';
import CelestialSphere from '@/components/antigravity/CelestialSphere';
import { parsePdfAction } from '@/ai/parse-pdf';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SomaticBody from '@/components/antigravity/SomaticBody';
import { getSomaticAnalysis, SomaticPoint } from '@/utils/somatic-mapping';
import { ViewMode, AlchimestrySubView, UserData, ChartTheme, CosmosViewMode, CharacterProfile, ThemeSettings } from './types';
import AlchimestryView from './AlchimestryView';
import CosmosView from './CosmosView';
import CharacterWorkshop from './CharacterWorkshop';
import { ChartZoomWrapper, PlanetaryTrinity, CharacterTransits, downloadChartAsPDF } from './shared-components';
import VisualEngine from './VisualEngine';
import InteractiveStars from './InteractiveStars';
import AlchemicalPortal from './AlchemicalPortal';
import MiniCalculator from './MiniCalculator';
import ChartNotesSystem from './ChartNotesSystem';
import { auth } from '@/lib/auth';

export default function ScriptAnalyzer() {
    // --- STATE ---
    const [viewMode, setViewMode] = useState<ViewMode>('COSMOS');
    const [previousViewMode, setPreviousViewMode] = useState<ViewMode>('COSMOS');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [alchimestrySubView, setAlchimestrySubView] = useState<AlchimestrySubView>('inicio');

    // AUTH STATE
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
        backgroundColor: '#F2F0E9',
        accentColor: '#C55959',
        textColor: '#1a1a1a',
        bgImage: '/antigravity/astral_background_v2.png',
        bgOpacity: 15,
        blurAmount: 0,
        parallaxIntensity: 30,
        fontFamily: 'serif',
        glassOpacity: 70
    });

    // QUANTUM SYNASTRY STATE
    const [synastryResult, setSynastryResult] = useState<AnalyzeSynastryOutput | null>(null);
    const [isAnalyzingSynastry, setIsAnalyzingSynastry] = useState(false);

    // Backgrounds
    const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
    const [customKnowledge, setCustomKnowledge] = useState<any[]>([]);

    // User / Cosmos State
    const [cosmosViewMode, setCosmosViewMode] = useState<CosmosViewMode>('RADIAL');
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [userLibrary, setUserLibrary] = useState<UserData[]>([]);
    const [showUserLibrary, setShowUserLibrary] = useState(false);
    const [userSigns, setUserSigns] = useState<{ sun: string, moon: string, ascendant: string } | null>(null);
    const [dailyAspects, setDailyAspects] = useState<Aspect[]>([]);
    const [mundaneAspects, setMundaneAspects] = useState<Aspect[]>([]);
    const [dailyReading, setDailyReading] = useState<DailyReadingOutput | null>(null);
    const [isReadingLoading, setIsReadingLoading] = useState(false);

    // Body / Script State
    const [script, setScript] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [characterProfiles, setCharacterProfiles] = useState<CharacterProfile[]>([]);
    const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
    const [isRefining, setIsRefining] = useState(false);
    const [transitDate, setTransitDate] = useState<Date>(new Date());
    const [showSomatic, setShowSomatic] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [scriptLibrary, setScriptLibrary] = useState<{ id: number, title: string, content: string, date: string }[]>([]);
    const [forceReanalysis, setForceReanalysis] = useState(false);

    // Spirit / Network State
    const [friends, setFriends] = useState<any[]>([]);
    const [newFriend, setNewFriend] = useState({ name: '', date: '', time: '12:00' });
    const [spiritSourceId, setSpiritSourceId] = useState<string>('user');
    const [spiritTargetId, setSpiritTargetId] = useState<string>('');
    const [chartOpacity, setChartOpacity] = useState<number>(60);
    const [baseOpacity, setBaseOpacity] = useState<number>(100);
    const [chartTheme, setChartTheme] = useState<ChartTheme>('classic');
    const [alignAries, setAlignAries] = useState(false);

    // Portal transition handler
    const handleViewModeChange = (newMode: ViewMode) => {
        if (newMode === viewMode) return;
        setPreviousViewMode(viewMode);
        setIsTransitioning(true);
        setTimeout(() => {
            setViewMode(newMode);
            setTimeout(() => setIsTransitioning(false), 1200);
        }, 100);
    };

    const handleLogin = (email: string) => {
        setUserEmail(email);
        setIsLoggedIn(true);
        localStorage.setItem('antigravity_email', email);
    };

    const handleLogout = () => {
        if (confirm("¿Estás seguro de que quieres cerrar sesión? Esto limpiará los datos no guardados locales.")) {
            setIsLoggedIn(false);
            setUserEmail('');
            localStorage.removeItem('antigravity_email');
            window.location.reload();
        }
    };

    // UI state
    const [dateParts, setDateParts] = useState({ day: '', month: '', year: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [locationResults, setLocationResults] = useState<any[]>([]);
    const [selectedTimezone, setSelectedTimezone] = useState<string>('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        const userStr = localStorage.getItem('userBirthData');
        const userLibStr = localStorage.getItem('userLibrary');
        const friendsStr = localStorage.getItem('astroFriends');
        const scriptLibStr = localStorage.getItem('scriptLibrary');
        const lastSession = localStorage.getItem('lastSessionData');
        // CHECK FOR FIREBASE AUTH FIRST
        auth.getCurrentUser().then(user => {
            if (user && user.email) {
                setUserEmail(user.email);
                setIsLoggedIn(true);
            } else if (savedEmail) {
                // Fallback to legacy local email if no Firebase user
                setUserEmail(savedEmail);
                setIsLoggedIn(true);
            }
        });

        const themeStr = localStorage.getItem('themeSettings');

        if (themeStr) {
            try { setThemeSettings(JSON.parse(themeStr)); } catch (e) { }
        }

        if (userLibStr) {
            try { setUserLibrary(JSON.parse(userLibStr)); } catch (e) { }
        }
        if (scriptLibStr) {
            try { setScriptLibrary(JSON.parse(scriptLibStr)); } catch (e) { }
        }
        if (friendsStr) {
            try { setFriends(JSON.parse(friendsStr)); } catch (e) { }
        }
        if (lastSession) {
            try {
                const session = JSON.parse(lastSession);
                if (session.script) setScript(session.script);
                if (session.profiles) setCharacterProfiles(session.profiles);
            } catch (e) { }
        }

        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                setCurrentUser(userData);
                syncDateParts(userData.date);
                const planets = calculateRealPlanets(userData.date, userData.latitude, userData.longitude);
                syncUserSigns(planets);
            } catch (e) { }
        }
    }, []);

    // Sync signs helper
    const syncUserSigns = (planets: any) => {
        const getSign = (lon: number) => ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'][Math.floor(lon / 30) % 12];
        const sun = planets.planets.find((p: any) => p.name === 'Sol');
        const moon = planets.planets.find((p: any) => p.name === 'Luna');
        if (sun && moon) {
            setUserSigns({ sun: getSign(sun.longitude), moon: getSign(moon.longitude), ascendant: getSign(planets.ascendant) });
        }
    };

    const syncDateParts = (dateStr: string) => {
        const d = new Date(dateStr);
        setDateParts({ day: d.getDate().toString(), month: (d.getMonth() + 1).toString(), year: d.getFullYear().toString() });
    };

    // Parallax
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            document.documentElement.style.setProperty('--parallax-x', `${x}px`);
            document.documentElement.style.setProperty('--parallax-y', `${y}px`);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Backgrounds
    useEffect(() => {
        const fetchBg = async () => {
            try {
                const categoryMap: Record<string, string> = { 'COSMOS': 'COSMOS', 'BODY': 'CUERPO', 'SPIRIT': 'ESPIRITU' };
                const category = categoryMap[viewMode] || viewMode;
                const res = await fetch(`/api/backgrounds?category=${category}`);
                const data = await res.json();
                if (data.images && data.images.length > 0) {
                    if (viewMode === 'SPIRIT') {
                        setBackgroundImages(['/antigravity/Simbolos-alquimia-2.jpg', '/antigravity/simbolos-alquimia.jpg']);
                    } else {
                        const shuffled = data.images.sort(() => 0.5 - Math.random());
                        setBackgroundImages(shuffled.slice(0, 2));
                    }
                }
            } catch (e) { }
        };
        fetchBg();
    }, [viewMode]);

    // Transits & Reading
    useEffect(() => {
        if (currentUser) {
            const transits = calculateRealPlanets(transitDate.toISOString(), currentUser.latitude, currentUser.longitude);
            const natal = calculateRealPlanets(currentUser.date, currentUser.latitude, currentUser.longitude);
            const aspects = calculateAspects(transits.planets, natal.planets, 'NATAL');
            setDailyAspects(aspects.slice(0, 5));
            const timer = setTimeout(() => fetchDailyReading(currentUser, aspects.slice(0, 5)), 500);
            return () => clearTimeout(timer);
        }
    }, [transitDate, currentUser]);

    const fetchDailyReading = async (user: UserData, aspects: Aspect[]) => {
        setIsReadingLoading(true);
        try {
            const reading = await generateDailyReading({
                birthData: { date: user.date, city: user.city },
                aspects: aspects.map(a => ({ planet1: a.planet1, planet2: a.planet2, type: a.type })),
                userName: user.name || user.city || "Alquimista"
            });
            setDailyReading(reading);
        } catch (e) { } finally { setIsReadingLoading(false); }
    };

    // Handlers
    const handleSaveUser = (data: UserData) => {
        setCurrentUser(data);
        localStorage.setItem('userBirthData', JSON.stringify(data));
        if (data.name) {
            const updatedLib = [data, ...userLibrary.filter(u => u.name !== data.name)].slice(0, 200);
            setUserLibrary(updatedLib);
            localStorage.setItem('userLibrary', JSON.stringify(updatedLib));
        }
        const planets = calculateRealPlanets(data.date, data.latitude, data.longitude);
        syncUserSigns(planets);
    };

    const handleDatePartChange = (field: 'day' | 'month' | 'year', value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newParts = { ...dateParts, [field]: value };
        setDateParts(newParts);
        const d = parseInt(newParts.day); const m = parseInt(newParts.month); const y = parseInt(newParts.year);
        if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1000 && y < 3000) {
            const baseDate = currentUser?.date ? new Date(currentUser.date) : new Date();
            baseDate.setFullYear(y); baseDate.setMonth(m - 1); baseDate.setDate(d);
            const newIso = baseDate.toISOString();
            setCurrentUser(prev => prev ? { ...prev, date: newIso } : { date: newIso, latitude: 40, longitude: -3, city: '' });
        }
    };

    const handleLocationSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=es&format=json`);
            const data = await res.json();
            if (data.results) setLocationResults(data.results);
        } catch (e) { } finally { setIsSearching(false); }
    };

    const selectLocation = (loc: any) => {
        setLocationResults([]); setSearchQuery(''); setSelectedTimezone(loc.timezone);
        setCurrentUser(prev => {
            const base = prev || { date: new Date().toISOString() };
            return { ...base, city: loc.name, latitude: loc.latitude, longitude: loc.longitude } as UserData;
        });
    };

    const handleAnalyzeScript = async () => {
        if (!script) return;
        setIsAnalyzing(true);
        try {
            const names = parseScript(script);
            let charsToAnalyze = names;
            if (!forceReanalysis) charsToAnalyze = names.filter(n => !characterProfiles.find(p => p.name === n));
            if (charsToAnalyze.length === 0) { setIsAnalyzing(false); return; }

            const newProfiles = [...characterProfiles];
            for (const name of charsToAnalyze) {
                const analysis: any = await analyzeCharacter({ scriptSegment: script.substring(0, 20000), characterName: name, customKnowledge: [] });
                const approxDate = getApproxDateForSign(analysis.sunSign);
                const profile: CharacterProfile = {
                    id: name, name: name,
                    birthData: { date: approxDate, time: '12:00', latitude: 40.4168, longitude: -3.7038 },
                    fullAnalysis: analysis,
                    elements: analysis.elements
                };
                const existingIdx = newProfiles.findIndex(p => p.name === name);
                if (existingIdx >= 0) newProfiles[existingIdx] = profile; else newProfiles.push(profile);
            }
            setCharacterProfiles(newProfiles);
            localStorage.setItem('lastSessionData', JSON.stringify({ script, profiles: newProfiles }));
        } catch (e) { } finally { setIsAnalyzing(false); }
    };

    const parseScript = (text: string) => {
        const lines = text.split('\n'); const names = new Set<string>();
        const sceneHeadingRegex = /^(INT\.|EXT\.|EST\.)/i;
        const strictCharRegex = /^\s*([A-ZÁÉÍÓÚÑ]{3,20}(\s[A-ZÁÉÍÓÚÑ]+)*)(\s*\(.*\))?\s*$/;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 0 && strictCharRegex.test(trimmed) && !sceneHeadingRegex.test(trimmed)) {
                if (!trimmed.includes("TO:") && !trimmed.includes("FADE")) {
                    const m = trimmed.match(strictCharRegex); if (m) names.add(m[1].trim());
                }
            }
        }
        if (names.size === 0) {
            const dialogRegex = /^\s*([A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑ\s]+):\s*.+/;
            for (const line of lines) {
                const m = line.trim().match(dialogRegex);
                if (m) { const name = m[1].trim(); if (name.length < 20 && name.split(' ').length <= 3) names.add(name.toUpperCase()); }
            }
        }
        return Array.from(names);
    };

    const getApproxDateForSign = (sign: string) => {
        const map: Record<string, string> = {
            'Aries': '2000-03-25T12:00:00Z', 'Tauro': '2000-04-25T12:00:00Z', 'Géminis': '2000-05-25T12:00:00Z',
            'Cáncer': '2000-06-25T12:00:00Z', 'Leo': '2000-07-25T12:00:00Z', 'Virgo': '2000-08-25T12:00:00Z',
            'Libra': '2000-09-25T12:00:00Z', 'Escorpio': '2000-10-25T12:00:00Z', 'Sagitario': '2000-11-25T12:00:00Z',
            'Capricornio': '2000-12-25T12:00:00Z', 'Acuario': '2000-01-25T12:00:00Z', 'Piscis': '2000-02-25T12:00:00Z'
        };
        const found = Object.keys(map).find(k => sign.toLowerCase().includes(k.toLowerCase())) || 'Aries';
        return map[found];
    };

    const recalculateElements = (base: any, sun: string, moon: string, asc: string) => {
        const signs: Record<string, string> = {
            'Aries': 'fire', 'Leo': 'fire', 'Sagitario': 'fire', 'Tauro': 'earth', 'Virgo': 'earth', 'Capricornio': 'earth',
            'Géminis': 'air', 'Libra': 'air', 'Acuario': 'air', 'Cáncer': 'water', 'Escorpio': 'water', 'Piscis': 'water'
        };
        const res = { fire: 0, earth: 0, air: 0, water: 0 };
        const add = (s: string, w: number) => {
            const entry = Object.keys(signs).find(k => s.includes(k)) || 'Aries';
            const el = signs[entry] as keyof typeof res;
            res[el] += w;
        };
        add(sun, 30); add(moon, 20); add(asc, 10);
        return res;
    };

    const handleAddFriend = () => {
        if (!newFriend.name || !newFriend.date) return;
        const entry = { id: Date.now().toString(), name: newFriend.name, birthData: { date: `${newFriend.date}T${newFriend.time}:00`, latitude: 40.4168, longitude: -3.7038 } };
        const updated = [...friends, entry]; setFriends(updated);
        localStorage.setItem('astroFriends', JSON.stringify(updated));
        setNewFriend({ name: '', date: '', time: '12:00' });
    };

    const handleAnalyzeSynastry = async (userDate: string, targetDate: string, tName: string) => {
        setIsAnalyzingSynastry(true); setSynastryResult(null);
        try {
            const res = await analyzeSynastry({ userBirthDate: userDate, targetBirthDate: targetDate, targetName: tName });
            setSynastryResult(res);
        } catch (e) { } finally { setIsAnalyzingSynastry(false); }
    };

    const renderQuantumSynastrySection = () => {
        if (!currentUser || !spiritTargetId) return null;
        let tName = "Objetivo"; let tDate = "";
        if (spiritTargetId.startsWith('char-')) {
            const char = characterProfiles[parseInt(spiritTargetId.split('-')[1])];
            if (char) { tName = char.name; tDate = char.birthData.date; }
        } else if (spiritTargetId !== 'user') {
            const f = friends.find(fr => fr.id === spiritTargetId);
            if (f) { tName = f.name; tDate = f.birthData.date; }
        }
        if (!tDate) return <div className="p-8 text-center text-zinc-500 text-xs italic">Selecciona un objetivo.</div>;

        const getDom = (d: string) => {
            const p = calculateRealPlanets(d);
            const elSigns = ['Fuego', 'Tierra', 'Aire', 'Agua'];
            const counts: any = { Fuego: 0, Tierra: 0, Aire: 0, Agua: 0 };
            p.planets.forEach(pl => {
                const el = elSigns[Math.floor(pl.longitude / 30) % 4] || 'Fuego';
                counts[el] += ['Sol', 'Luna'].includes(pl.name) ? 3 : 1;
            });
            return { counts, dominant: Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) };
        };

        const uDom = getDom(currentUser.date); const tDomData = getDom(tDate);
        const map: any = { "Fuego-Fuego": "LA LLAMA ETERNA", "Fuego-Tierra": "TIERRA QUEMADA", "Fuego-Aire": "INCENDIO FUGAZ", "Fuego-Agua": "VAPOR EMOCIONAL", "Tierra-Tierra": "LA MONTAÑA", "Tierra-Aire": "TORMENTA DE ARENA", "Tierra-Agua": "BARRO FÉRTIL", "Aire-Aire": "EL HURACÁN", "Aire-Agua": "TSUNAMI", "Agua-Agua": "OCÉANO PROFUNDO" };
        let key = `${uDom.dominant}-${tDomData.dominant}`; if (!map[key]) key = `${tDomData.dominant}-${uDom.dominant}`;
        const title = map[key] || "MISTERIO CÓSMICO";

        return (
            <div className="p-6 font-mono text-center">
                <div className="mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-black text-white tracking-widest">{title}</h2>
                    <p className="text-xs text-zinc-400 italic font-serif">Alquimia entre {uDom.dominant} y {tDomData.dominant}</p>
                </div>
                {!synastryResult ? (
                    <button onClick={() => handleAnalyzeSynastry(currentUser.date, tDate, tName)} disabled={isAnalyzingSynastry} className="px-6 py-3 bg-zinc-900 border border-zinc-700 text-white text-xs font-bold uppercase tracking-widest w-full flex items-center justify-center gap-2">
                        {isAnalyzingSynastry ? <Loader2 className="animate-spin" /> : <Zap size={16} />} {isAnalyzingSynastry ? 'ANALIZANDO...' : 'EJECUTAR MOTOR CUÁNTICO'}
                    </button>
                ) : (
                    <div className="text-left space-y-4 bg-black/40 p-6 border border-white/10 rounded-none animate-fadeIn">
                        {[synastryResult.phase1_survival_clash, synastryResult.phase2_friction_flow, synastryResult.phase3_integration_bridge].map((phase, i) => (
                            <div key={i} className="space-y-1">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase">{phase.title}</h4>
                                <p className="text-sm text-zinc-300 font-serif italic border-l-2 border-zinc-700 pl-3">{phase.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className="min-h-screen relative overflow-x-hidden transition-colors duration-1000"
            style={{
                color: themeSettings.textColor,
                fontFamily: themeSettings.fontFamily === 'serif' ? 'serif' : 'sans-serif',
                backgroundColor: themeSettings.backgroundColor
            }}
        >
            <VisualEngine
                settings={themeSettings}
                onSettingsChange={(newSettings) => {
                    setThemeSettings(newSettings);
                    localStorage.setItem('themeSettings', JSON.stringify(newSettings));
                }}
            />

            {/* Interactive Stars Background */}
            <InteractiveStars count={60} repulsionStrength={120} />

            {/* Alchemical Portal Transition */}
            <AlchemicalPortal
                isTransitioning={isTransitioning}
                fromMode={previousViewMode}
                toMode={viewMode}
            />

            {/* Chart Notes System */}
            <ChartNotesSystem chartId={currentUser?.date || 'default'} />

            <div className="max-w-[98vw] mx-auto p-4 md:p-8 relative z-10 font-sans text-stone-900 selection:bg-stone-200">
                {/* --- RESTORED TOP NAVIGATION (PRO) --- */}
                {/* --- PROFESSIONAL TOP NAVIGATION --- */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-10 bg-white/70 backdrop-blur-2xl p-8 rounded-none border border-[#1a1a1a]/10 shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.1)] relative z-[100]">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="p-2 border border-[#1a1a1a]/20 hover:bg-[#1a1a1a] hover:text-white transition-all group"
                                title="Volver al Inicio"
                            >
                                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <h1 className="text-6xl font-display tracking-[0.15em] text-[#1a1a1a] leading-none">ALCHEMISTERY</h1>
                        </div>
                        <p className="text-[10px] tracking-[0.4em] uppercase font-black text-[#C55959]/60 flex items-center gap-4 mt-2">
                            <span>Alquimia Actoral</span>
                            <span className="w-8 h-[1px] bg-[#C55959]/20"></span>
                            <span>v2.8.4</span>
                        </p>
                    </div>

                    <nav className="inline-flex gap-2 bg-stone-100 p-1 border border-black/5 overflow-x-auto max-w-full rounded-none">
                        {[
                            { id: 'COSMOS', icon: Atom, label: 'EL COSMOS' },
                            { id: 'BODY', icon: Fingerprint, label: 'EL CUERPO' },
                            { id: 'SPIRIT', icon: Users, label: 'EL ESPÍRITU' },
                            { id: 'ALCHIMESTRY', icon: () => <span className="text-2xl pt-1">⚂</span>, label: 'ALQUIMIA' }
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => handleViewModeChange(m.id as ViewMode)}
                                className={`flex items-center gap-4 px-10 py-5 transition-all duration-300 border rounded-none ${viewMode === m.id ? 'bg-black text-white border-black shadow-xl scale-105' : 'bg-transparent text-gray-400 border-transparent hover:text-gray-900 hover:bg-white'}`}
                            >
                                <div className="scale-100">
                                    {typeof m.icon === 'function' ? <m.icon /> : React.createElement(m.icon as any, { size: 22 })}
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em]">{m.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setShowLibrary(true)}
                            className="flex items-center gap-3 px-8 py-5 border border-black/10 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all shadow-sm rounded-none"
                        >
                            <BookOpen size={20} /> BIBLIOTHECA
                        </button>

                        <div className="h-12 w-px bg-black/10 hidden md:block"></div>

                        {isLoggedIn ? (
                            <div className="flex items-center gap-5 bg-[#C55959]/5 px-8 py-5 border border-[#C55959]/10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)] group/user transition-all hover:bg-[#C55959]/10">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-[#C55959]/60 uppercase tracking-[0.3em] leading-none mb-2">Operador Activo</span>
                                    <span className="text-sm font-serif text-[#1a1a1a] flex items-center gap-3">
                                        <Fingerprint size={14} className="opacity-40 group-hover/user:animate-pulse" />
                                        {userEmail.split('@')[0]}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-3 text-[#1a1a1a]/20 hover:text-[#ef4444] transition-all hover:bg-red-50"
                                    title="Desconectar Sesión"
                                >
                                    <Trash2 size={22} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-end group/auth">
                                <button
                                    onClick={() => {
                                        const email = window.prompt("Introduce tu Email de Operador:");
                                        if (email) handleLogin(email);
                                    }}
                                    className="bg-[#1a1a1a] text-white px-12 py-5 text-[11px] font-black uppercase tracking-[0.4em] shadow-[4px_4px_20px_rgba(0,0,0,0.2)] hover:bg-[#C55959] transition-all rounded-none"
                                >
                                    Acceso Operador
                                </button>
                                <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-2 opacity-50 font-mono">Session ID Required</span>
                            </div>
                        )}
                    </div>
                </header>

                <main className="relative">

                    {viewMode === 'COSMOS' && (
                        <CosmosView
                            currentUser={currentUser} setCurrentUser={setCurrentUser}
                            userLibrary={userLibrary} setUserLibrary={setUserLibrary}
                            showUserLibrary={showUserLibrary} setShowUserLibrary={setShowUserLibrary}
                            dateParts={dateParts} handleDatePartChange={handleDatePartChange}
                            handleLocationSearch={handleLocationSearch} isSearching={isSearching}
                            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                            locationResults={locationResults} selectLocation={selectLocation}
                            handleSaveUser={handleSaveUser} transitDate={transitDate} setTransitDate={setTransitDate}
                            cosmosViewMode={cosmosViewMode} setCosmosViewMode={setCosmosViewMode}
                            chartTheme={chartTheme} setChartTheme={setChartTheme}
                            userSigns={userSigns} dailyReading={dailyReading} isReadingLoading={isReadingLoading}
                            dailyAspects={dailyAspects}
                        />
                    )}

                    {viewMode === 'BODY' && (
                        <CharacterWorkshop
                            characterProfiles={characterProfiles} setCharacterProfiles={setCharacterProfiles}
                            selectedCharacterId={selectedCharacterId} setSelectedCharacterId={setSelectedCharacterId}
                            scriptText={script} setScriptText={setScript}
                            analyzeScript={handleAnalyzeScript} isAnalyzing={isAnalyzing}
                            isRefining={isRefining} setIsRefining={setIsRefining}
                            chartTheme={chartTheme} setChartTheme={setChartTheme}
                            recalculateElements={recalculateElements} getApproxDateForSign={getApproxDateForSign}
                            refineCharacter={refineCharacter}
                            openLibrary={() => setShowLibrary(true)}
                        />
                    )}

                    {viewMode === 'SPIRIT' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn pb-12">
                            <div className="lg:col-span-1 glass-panel p-6 rounded-none shadow-xl">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={18} /> Mi Red</h3>
                                <div className="space-y-2 mb-6">
                                    <button onClick={() => setSpiritTargetId('user')} className={`w-full text-left p-3 rounded border transition-all ${spiritTargetId === 'user' ? 'bg-black text-white' : 'bg-white hover:border-black'}`}>
                                        <span className="text-xs font-bold uppercase">Yo Mismo</span>
                                    </button>
                                    {characterProfiles.map((char, i) => (
                                        <button key={i} onClick={() => setSpiritTargetId('char-' + i)} className={`w-full text-left p-3 rounded border transition-all ${spiritTargetId === 'char-' + i ? 'bg-[#C55959] text-white' : 'bg-white hover:border-[#C55959]'}`}>
                                            <span className="text-xs font-bold uppercase block">{char.name}</span>
                                            <span className="text-[9px] opacity-70">Personaje</span>
                                        </button>
                                    ))}
                                    {friends.map(f => (
                                        <div key={f.id} className="relative group">
                                            <button onClick={() => setSpiritTargetId(f.id)} className={`w-full text-left p-3 rounded border transition-all ${spiritTargetId === f.id ? 'bg-[#5B7C99] text-white' : 'bg-white hover:border-[#5B7C99]'}`}>
                                                <span className="text-xs font-bold uppercase block">{f.name}</span>
                                            </button>
                                            <button onClick={() => setFriends(friends.filter(fr => fr.id !== f.id))} className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-all text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-50/50 p-4 rounded-none border border-black/5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Añadir Conexión</p>
                                    <input className="input-minimal w-full mb-2 bg-white px-3 py-2 text-xs" placeholder="Nombre" value={newFriend.name} onChange={e => setNewFriend({ ...newFriend, name: e.target.value })} />
                                    <div className="flex gap-2">
                                        <input type="date" className="input-minimal flex-1 bg-white text-[10px]" value={newFriend.date} onChange={e => setNewFriend({ ...newFriend, date: e.target.value })} />
                                        <button onClick={handleAddFriend} className="bg-[#5B7C99] text-white rounded px-4"><UserPlus size={16} /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 glass-panel p-8 rounded-none shadow-2xl flex flex-col items-center">
                                <h2 className="text-2xl font-serif text-[#1a1a1a] mb-8 w-full">Sinergia de Almas</h2>
                                {currentUser ? (
                                    <div className="w-full max-w-2xl aspect-square relative mb-8">
                                        <ChartZoomWrapper title="Vínculo Cuántico" theme={chartTheme} onThemeChange={setChartTheme}>
                                            <div className="relative w-full h-full">
                                                <div className="absolute inset-0 z-10" style={{ opacity: baseOpacity / 100 }}>
                                                    <NatalChart2D date={currentUser.date} latitude={currentUser.latitude} longitude={currentUser.longitude} theme={chartTheme} forceAriesZero={alignAries} />
                                                </div>
                                                {(() => {
                                                    let tDate = spiritTargetId.startsWith('char-') ? characterProfiles[parseInt(spiritTargetId.split('-')[1])]?.birthData.date : friends.find(f => f.id === spiritTargetId)?.birthData.date;
                                                    return tDate && (
                                                        <div className="absolute inset-0 z-20 mix-blend-multiply" style={{ opacity: chartOpacity / 100, filter: 'hue-rotate(180deg)' }}>
                                                            <NatalChart2D date={tDate} latitude={40} longitude={-3} theme={chartTheme} forceAriesZero={alignAries} />
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </ChartZoomWrapper>
                                        <div className="absolute bottom-4 left-0 right-0 z-30 flex flex-col items-center gap-3">
                                            <div className="flex gap-4">
                                                {[{ l: 'Base', v: baseOpacity, s: setBaseOpacity }, { l: 'Objetivo', v: chartOpacity, s: setChartOpacity }].map(sl => (
                                                    <div key={sl.l} className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-none border border-black/5 flex items-center gap-2">
                                                        <span className="text-[9px] font-bold uppercase text-gray-400">{sl.l}</span>
                                                        <input type="range" min="0" max="100" value={sl.v} onChange={e => sl.s(parseInt(e.target.value))} className="w-20 h-1 accent-[#C55959]" />
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={() => setAlignAries(!alignAries)} className={`px-4 py-2 text-[9px] font-bold uppercase rounded-none border transition-all ${alignAries ? 'bg-black text-white' : 'bg-white text-gray-500'}`}>
                                                {alignAries ? '★ Rotación: Aries 0°' : '☆ Rotación: Ascendente'}
                                            </button>
                                        </div>
                                    </div>
                                ) : <p className="p-20 text-gray-300 uppercase text-xs tracking-widest">Introduce tus datos primero.</p>}
                                <div className="w-full bg-black/5 border border-black/5 overflow-hidden">{renderQuantumSynastrySection()}</div>
                            </div>
                        </div>
                    )}
                </main>

                {showLibrary && <ArchetypeLibrary onClose={() => setShowLibrary(false)} />}

                {/* ALCHIMESTRY VIEW (TOP LEVEL) */}
                {viewMode === 'ALCHIMESTRY' && (
                    <AlchimestryView
                        currentUser={currentUser || { name: '', date: new Date().toISOString(), latitude: 0, longitude: 0, city: '' }}
                        setViewMode={setViewMode}
                    />
                )}
            </div>
        </div>
    );
}
