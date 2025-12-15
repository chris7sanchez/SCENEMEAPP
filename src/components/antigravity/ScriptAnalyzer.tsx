"use client";
import React, { useState, useEffect } from 'react';
import { BirthData, calculateRealPlanets, findPossibleBirthDates } from '@/utils/astronomy';
import { calculateAspects, Aspect } from '@/utils/astrology';
import { ZODIAC_ARCHETYPES } from '@/utils/archetypes';
import SynastryOverlay from '@/components/antigravity/SynastryOverlay';
import NatalChart2D from '@/components/antigravity/NatalChart2D';
import { analyzeCharacter } from '@/ai/analyze-character';
import { refineCharacter } from '@/ai/refine-character';
import { generateDailyReading } from '@/ai/daily-reading'; // NEW IMPORT
import { DailyReadingOutput } from '@/ai/schemas'; // NEW IMPORT
import { Loader2, UserPlus, Users, Sparkles, BookOpen, Sun, Atom, Ghost, Book, Upload, Trash2, Save, ChevronDown, Pencil, Plus, Minus, Download, X } from 'lucide-react';
import ArchetypeLibrary from '@/components/antigravity/ArchetypeLibrary';
import ElementalDiagram from '@/components/antigravity/ElementalDiagram';
import { parsePdfAction } from '@/ai/parse-pdf';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- TYPES ---
type ViewMode = 'COSMOS' | 'BODY' | 'SPIRIT';

// --- COMPONENT ---
export default function ScriptAnalyzer() {
    // --- STATE ---
    const [viewMode, setViewMode] = useState<ViewMode>('COSMOS');
    const [customKnowledge, setCustomKnowledge] = useState<any[]>([]); // NEW: Local state for immediate updates

    // Load Custom Knowledge on Mount


    // Background Dynamic Logic
    useEffect(() => {
        // Find the main or body element and apply classes, 
        // OR render a fixed background layer within this component that covers the screen.
        // We will do the latter for React control.
    }, [viewMode]);

    // User / Cosmos State
    const [cosmosViewMode, setCosmosViewMode] = useState<'RADIAL' | 'SPHERE'>('RADIAL'); // NEW: Radial vs Sphere view
    const [currentUser, setCurrentUser] = useState<BirthData | null>(null);
    const [userLibrary, setUserLibrary] = useState<BirthData[]>([]); // NEW: Library of users
    const [showUserLibrary, setShowUserLibrary] = useState(false); // NEW: Toggle library view
    const [userSigns, setUserSigns] = useState<{ sun: string, moon: string, ascendant: string } | null>(null); // NEW: Detailed signs
    const [dailyAspects, setDailyAspects] = useState<Aspect[]>([]);
    const [mundaneAspects, setMundaneAspects] = useState<Aspect[]>([]);

    // AI Reading State
    const [dailyReading, setDailyReading] = useState<DailyReadingOutput | null>(null);
    const [isReadingLoading, setIsReadingLoading] = useState(false);

    // Body / Script State
    const [script, setScript] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [detectedCharacters, setDetectedCharacters] = useState<string[]>([]);
    const [characterProfiles, setCharacterProfiles] = useState<any[]>([]);
    const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
    const [editingCharacterId, setEditingCharacterId] = useState<number | null>(null); // NEW: Manual Edit State
    const [bodyComparisonMode, setBodyComparisonMode] = useState<'SIDE_BY_SIDE' | 'OVERLAY'>('SIDE_BY_SIDE');
    const [isRefining, setIsRefining] = useState(false); // NEW: AI Refinement Loading State
    const [transitDate, setTransitDate] = useState<Date>(new Date()); // TIME MACHINE STATE

    // State for manual editing of character profiles
    const [foundDates, setFoundDates] = useState<Date[]>([]);
    const [isSearchingDates, setIsSearchingDates] = useState(false);
    const [editingCharacterSun, setEditingCharacterSun] = useState<string>('');
    const [editingCharacterMoon, setEditingCharacterMoon] = useState<string>('');
    const [editingCharacterAsc, setEditingCharacterAsc] = useState<string>('');

    const [showLibrary, setShowLibrary] = useState(false); // NEW: Library Modal State

    // Spirit / Network State
    const [friends, setFriends] = useState<any[]>([]);
    const [newFriend, setNewFriend] = useState({ name: '', date: '', time: '12:00' });
    const [spiritSourceId, setSpiritSourceId] = useState<string>('user'); // Left side of comparison
    const [spiritTargetId, setSpiritTargetId] = useState<string>(''); // Right side of comparison

    // Local Date Inputs State (for robust typing)
    const [dateParts, setDateParts] = useState({ day: '', month: '', year: '' });

    // Script Persistence & Library
    const [scriptLibrary, setScriptLibrary] = useState<{ id: number, title: string, content: string, date: string }[]>([]);
    const [forceReanalysis, setForceReanalysis] = useState(false);

    const [showScriptSelect, setShowScriptSelect] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Location Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [locationResults, setLocationResults] = useState<any[]>([]);
    const [selectedTimezone, setSelectedTimezone] = useState<string>('');

    // Refs for Auto-Focus
    const dayRef = React.useRef<HTMLInputElement>(null);
    const monthRef = React.useRef<HTMLSelectElement | any>(null);
    const yearRef = React.useRef<HTMLInputElement>(null);
    const timeRef = React.useRef<HTMLInputElement>(null); // NEW: Time ref for editing

    // Load Custom Knowledge on Mount & Update
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('customKnowledge');
            if (saved) setCustomKnowledge(JSON.parse(saved));
        }
    }, [showLibrary]); // Reload when library closes/updates

    // --- INITIALIZATION ---
    useEffect(() => {
        // Global handler for the library close button which uses window
        (window as any).closeArchetypes = () => setShowLibrary(false);

        const userStr = localStorage.getItem('userBirthData');
        const userLibStr = localStorage.getItem('userLibrary'); // NEW: Load Library
        const friendsStr = localStorage.getItem('astroFriends');

        if (userLibStr) {
            try {
                setUserLibrary(JSON.parse(userLibStr));
            } catch (e) { console.error("Error loading user library", e); }
        }

        // Load Reading
        const readingStr = localStorage.getItem('lastDailyReading');
        if (readingStr) {
            try {
                const parsed = JSON.parse(readingStr);
                // Check if it's from today (simple check)
                if (parsed.date === new Date().toDateString() && parsed.user === (JSON.parse(userStr || '{}').city)) {
                    setDailyReading(parsed.data);
                }
            } catch (e) { }
        }

        // Load Library
        const libStr = localStorage.getItem('scriptLibrary');
        if (libStr) setScriptLibrary(JSON.parse(libStr));

        // Load Last Session
        const lastSession = localStorage.getItem('lastSessionData');
        if (lastSession) {
            try {
                const session = JSON.parse(lastSession);
                if (session.script) setScript(session.script);
                if (session.profiles) setCharacterProfiles(session.profiles);
            } catch (e) { console.error("Error loading session", e); }
        }

        if (userStr) {
            const userData = JSON.parse(userStr);
            setCurrentUser(userData);
            const aspects = calculateTransits(userData);
            if (aspects) fetchDailyReading(userData, aspects);

            // Sync local inputs
            if (userData.date) {
                const d = new Date(userData.date);
                setDateParts({
                    day: d.getDate().toString(),
                    month: (d.getMonth() + 1).toString(),
                    year: d.getFullYear().toString()
                });
            }
        }
        if (friendsStr) setFriends(JSON.parse(friendsStr));
    }, []);

    // Auto-Save Session Logic
    useEffect(() => {
        if (script || characterProfiles.length > 0) {
            const sessionData = {
                script,
                profiles: characterProfiles,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('lastSessionData', JSON.stringify(sessionData));
        }
    }, [script, characterProfiles]);


    // Helper to sync local inputs to main state
    function handleDatePartChange(field: 'day' | 'month' | 'year', value: string) {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newParts = { ...dateParts, [field]: value };
        setDateParts(newParts);

        // Auto-Focus Logic
        if (field === 'day' && value.length === 2) monthRef.current?.focus();
        if (field === 'month' && value.length === 2) yearRef.current?.focus();

        // Try to construct valid date
        const d = parseInt(newParts.day);
        const m = parseInt(newParts.month);
        const y = parseInt(newParts.year);

        if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1000 && y < 3000) {
            updateUserDate(d, m, y);
        }
    }

    function updateUserDate(day: number, month: number, year: number) {
        const baseDate = currentUser?.date ? new Date(currentUser.date) : new Date();
        baseDate.setFullYear(year);
        baseDate.setMonth(month - 1);
        baseDate.setDate(day);

        const newDateIso = baseDate.toISOString();

        setCurrentUser(prev => prev ?
            { ...prev, date: newDateIso } :
            { date: newDateIso, latitude: 40, longitude: -3, city: '' }
        );
    }

    // --- LOCATION SEARCH LOGIC ---
    const handleLocationSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            // Using Open-Meteo Geocoding API (No key needed)
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=es&format=json`);
            const data = await res.json();
            if (data.results) {
                setLocationResults(data.results);
            } else {
                setLocationResults([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    const selectLocation = (loc: any) => {
        setLocationResults([]);
        setSearchQuery('');
        setSelectedTimezone(loc.timezone);

        // Update user location
        setCurrentUser(prev => {
            const base = prev || { date: new Date().toISOString() };
            return {
                ...base,
                city: loc.name,
                latitude: loc.latitude,
                longitude: loc.longitude,
                // We could technically adjust the time to UTC here if we had the offset,
                // but typically astrology libs handle local time if lat/lon is known or assume UTC.
                // For now we store the coordinates primarily.
            } as any;
        });

        alert(`Ubicación establecida: ${loc.name} (${loc.country})\nZona Horaria: ${loc.timezone}`);
    };

    // --- LOGIC: COSMOS (Transits) ---
    function calculateTransits(user: BirthData, tDate: Date = new Date()) {
        if (!user || !user.date) return;
        const now = tDate;
        const transits = calculateRealPlanets(now.toISOString(), user.latitude, user.longitude);
        const natal = calculateRealPlanets(user.date, user.latitude, user.longitude);

        const aspects = calculateAspects(transits.planets, natal.planets, 'NATAL');
        setDailyAspects(aspects.slice(0, 5)); // Top 5 Personal

        // Mundane (Transit vs Transit)
        const globalAspects = calculateAspects(transits.planets, transits.planets, 'MUNDANE');
        setMundaneAspects(globalAspects.slice(0, 5)); // Top 5 Global

        return aspects.slice(0, 5);
    }

    async function fetchDailyReading(user: BirthData, aspects: Aspect[]) {
        if (!user || aspects.length === 0) return;
        setIsReadingLoading(true);
        try {
            const reading = await generateDailyReading({
                birthData: { date: user.date, city: user.city },
                aspects: aspects.map(a => ({
                    planet1: a.planet1,
                    planet2: a.planet2,
                    type: a.type,
                })),
                userName: user.name || user.city || "Alquimista"
            });
            setDailyReading(reading);
            // Cache it
            localStorage.setItem('lastDailyReading', JSON.stringify({
                date: new Date().toDateString(),
                user: user.city,
                data: reading
            }));
        } catch (e) {
            console.error(e);
        } finally {
            setIsReadingLoading(false);
        }
    }

    // Auto-Save Session
    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem('lastSessionData', JSON.stringify({ script, profiles: characterProfiles }));
        }, 1000);
        return () => clearTimeout(timeout);
    }, [script, characterProfiles]);

    function handleSaveUser(data: BirthData) {
        setCurrentUser(data);
        localStorage.setItem('userBirthData', JSON.stringify(data));

        // Auto-save to library if it has a name
        if (data.name && data.name.trim().length > 0) {
            saveUserToLibrary(data);
        }

        const aspects = calculateTransits(data);
        if (aspects) fetchDailyReading(data, aspects);

        // Calculate Signs for Display
        const planets = calculateRealPlanets(data.date, data.latitude, data.longitude);
        const sun = planets.planets.find(p => p.name === 'Sol');
        const moon = planets.planets.find(p => p.name === 'Luna');

        if (sun && moon) {
            const getSign = (lon: number) => ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'][Math.floor(lon / 30) % 12];

            setUserSigns({
                sun: getSign(sun.longitude),
                moon: getSign(moon.longitude),
                ascendant: getSign(planets.ascendant)
            });
        }

        alert("Estructura Cósmica (Yo) Guardada.");
    }

    // --- USER LIBRARY LOGIC ---
    function saveUserToLibrary(data: BirthData) {
        if (!data.name) return;

        // Check if exists (update) or new
        // We use 'name' as ID.

        setUserLibrary(prev => {
            const existingIndex = prev.findIndex(u => u.name === data.name);
            let updated;
            if (existingIndex >= 0) {
                updated = [...prev];
                updated[existingIndex] = data;
            } else {
                updated = [data, ...prev];
            }

            // Limit to 200
            if (updated.length > 200) updated = updated.slice(0, 200);

            localStorage.setItem('userLibrary', JSON.stringify(updated));
            return updated;
        });
    }

    function loadUserFromLibrary(data: BirthData) {
        setCurrentUser(data);
        // Sync local inputs
        if (data.date) {
            const d = new Date(data.date);
            setDateParts({
                day: d.getDate().toString(),
                month: (d.getMonth() + 1).toString(),
                year: d.getFullYear().toString()
            });
        }
        // Recalculate everything
        handleSaveUser(data); // This triggers transits, reading, etc.
        setShowUserLibrary(false);
    }

    function deleteUserFromLibrary(name: string) {
        if (!confirm(`¿Eliminar carta de ${name}?`)) return;
        setUserLibrary(prev => {
            const updated = prev.filter(u => u.name !== name);
            localStorage.setItem('userLibrary', JSON.stringify(updated));
            return updated;
        });
    }

    // --- LOGIC: BODY (Script Analysis) ---
    const parseScript = (text: string) => {
        const lines = text.split('\n');
        const names = new Set<string>();

        // Strategy 1: Standard Screenplay (Uppercased Names, centered-ish)
        const sceneHeadingRegex = /^(INT\.|EXT\.|EST\.)/i;
        const strictCharRegex = /^\s*([A-ZÁÉÍÓÚÑ]{3,20}(\s[A-ZÁÉÍÓÚÑ]+)*)(\s*\(.*\))?\s*$/;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length > 0 && strictCharRegex.test(line) && !sceneHeadingRegex.test(line)) {
                // Ignore TRANSITIONS like "CUT TO:", "FADE OUT" if they match
                if (!line.includes("TO:") && !line.includes("FADE")) {
                    const nameMatch = line.match(strictCharRegex);
                    if (nameMatch) names.add(nameMatch[1].trim());
                }
            }
        }

        // Strategy 2: Fallback (Name: Dialog format) if few results
        if (names.size === 0) {
            const dialogRegex = /^\s*([A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑ\s]+):\s*.+/;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const match = line.match(dialogRegex);
                if (match) {
                    const possibleName = match[1].trim();
                    // Filter out common false positives if needed, but keep it simple
                    if (possibleName.length < 20 && possibleName.split(' ').length <= 3) {
                        names.add(possibleName.toUpperCase());
                    }
                }
            }
        }

        return Array.from(names);
    };

    const extractCharacterContext = (fullText: string, charName: string) => {
        return fullText.substring(0, 20000); // Simple context extraction
    };

    const getApproxDateForSign = (signName: string) => {
        const map: Record<string, string> = {
            'Aries': '2000-03-25T12:00:00Z',
            'Taurus': '2000-04-25T12:00:00Z', 'Tauro': '2000-04-25T12:00:00Z',
            'Gemini': '2000-05-25T12:00:00Z', 'Géminis': '2000-05-25T12:00:00Z',
            'Cancer': '2000-06-25T12:00:00Z', 'Cáncer': '2000-06-25T12:00:00Z',
            'Leo': '2000-07-25T12:00:00Z',
            'Virgo': '2000-08-25T12:00:00Z',
            'Libra': '2000-09-25T12:00:00Z',
            'Scorpio': '2000-10-25T12:00:00Z', 'Escorpio': '2000-10-25T12:00:00Z',
            'Sagittarius': '2000-11-25T12:00:00Z', 'Sagitario': '2000-11-25T12:00:00Z',
            'Capricorn': '2000-12-25T12:00:00Z', 'Capricornio': '2000-12-25T12:00:00Z',
            'Aquarius': '2000-01-25T12:00:00Z', 'Acuario': '2000-01-25T12:00:00Z',
            'Pisces': '2000-02-25T12:00:00Z', 'Piscis': '2000-02-25T12:00:00Z',
        };
        for (const k of Object.keys(map)) {
            if (signName.toLowerCase().includes(k.toLowerCase())) return map[k];
        }
        return map['Aries'];
    };

    const handleAnalyzeScript = async () => {
        if (!script) {
            alert('El guión está vacío. Por favor escribe o sube un PDF.');
            return;
        }
        setIsAnalyzing(true);
        try {
            const names = parseScript(script);
            setDetectedCharacters(names);

            if (names.length === 0) {
                alert('No se detectaron personajes. Intenta usar el formato "NOMBRE: Diálogo" o "NOMBRE EN MAYÚSCULAS" (centrado).');
                setIsAnalyzing(false);
                return;
            }

            // Determine which characters to analyze
            let charsToAnalyze = names;
            if (!forceReanalysis) {
                // Only analyze those we don't have ANY profile for
                charsToAnalyze = names.filter(n => !characterProfiles.find(p => p.name === n));
            }

            if (charsToAnalyze.length === 0) {
                alert('Todos los personajes detectados ya tienen análisis. Activa "Recrear Personajes" para forzar un nuevo análisis.');
                setIsAnalyzing(false);
                return;
            }

            // Start Analysis Log
            console.log(`Analyzing ${charsToAnalyze.length} characters...`);
            // alert(`Iniciando análisis de ${charsToAnalyze.length} personajes... (Esto puede tardar unos segundos)`);

            const newProfiles = [...characterProfiles];

            for (const name of charsToAnalyze) {
                const context = extractCharacterContext(script, name);

                // Get Custom Knowledge
                let customKnowledge = [];
                try {
                    const saved = localStorage.getItem('customKnowledge');
                    if (saved) customKnowledge = JSON.parse(saved);
                } catch (e) { console.error("Error reading custom knowledge", e); }

                const analysis: any = await analyzeCharacter({
                    scriptSegment: context,
                    characterName: name,
                    customKnowledge: customKnowledge
                });

                // Check if AI failed
                if (analysis.sunSign === "Unknown") {
                    console.warn(`Analysis failed for ${name}`);
                }

                // Fallback date
                const approxDate = getApproxDateForSign(analysis.sunSign);

                // Create Profile
                const profile: any = {
                    id: name, // simple ID
                    name: name,
                    birthData: {
                        date: approxDate,
                        time: '12:00',
                        lat: 40.4168, // Madrid default
                        lon: -3.7038,
                        placeName: 'Madrid, Spain (Default)',
                        timezone: 'Europe/Madrid'
                    },
                    fullAnalysis: {
                        ...analysis, // This now includes threePillars
                        elements: { ...analysis.elements, fire: analysis.elements.fire, earth: analysis.elements.earth, air: analysis.elements.air, water: analysis.elements.water }
                    }
                };

                // Remove existing if any (case of force reanalysis)
                const existingIndex = newProfiles.findIndex(p => p.name === name);
                if (existingIndex >= 0) {
                    newProfiles[existingIndex] = profile;
                } else {
                    newProfiles.push(profile);
                }
            }

            setCharacterProfiles(newProfiles);
            localStorage.setItem('lastSessionData', JSON.stringify({ script, characterProfiles: newProfiles }));
            // alert('Análisis completado.');

        } catch (error) {
            console.error(error);
            alert('Error durante el análisis. Revisa la consola o intenta de nuevo.');
        }
        finally { setIsAnalyzing(false); }
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
                setScript(result.text);
                alert("PDF Procesado Correctamente. Texto extraído.");
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión al procesar PDF.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const saveScriptToLibrary = () => {
        if (!script.trim()) {
            alert("El guión está vacío. Escribe o pega texto primero.");
            return;
        }
        const title = prompt("Nombre para guardar este guión:", "Nuevo Guión " + new Date().toLocaleDateString());
        if (!title) return;

        const newEntry = { id: Date.now(), title, content: script, date: new Date().toISOString() };
        const updatedLib = [newEntry, ...scriptLibrary];
        setScriptLibrary(updatedLib);
        localStorage.setItem('scriptLibrary', JSON.stringify(updatedLib));
        alert("Guión guardado en biblioteca.");
    };

    const loadScript = (content: string) => {
        if (confirm("¿Cargar guión? Esto reemplazará el texto actual.")) {
            setScript(content);
            setShowScriptSelect(false);
        }
    };

    // --- LOGIC: SPIRIT (Network) ---
    const handleAddFriend = () => {
        if (!newFriend.name || !newFriend.date) return;
        const friendEntry = {
            id: Date.now().toString(),
            name: newFriend.name,
            birthData: {
                date: new Date(newFriend.date + 'T' + newFriend.time).toISOString(),
                latitude: 40.4168,
                longitude: -3.7038
            }
        };
        const updated = [...friends, friendEntry];
        setFriends(updated);
        localStorage.setItem('astroFriends', JSON.stringify(updated));
        setNewFriend({ name: '', date: '', time: '12:00' });
        alert("Miembro añadido a la Red.");
    };

    // HELPER: Get Data for Comparisons
    const getSubjectData = (id: string | number) => {
        if (id === 'user' && currentUser) return { ...currentUser, name: currentUser.city || 'Yo (Cosmos)' };

        // Check Characters
        if (typeof id === 'number') {
            const char = characterProfiles[id];
            if (char) return { ...char.birthData, name: char.name };
        }

        // Check Friends
        const friend = friends.find(f => f.id === id);
        if (friend) return { ...friend.birthData, name: friend.name };

        return null;
    };

    // HELPER: Re-Calculate Elements based on Signs
    const recalculateElements = (baseElements: any, sun: string, moon: string, asc: string) => {
        // Element mapping
        const signs: Record<string, string> = {
            'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire', 'Sagitario': 'fire',
            'Taurus': 'earth', 'Tauro': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth', 'Capricornio': 'earth',
            'Gemini': 'air', 'Géminis': 'air', 'Libra': 'air', 'Aquarius': 'air', 'Acuario': 'air',
            'Cancer': 'water', 'Cáncer': 'water', 'Scorpio': 'water', 'Escorpio': 'water', 'Pisces': 'water', 'Piscis': 'water'
        };

        const newElements = { fire: 0, earth: 0, air: 0, water: 0 }; // Start fresh for recalculation

        // Boost factor per sign placement
        const boost = (sign: string, amount: number) => {
            const el = (signs[sign] || signs[Object.keys(signs).find(k => sign.includes(k)) || 'Aries']) as keyof typeof newElements;
            if (el && newElements[el] !== undefined) {
                newElements[el] += amount;
            }
        };

        // Weightings: Sun (Strong), Moon (Deep), Asc (Surface)
        boost(sun, 30);
        boost(moon, 20);
        boost(asc, 10);

        return newElements;
    };


    // --- CHART VISUAL WRAPPER & UTILS ---
    const downloadChartAsPDF = async (elementId: string, title: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.setFontSize(16);
            pdf.text(title, 10, 10);
            pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
            pdf.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
        } catch (e) {
            console.error("PDF Export Error", e);
            alert("Error generando PDF.");
        }
    };

    const ChartZoomWrapper = ({ children, title = "Carta Astral" }: { children: React.ReactNode, title?: string }) => {
        const [zoom, setZoom] = useState(1);
        const id = `chart-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="relative group w-full aspect-square bg-[#F9F8F4] rounded-full shadow-inner border border-black/5 overflow-visible">
                {/* ABSOLUTE TOP CONTROLS - FIXED ABOVE EVERYTHING */}
                <div className="absolute -top-6 -right-2 z-[9999] flex items-center gap-2">
                    <div className="flex gap-1 bg-white shadow-xl rounded-lg p-1 border border-black/10 scale-90 hover:scale-100 transition-all">
                        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.1)); }} className="p-1 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"><Minus size={14} /></button>
                        <span className="text-[10px] font-mono py-1 px-1 min-w-[30px] text-center select-none">{Math.round(zoom * 100)}%</span>
                        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(2.5, z + 0.1)); }} className="p-1 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"><Plus size={14} /></button>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); downloadChartAsPDF(id, title); }}
                        className="bg-black text-white p-2 rounded-lg hover:bg-[#C55959] transition-colors shadow-xl flex items-center justify-center gap-1 text-[9px] font-bold uppercase cursor-pointer"
                        title="Descargar PDF"
                    >
                        <Download size={12} />
                    </button>
                </div>

                <div className="w-full h-full overflow-hidden flex items-center justify-center p-4 rounded-full relative z-10">
                    <div id={id} className="w-full h-full transition-transform duration-200 ease-out origin-center bg-white rounded-full flex items-center justify-center" style={{ transform: `scale(${zoom})` }}>
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    const PlanetaryTrinity = ({ sun, moon, asc }: { sun: string, moon: string, asc: string }) => {
        // Resolve descriptions
        const getDesc = (sign: string, type: 'light' | 'shadow' | 'sun' | 'moon' | 'ascendant') => {
            const data = ZODIAC_ARCHETYPES[sign] || ZODIAC_ARCHETYPES['Aries']; // fallback
            if (type === 'sun') return data.sun;
            if (type === 'moon') return data.moon;
            if (type === 'ascendant') return data.ascendant;
            return data.keywords.join(', ');
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="glass-panel bg-white/60 p-4 rounded-xl border border-[#C55959]/10 hover:border-[#C55959]/30 transition-colors flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5 text-4xl font-serif text-[#C55959] transform rotate-12 group-hover:rotate-0 transition-transform">☉</div>
                    <div className="text-[#C55959] text-2xl mb-2 animate-pulse-slow">☉</div>
                    <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-1">Tu Esencia (Sol)</div>
                    <div className="font-serif font-bold text-lg text-[#1a1a1a] mb-2">{sun || '-'}</div>
                    <p className="text-[10px] text-gray-600 leading-relaxed italic border-t border-black/5 pt-2 w-full">
                        "{getDesc(sun, 'sun')}"
                    </p>
                </div>

                <div className="glass-panel bg-white/60 p-4 rounded-xl border border-[#C55959]/10 hover:border-[#C55959]/30 transition-colors flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5 text-4xl font-serif text-[#C55959] transform rotate-12 group-hover:rotate-0 transition-transform">☾</div>
                    <div className="text-[#C55959] text-2xl mb-2 animate-pulse-slow">☾</div>
                    <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-1">Tu Emoción (Luna)</div>
                    <div className="font-serif font-bold text-lg text-[#1a1a1a] mb-2">{moon || '-'}</div>
                    <p className="text-[10px] text-gray-600 leading-relaxed italic border-t border-black/5 pt-2 w-full">
                        "{getDesc(moon, 'moon')}"
                    </p>
                </div>

                <div className="glass-panel bg-white/60 p-4 rounded-xl border border-[#C55959]/10 hover:border-[#C55959]/30 transition-colors flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5 text-4xl font-serif text-[#C55959] transform rotate-12 group-hover:rotate-0 transition-transform">↑</div>
                    <div className="text-[#C55959] text-2xl mb-2 animate-pulse-slow">↑</div>
                    <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-1">Tu Máscara (Asc)</div>
                    <div className="font-serif font-bold text-lg text-[#1a1a1a] mb-2">{asc || '-'}</div>
                    <p className="text-[10px] text-gray-600 leading-relaxed italic border-t border-black/5 pt-2 w-full">
                        "{getDesc(asc, 'ascendant')}"
                    </p>
                </div>
            </div>
        );
    };

    const CharacterTransits = ({ birthData }: { birthData: any }) => {
        const [transits, setTransits] = useState<Aspect[]>([]);

        useEffect(() => {
            if (!birthData || !birthData.date) return;
            const now = new Date();
            const t = calculateRealPlanets(now.toISOString(), birthData.lat || 40, birthData.lon || -3);
            const n = calculateRealPlanets(birthData.date, birthData.lat || 40, birthData.lon || -3);
            const aspects = calculateAspects(t.planets, n.planets, 'NATAL');
            setTransits(aspects.slice(0, 5));
        }, [birthData]);

        if (transits.length === 0) return <div className="text-[9px] text-gray-400 italic">Sin tránsitos mayores activos.</div>;

        return (
            <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                <div className="text-[9px] uppercase font-bold tracking-widest text-[#5B7C99] border-b border-[#5B7C99]/20 pb-1 mb-2">Tránsitos Activos</div>
                {transits.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] bg-white/50 p-2 rounded border border-black/5">
                        <span className="text-[#C55959] font-serif">{a.symbol || '✧'}</span>
                        <span className="font-bold">{a.planet1}</span>
                        <span className="text-gray-400 text-[8px]">vs</span>
                        <span className="font-bold">{a.planet2}</span>
                        <span className={`ml-auto px-1.5 py-0.5 rounded text-[8px] ${a.type.includes('Op') || a.type.includes('Cuad') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                            }`}>{a.type}</span>
                    </div>
                ))}
            </div>
        );
    };

    // --- RENDER ---
    return (
        <>
            {/* DYNAMIC BACKGROUND LAYER - Controlled by ScriptAnalyzer State */}
            {/* BACKGROUND PLACEHOLDER */}
            <div className="fixed inset-0 z-0 bg-[#F0EFE9]" />

            <div className="max-w-6xl mx-auto p-6 md:p-12 relative z-10 font-sans text-gray-800">
                {/* Header Navigation */}
                {/* Header Navigation - Optimized for Mobile */}
                <header className="flex justify-center mb-16 relative">
                    <div className="absolute top-0 right-0 text-[8px] text-gray-300 font-mono">v2.0</div>
                    <nav className="glass-panel p-2 rounded-full inline-flex gap-2 bg-white/70 backdrop-blur-md shadow-2xl border border-white/20 max-w-full overflow-x-auto custom-scrollbar">
                        {/* 1. COSMOS */}
                        <button onClick={() => setViewMode('COSMOS')} className={`group flex flex-col items-center gap-1 md:gap-3 transition-all duration-500 p-2 md:p-0 ${viewMode === 'COSMOS' ? 'scale-105 md:scale-110' : 'opacity-60'}`}>
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 transition-all ${viewMode === 'COSMOS' ? 'bg-[#1a1a1a] border-[#1a1a1a] text-[#F9F8F4] shadow-xl' : 'bg-white border-black/10 text-gray-400'}`}>
                                <Atom className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div className="text-center">
                                <span className="block text-[8px] md:text-[10px] uppercase font-bold tracking-widest md:tracking-[0.3em]">El Cosmos</span>
                                <span className="text-[7px] md:text-[9px] font-serif italic text-gray-500 hidden md:block">Mi Estructura & Tránsitos</span>
                            </div>
                        </button>

                        {/* 2. BODY */}
                        <button onClick={() => setViewMode('BODY')} className={`group flex flex-col items-center gap-1 md:gap-3 transition-all duration-500 p-2 md:p-0 ${viewMode === 'BODY' ? 'scale-105 md:scale-110' : 'opacity-60'}`}>
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 transition-all ${viewMode === 'BODY' ? 'bg-[#C55959] border-[#C55959] text-white shadow-xl' : 'bg-white border-black/10 text-gray-400'}`}>
                                <Sun className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div className="text-center">
                                <span className="block text-[8px] md:text-[10px] uppercase font-bold tracking-widest md:tracking-[0.3em]">El Cuerpo</span>
                                <span className="text-[7px] md:text-[9px] font-serif italic text-gray-500 hidden md:block">Actor + Personaje</span>
                            </div>
                        </button>

                        {/* 3. SPIRIT */}
                        <button onClick={() => setViewMode('SPIRIT')} className={`group flex flex-col items-center gap-1 md:gap-3 transition-all duration-500 p-2 md:p-0 ${viewMode === 'SPIRIT' ? 'scale-105 md:scale-110' : 'opacity-60'}`}>
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 transition-all ${viewMode === 'SPIRIT' ? 'bg-[#5B7C99] border-[#5B7C99] text-white shadow-xl' : 'bg-white border-black/10 text-gray-400'}`}>
                                {/* Philosopher's Stone Symbol: The Squaring of the Circle */}
                                <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                                    {/* 1. Outer Circle */}
                                    <circle cx="50" cy="50" r="45" />
                                    {/* 2. The Triangle (Spirit) */}
                                    <path d="M50 5 L93 80 H7 Z" />
                                    {/* 3. The Square (Body) - Positioned to interact with geometries */}
                                    <rect x="24" y="24" width="52" height="52" opacity="0.8" />
                                    {/* 4. Inner Circle (Soul/Point) */}
                                    <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.5" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <span className="block text-[8px] md:text-[10px] uppercase font-bold tracking-widest md:tracking-[0.3em]">El Espíritu</span>
                                <span className="text-[7px] md:text-[9px] font-serif italic text-gray-500 hidden md:block">Red & Sinastría</span>
                            </div>
                        </button>
                    </nav>
                </header>


                {/* --- VIEW 1: COSMOS (USER & TRANSITS) --- */}
                {/* COSMOS VIEW */}
                {viewMode === 'COSMOS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">

                        {/* LEFT COLUMN: USER DATA INPUTS + TRANSITS PANEL */}
                        <div className="lg:col-span-4 flex flex-col gap-4">

                            {/* User Data Card (Input) */}
                            <div className="glass-panel p-8 relative overflow-hidden group h-fit">
                                {/* Alchemical Background Decoration */}
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <h1 className="text-9xl font-serif transform rotate-12 text-[#1a1a1a]">🜍</h1>
                                </div>

                                <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
                                    <div>
                                        <h2 className="text-2xl font-serif text-[#1a1a1a] flex items-center gap-2">
                                            <span>🜁</span> Origen
                                        </h2>
                                        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Configuración de la Piedra Angular (Tu Estructura)</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6 mb-8 relative z-10">
                                    {/* Name Input with Library Dropdown */}
                                    <div className="group/input relative">
                                        <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 block group-focus-within/input:text-[#C55959] transition-colors">Nombre del Alquimista</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                className="input-minimal flex-1 bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] transition-colors text-lg font-serif"
                                                placeholder="Nombre o Alias..."
                                                value={currentUser?.name || ''}
                                                onChange={e => setCurrentUser(prev => prev ? { ...prev, name: e.target.value } : { name: e.target.value, date: new Date().toISOString(), latitude: 40, longitude: -3 })}
                                            />
                                            {/* Library Toggle Button */}
                                            <button
                                                onClick={() => setShowUserLibrary(!showUserLibrary)}
                                                className="p-2 hover:bg-[#F9F8F4] rounded-full text-gray-400 hover:text-[#C55959] transition-colors relative"
                                                title="Cargar carta guardada"
                                            >
                                                <Book size={18} />
                                                {userLibrary.length > 0 && (
                                                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#C55959] rounded-full animate-pulse" />
                                                )}
                                            </button>
                                        </div>

                                        {/* LIBRARY DROPDOWN */}
                                        {showUserLibrary && (
                                            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-black/10 shadow-2xl rounded-lg z-50 max-h-64 overflow-y-auto animate-fadeIn">
                                                <div className="p-2 bg-[#F9F8F4] border-b border-black/5 flex justify-between items-center sticky top-0">
                                                    <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Cartas Guardadas</span>
                                                    <button onClick={() => setShowUserLibrary(false)}><X size={12} /></button>
                                                </div>
                                                {userLibrary.length === 0 && (
                                                    <div className="p-4 text-center text-xs text-gray-400 italic">No hay cartas guardadas.</div>
                                                )}
                                                {userLibrary.map((user, i) => (
                                                    <div key={i} className="p-3 border-b border-black/5 hover:bg-[#F9F8F4] group flex justify-between items-center transition-colors">
                                                        <div
                                                            className="cursor-pointer flex-1"
                                                            onClick={() => {
                                                                setCurrentUser(user);
                                                                setTransitDate(new Date());
                                                                setShowUserLibrary(false);
                                                            }}
                                                        >
                                                            <div className="font-bold text-sm text-[#1a1a1a]">{user.name || user.city}</div>
                                                            <div className="text-[10px] text-gray-500 font-mono">{new Date(user.date).toLocaleDateString()}</div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); setCurrentUser(user); setShowUserLibrary(false); }} className="text-gray-300 hover:text-[#C55959] transition-colors"><Pencil size={12} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); const updated = userLibrary.filter((_, idx) => idx !== i); setUserLibrary(updated); localStorage.setItem('userLibrary', JSON.stringify(updated)); }} className="text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={12} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Robust Date Split Inputs */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-1">
                                            <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 block">Día</label>
                                            <input ref={dayRef} type="text" maxLength={2} className="input-minimal w-full text-center bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] py-2" placeholder="DD" value={dateParts.day} onChange={e => handleDatePartChange('day', e.target.value)} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 block">Mes</label>
                                            <select ref={monthRef} className="input-minimal w-full bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] py-2 text-xs uppercase" value={dateParts.month} onChange={e => handleDatePartChange('month', e.target.value)}>
                                                <option value="" disabled>SELECCIONAR</option>
                                                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                                                    <option key={i} value={(i + 1).toString()}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 block">Año</label>
                                            <input ref={yearRef} type="text" maxLength={4} className="input-minimal w-full text-center bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] py-2" placeholder="AAAA" value={dateParts.year} onChange={e => handleDatePartChange('year', e.target.value)} />
                                        </div>
                                    </div>

                                    {/* Time & Location */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 flex items-center gap-2"><span>Hora</span><span className="text-[8px] bg-red-100 text-red-800 px-1 rounded">CRUCIAL</span></label>
                                            <input ref={timeRef} type="time" className="input-minimal w-full text-center font-mono bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] py-3 text-lg" value={currentUser?.date ? new Date(currentUser.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '12:00'} onChange={e => { const [h, m] = e.target.value.split(':'); const d = currentUser?.date ? new Date(currentUser.date) : new Date(); d.setHours(parseInt(h) || 0, parseInt(m) || 0); setCurrentUser(prev => prev ? { ...prev, date: d.toISOString() } : { date: d.toISOString(), latitude: 40, longitude: -3 }); }} />
                                        </div>
                                        <div className="relative">
                                            <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 block">Lugar</label>
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="Ciudad..." className="input-minimal flex-1 bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] px-3 py-2 uppercase text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()} />
                                                <button onClick={handleLocationSearch} disabled={isSearching} className="bg-black text-white px-3 py-2 text-xs font-bold uppercase hover:bg-[#C55959] transition-colors">{isSearching ? <Loader2 className="animate-spin" size={14} /> : 'BUSCAR'}</button>
                                            </div>
                                            {locationResults.length > 0 && (
                                                <div className="absolute top-full left-0 w-full bg-white border border-black/10 shadow-xl z-50 mt-1 max-h-48 overflow-y-auto">
                                                    {locationResults.map((loc: any) => (
                                                        <button key={loc.id} onClick={() => selectLocation(loc)} className="w-full text-left px-4 py-2 hover:bg-[#F9F8F4] border-b border-black/5 flex flex-col items-start gap-1">
                                                            <div className="font-bold text-xs uppercase">{loc.name}</div>
                                                            <div className="text-[9px] text-gray-500 font-mono">{loc.admin1}, {loc.country}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button onClick={() => currentUser && handleSaveUser(currentUser)} className="btn-primary self-start bg-[#1a1a1a] hover:bg-[#C55959] text-[#F9F8F4] border border-white/10 px-8 py-3 w-full flex items-center justify-center gap-2 group transition-all mt-2 shadow-lg">
                                        <span className="text-xl group-hover:rotate-90 transition-transform">🜄</span>
                                        <span className="uppercase tracking-widest text-xs font-bold">{userLibrary.some(u => u.name === currentUser?.name) ? 'Actualizar' : 'Cristalizar'}</span>
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: CHART DISPLAY (Now reordered on mobile via flex-order or just structure) */}
                        {/* RIGHT COLUMN: CHART + DATA */}
                        <div className="lg:col-span-8 flex flex-col gap-6 order-last lg:order-none">

                            {/* MAIN CHART CARD */}
                            <div className="glass-panel p-4 md:p-8 bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl font-serif pointer-events-none animate-spin-slow">❂</div>

                                <div className="flex justify-between items-center mb-6 z-10">
                                    <h2 className="text-2xl font-serif text-[#1a1a1a] flex items-center gap-2">
                                        <span className="text-[#C55959]">★</span> Mapa Astral
                                    </h2>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCosmosViewMode('RADIAL')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${cosmosViewMode === 'RADIAL' ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>Radial</button>
                                        <button onClick={() => setCosmosViewMode('SPHERE')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${cosmosViewMode === 'SPHERE' ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>Esfera</button>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
                                    {currentUser && currentUser.date ? (
                                        <div className="w-full max-w-2xl aspect-square">
                                            <ChartZoomWrapper title={`Carta Astral: ${currentUser.name || currentUser.city || 'Usuario'}`}>
                                                {cosmosViewMode === 'RADIAL' ? (
                                                    <NatalChart2D
                                                        date={currentUser.date}
                                                        latitude={currentUser.latitude}
                                                        longitude={currentUser.longitude}
                                                        width={800}
                                                        height={800}
                                                        showTransits={true} // Show transits on outer ring
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden relative">
                                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                                                        <p className="text-white text-xs font-mono">Modo Esfera 3D (Próximamente)</p>
                                                    </div>
                                                )}
                                            </ChartZoomWrapper>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-400 p-12 border-2 border-dashed border-gray-200 rounded-xl">
                                            <Atom size={48} className="mx-auto mb-4 opacity-20" />
                                            <p className="text-sm font-serif italic">"Como es arriba, es abajo..."</p>
                                            <p className="text-[10px] uppercase tracking-widest mt-2">Introduce tus datos de origen para revelar el mapa.</p>
                                        </div>
                                    )}
                                </div>

                                {/* PLANETARY TRINITY & DETAILS (Integrated below chart) */}
                                {currentUser && userSigns && (
                                    <div className="mt-8 pt-8 border-t border-black/5 w-full">
                                        <h3 className="text-center text-xs font-bold uppercase tracking-[0.3em] text-[#C55959] mb-6">Trinidad Alquímica</h3>
                                        <PlanetaryTrinity sun={userSigns.sun} moon={userSigns.moon} asc={userSigns.ascendant} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* TRANSITS PANEL (Moved to be 3rd Grid Item for Mobile flow) */}
                        <div className="lg:col-span-4 flex flex-col gap-4">
                            <div className="glass-panel p-6 bg-[#F2F0E9] relative flex flex-col">
                                <div className="absolute top-4 right-4 text-4xl opacity-10 font-serif">🜃</div>
                                <h2 className="text-xl font-serif text-[#1a1a1a] mb-2 flex items-center gap-2"><span>🜂</span> Tránsitos</h2>
                                <p className="text-[10px] font-mono uppercase tracking-widest text-[#5B7C99] mb-4 border-b border-[#5B7C99]/20 pb-4">{transitDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                                {/* TIME MACHINE */}
                                <div className="bg-white/50 p-4 rounded-lg border border-black/5 mb-6">
                                    <label className="text-[9px] uppercase font-bold text-gray-400 block mb-2">Máquina del Tiempo (±3 Meses)</label>
                                    <input type="range" min="-90" max="90" value={Math.floor((transitDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} onChange={(e) => { const days = parseInt(e.target.value); const newDate = new Date(); newDate.setDate(newDate.getDate() + days); setTransitDate(newDate); }} className="w-full accent-[#C55959] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                    <div className="flex justify-between mt-2 text-[9px] font-mono text-gray-500">
                                        <button onClick={() => setTransitDate(new Date())} className="hover:text-black hover:font-bold">VOLVER</button>
                                        <span>{Math.floor((transitDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Días</span>
                                    </div>
                                </div>

                                {/* AI READING */}
                                {dailyReading && (
                                    <div className="mb-6 p-4 bg-white/80 backdrop-blur-md border border-[#C55959]/20 rounded-lg shadow-sm">
                                        <h3 className="text-sm font-serif text-[#C55959] mb-1">{dailyReading.headline}</h3>
                                        <p className="text-xs font-serif italic text-gray-700 leading-relaxed">"{dailyReading.reading}"</p>
                                    </div>
                                )}
                                {isReadingLoading && <div className="mb-6 flex flex-col items-center justify-center gap-1 text-gray-400 animate-pulse"><Loader2 size={16} className="animate-spin" /><span className="text-[10px] uppercase tracking-widest">Consultando...</span></div>}

                                {/* ASPECTS LIST */}
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                    {dailyAspects.length > 0 ? dailyAspects.map((aspect, i) => (
                                        <div key={i} className="flex items-start gap-2 p-2 bg-white/60 rounded border border-black/5">
                                            <div className="text-lg opacity-60 text-[#C55959]">{aspect.symbol || '✧'}</div>
                                            <div>
                                                <div className="text-[10px] font-bold uppercase">{aspect.planet1} <span className="text-gray-400 mx-1">{aspect.type}</span> {aspect.planet2}</div>
                                                <div className="text-[9px] text-gray-500 leading-tight">{aspect.descriptionEs || "Influencia activa."}</div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center text-[10px] text-gray-400 italic py-4">Sin aspectos mayores hoy.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- VIEW 2: BODY (SCRIPT & INTEGRATION) --- */}
                {
                    viewMode === 'BODY' && (
                        <div className="flex flex-col animate-fadeIn h-full min-h-screen">

                            {/* TOP CONTROLS: Analyze & Toggles */}
                            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                                <h2 className="text-xl font-serif text-[#C55959] flex items-center gap-2">
                                    <span>🜁</span> Laboratorio de Personajes
                                </h2>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowLibrary(true)}
                                        className="text-gray-500 hover:text-[#C55959] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                                    >
                                        <Book size={14} /> Biblioteca
                                    </button>

                                    <button
                                        onClick={handleAnalyzeScript}
                                        disabled={isAnalyzing || !script}
                                        className="bg-[#1a1a1a] text-white px-6 py-2 rounded-lg uppercase font-bold text-xs tracking-wider hover:bg-[#C55959] transition-colors shadow-lg flex items-center gap-2"
                                    >
                                        {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                        {isAnalyzing ? 'Extrayendo Esencia...' : 'Analizar Guión'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                                {/* LEFT COLUMN: THE SCRIPT (Reference) - Visible only if needed or collapsed? */}
                                {/* Actually the user said "Body" chart is small. That is in the RIGHT column's inner grid. */}
                                {/* Wait. The structure is Main Grid -> Left (Script) / Right (Character Profile). */}
                                {/* Inside Right (Character Profile) -> Left (Chart) / Right (Forms). */}
                                {/* So we need to adjust the INNER grid inside the Right Column. */}

                                {/* Global Layout: Script 4 cols, Workspace 8 cols. This is fine. */}
                                <div className="lg:col-span-4 flex flex-col h-full bg-white/50 rounded-xl border border-black/5 overflow-hidden">
                                    {/* ... Script Content ... */}
                                    <div className="bg-white rounded-xl shadow-sm border border-black/10 overflow-hidden flex flex-col h-[80vh]">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-black/5 flex justify-between items-center relative">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Texto Fuente</span>

                                                {/* PDF UPLOAD BUTTON */}
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    className="flex items-center gap-1 text-[9px] font-bold uppercase text-[#C55959] bg-[#C55959]/10 px-2 py-1 rounded hover:bg-[#C55959] hover:text-white transition-colors"
                                                >
                                                    {isUploading ? <Loader2 className="animate-spin" size={10} /> : <Upload size={10} />}
                                                    {isUploading ? 'Leyendo...' : 'Subir PDF'}
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    accept="application/pdf"
                                                    className="hidden"
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveScriptToLibrary}
                                                    className="text-[9px] uppercase font-bold text-gray-400 hover:text-[#C55959] transition-colors"
                                                >
                                                    Guardar
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={() => setShowScriptSelect(!showScriptSelect)}
                                                    className="text-[9px] uppercase font-bold text-gray-400 hover:text-[#C55959] transition-colors"
                                                >
                                                    Mis Guiones
                                                </button>
                                            </div>

                                            {showScriptSelect && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-lg z-50 max-h-48 overflow-y-auto">
                                                    {scriptLibrary.length === 0 && <div className="p-2 text-[10px] text-gray-400">Vacío</div>}
                                                    {scriptLibrary.map(l => (
                                                        <div key={l.id} onClick={() => loadScript(l.content)} className="p-2 hover:bg-gray-50 cursor-pointer text-[10px] border-b border-gray-100 last:border-0 border-l-2 border-l-transparent hover:border-l-[#C55959]">
                                                            <div className="font-bold text-gray-700 truncate">{l.title}</div>
                                                            <div className="text-[9px] text-gray-400">{new Date(l.date).toLocaleDateString()}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <textarea
                                            className="flex-1 w-full bg-[#F9F8F4] p-4 text-sm font-mono leading-relaxed outline-none resize-none focus:bg-white transition-colors"
                                            placeholder="Pega aquí tu escena o guión..."
                                            value={script}
                                            onChange={e => setScript(e.target.value)}
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: CHARACTER WORKSHOP */}
                                <div className="lg:col-span-8 flex flex-col h-full min-h-[90vh]">

                                    <div className="glass-panel p-0 flex flex-col bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-xl">

                                        {/* Character Tabs */}
                                        <div className="flex overflow-x-auto bg-[#F2F0E9] border-b border-black/5">
                                            {characterProfiles.map((char, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedCharacterId(i)}
                                                    className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-r border-black/5 transition-all flex flex-col items-center gap-1 min-w-[120px] ${selectedCharacterId === i ? 'bg-white text-[#C55959] border-t-4 border-t-[#C55959]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    <span>{char.name}</span>
                                                    {selectedCharacterId === i && <span className="w-1 h-1 bg-[#C55959] rounded-full"></span>}
                                                </button>
                                            ))}
                                        </div>

                                        {/* ACTIVE CHARACTER WORKSPACE */}
                                        {selectedCharacterId !== null && characterProfiles[selectedCharacterId] && (
                                            <div className="p-8">

                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                                                    {/* ASTRO-DATA SIDEBAR (Chart) - INCREASED SIZE */}
                                                    <div className="md:col-span-8 flex flex-col gap-6 min-h-[600px]">
                                                        {/* The Chart Viz */}
                                                        <div className="w-full aspect-square">
                                                            <ChartZoomWrapper title={`Carta: ${characterProfiles[selectedCharacterId].name}`}>
                                                                <NatalChart2D
                                                                    date={characterProfiles[selectedCharacterId].birthData.date}
                                                                    latitude={40} longitude={-3}
                                                                    knownAscendant={characterProfiles[selectedCharacterId].fullAnalysis.ascendant || characterProfiles[selectedCharacterId].fullAnalysis.knownAscendant}
                                                                    knownMoon={characterProfiles[selectedCharacterId].fullAnalysis.moonSign || characterProfiles[selectedCharacterId].fullAnalysis.knownMoon}
                                                                    customPlanets={{
                                                                        'Mercury': characterProfiles[selectedCharacterId].fullAnalysis.mercurySign,
                                                                        'Venus': characterProfiles[selectedCharacterId].fullAnalysis.venusSign,
                                                                        'Mars': characterProfiles[selectedCharacterId].fullAnalysis.marsSign,
                                                                        'Jupiter': characterProfiles[selectedCharacterId].fullAnalysis.jupiterSign,
                                                                        'Saturn': characterProfiles[selectedCharacterId].fullAnalysis.saturnSign,
                                                                        'Uranus': characterProfiles[selectedCharacterId].fullAnalysis.uranusSign,
                                                                        'Neptune': characterProfiles[selectedCharacterId].fullAnalysis.neptuneSign,
                                                                        'Pluto': characterProfiles[selectedCharacterId].fullAnalysis.plutoSign,
                                                                    }}
                                                                />
                                                            </ChartZoomWrapper>

                                                            <PlanetaryTrinity
                                                                sun={characterProfiles[selectedCharacterId].fullAnalysis.sunSign || 'Aries'}
                                                                moon={characterProfiles[selectedCharacterId].fullAnalysis.moonSign || characterProfiles[selectedCharacterId].fullAnalysis.knownMoon || 'Aries'}
                                                                asc={characterProfiles[selectedCharacterId].fullAnalysis.ascendant || characterProfiles[selectedCharacterId].fullAnalysis.knownAscendant || 'Aries'}
                                                            />

                                                            {/* Character Transits */}
                                                            <CharacterTransits birthData={characterProfiles[selectedCharacterId].birthData} />

                                                            {/* Quick Edit Overlay */}
                                                            <button
                                                                onClick={() => setEditingCharacterId(editingCharacterId === selectedCharacterId ? null : selectedCharacterId)}
                                                                className="mt-2 w-full py-1 bg-black/5 hover:bg-black/10 text-[10px] uppercase font-bold rounded transition-colors text-gray-500"
                                                            >
                                                                {editingCharacterId === selectedCharacterId ? 'Cerrar Edición' : '✎ Editar Signos Manualmente'}
                                                            </button>


                                                            {/* Vital Statistics Form */}
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-black/5 space-y-4">
                                                                <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#C55959] border-b border-black/5 pb-2">Datos Vitales</h4>

                                                                <div>
                                                                    <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Edad Aparente</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="number"
                                                                            className="w-16 p-1 text-sm border rounded bg-white font-mono text-center"
                                                                            placeholder="33"
                                                                            onChange={(e) => {
                                                                                const age = parseInt(e.target.value) || 30;
                                                                                // Logic to update birth year based on Current Year - Age
                                                                                const currentYear = new Date().getFullYear();
                                                                                const birthYear = currentYear - age;

                                                                                const updated = [...characterProfiles];
                                                                                const d = new Date(updated[selectedCharacterId].birthData.date);
                                                                                d.setFullYear(birthYear);
                                                                                updated[selectedCharacterId].birthData.date = d.toISOString();
                                                                                setCharacterProfiles(updated);
                                                                            }}
                                                                        />
                                                                        <span className="text-[10px] text-gray-400">Años (Est. {new Date().getFullYear() - (parseInt(new Date(characterProfiles[selectedCharacterId].birthData.date).getFullYear().toString()) || 2024)})</span>
                                                                    </div>
                                                                </div>

                                                                {/* Manual Overrides & Reverse Search */}
                                                                {editingCharacterId === selectedCharacterId && (
                                                                    <div className="mt-4 p-3 bg-white border border-[#C55959]/20 rounded-lg shadow-sm animate-fadeIn">
                                                                        <h5 className="text-[10px] uppercase font-bold text-[#C55959] mb-3 flex items-center gap-2">
                                                                            <span>⚙ Configuración Astral</span>
                                                                        </h5>

                                                                        <div className="flex flex-col gap-2 mb-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                                                            {[
                                                                                { label: 'Sol (Esencia)', key: 'sunSign' },
                                                                                { label: 'Luna (Emoción)', key: 'moonSign', override: 'knownMoon' },
                                                                                { label: 'Asc (Máscara)', key: 'ascendant', override: 'knownAscendant' },
                                                                                { label: 'Mercurio (Mente)', key: 'mercurySign' },
                                                                                { label: 'Venus (Deseo)', key: 'venusSign' },
                                                                                { label: 'Marte (Acción)', key: 'marsSign' },
                                                                                { label: 'Júpiter (Expansión)', key: 'jupiterSign' },
                                                                                { label: 'Saturno (Límite)', key: 'saturnSign' },
                                                                                { label: 'Urano (Cambio)', key: 'uranusSign' },
                                                                                { label: 'Neptuno (Sueño)', key: 'neptuneSign' },
                                                                                { label: 'Plutón (Poder)', key: 'plutoSign' }
                                                                            ].map((item) => {
                                                                                // Get current value from profile (check known override first, then analysis, then default)
                                                                                // @ts-ignore
                                                                                const val = (item.override ? characterProfiles[selectedCharacterId].fullAnalysis[item.override] : null) || characterProfiles[selectedCharacterId].fullAnalysis[item.key] || 'Aries';

                                                                                return (
                                                                                    <div key={item.label} className="flex flex-col bg-gray-50 px-2 py-1 rounded border border-black/5">
                                                                                        <label className="text-[9px] uppercase font-bold text-gray-400 mb-1">{item.label}</label>
                                                                                        <select
                                                                                            className="text-[10px] font-serif bg-transparent outline-none w-full text-black font-bold"
                                                                                            value={val}
                                                                                            onChange={(e) => {
                                                                                                const updated = [...characterProfiles];
                                                                                                // Update the main analysis field
                                                                                                updated[selectedCharacterId].fullAnalysis[item.key] = e.target.value;

                                                                                                // Establish Override if it's a critical point
                                                                                                if (item.override) {
                                                                                                    updated[selectedCharacterId].fullAnalysis[item.override] = e.target.value;
                                                                                                }

                                                                                                // Special: If Sun changes, update approximate date immediately to keep chart somewhat sane
                                                                                                if (item.key === 'sunSign') {
                                                                                                    updated[selectedCharacterId].birthData.date = getApproxDateForSign(e.target.value);
                                                                                                }

                                                                                                setCharacterProfiles(updated);
                                                                                            }}
                                                                                        >
                                                                                            {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map(s => (
                                                                                                <option key={s} value={s}>{s}</option>
                                                                                            ))}
                                                                                        </select>
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>

                                                                        <button
                                                                            onClick={() => {
                                                                                setIsSearchingDates(true);
                                                                                setFoundDates([]);
                                                                                const char = characterProfiles[selectedCharacterId];
                                                                                const age = new Date().getFullYear() - new Date(char.birthData.date).getFullYear();
                                                                                const targetYear = new Date().getFullYear() - (age || 30);

                                                                                // Async to let UI render loader
                                                                                setTimeout(() => {
                                                                                    const dates = findPossibleBirthDates(
                                                                                        targetYear,
                                                                                        char.fullAnalysis.sunSign,
                                                                                        char.fullAnalysis.moonSign || 'Aries',
                                                                                        char.fullAnalysis.ascendant || 'Aries'
                                                                                    );
                                                                                    setFoundDates(dates);
                                                                                    setIsSearchingDates(false);
                                                                                }, 100);
                                                                            }}
                                                                            disabled={isSearchingDates}
                                                                            className="w-full bg-black text-white text-[10px] uppercase font-bold py-2 rounded mb-2 hover:bg-[#C55959] transition-colors flex justify-center gap-2"
                                                                        >
                                                                            {isSearchingDates ? <Loader2 className="animate-spin" size={12} /> : '🔍'}
                                                                            {isSearchingDates ? 'Buscando...' : 'Buscar Fecha Real'}
                                                                        </button>

                                                                        {foundDates.length > 0 && (
                                                                            <div className="max-h-32 overflow-y-auto border-t border-black/5 pt-2 space-y-1">
                                                                                <div className="text-[9px] text-gray-400 mb-1 text-center">Resultados encontrados: {foundDates.length}</div>
                                                                                {foundDates.slice(0, 10).map((d, i) => (
                                                                                    <button
                                                                                        key={i}
                                                                                        onClick={() => {
                                                                                            const updated = [...characterProfiles];
                                                                                            updated[selectedCharacterId].birthData.date = d.toISOString();
                                                                                            // Reset overrides so chart uses real planet calc from date
                                                                                            updated[selectedCharacterId].fullAnalysis.knownAscendant = undefined;
                                                                                            updated[selectedCharacterId].fullAnalysis.knownMoon = undefined;
                                                                                            setCharacterProfiles(updated);
                                                                                            setFoundDates([]);
                                                                                            setEditingCharacterId(null); // Close edit
                                                                                        }}
                                                                                        className="w-full text-left text-[9px] px-2 py-1 hover:bg-gray-100 rounded truncate font-mono text-gray-600"
                                                                                    >
                                                                                        {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        {foundDates.length === 0 && !isSearchingDates && (
                                                                            <div className="text-[9px] text-gray-300 text-center italic mt-2">
                                                                                Si no hay resultados, prueba combinaciones menos imposibles (ej. Sol/Luna opuestos en ciertos años).
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="bg-[#F9F8F4] p-4 rounded-lg border border-black/5 h-full mb-2">
                                                                <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Descripción Física & Rasgos</h4>
                                                                <textarea
                                                                    className="w-full h-24 bg-transparent text-xs font-serif italic text-gray-600 outline-none resize-none placeholder:text-gray-300"
                                                                    placeholder="Describe la apariencia, tics, postura..."
                                                                />
                                                            </div>
                                                        </div>


                                                        {/* DEEP ANALYSIS FORM (Right within Right Col) */}
                                                        {/* DEEP ANALYSIS FORM (Right within Right Col) */}
                                                        <div className="md:col-span-4 space-y-6 overflow-y-auto pr-2 custom-scrollbar">

                                                            {/* THREE PILLARS RESONANCE (The "Interview") */}
                                                            {characterProfiles[selectedCharacterId]?.fullAnalysis?.threePillars && (
                                                                <div className="bg-white p-6 rounded-xl border border-[#C55959]/20 shadow-sm mb-6 relative overflow-hidden">
                                                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-[#C55959]">
                                                                        <Ghost size={80} />
                                                                    </div>
                                                                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C55959] mb-4 flex items-center gap-2">
                                                                        <Sparkles size={14} /> Resonancia del Alma (Entrevista)
                                                                    </h4>
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                        <div className="bg-[#F9F8F4] p-4 rounded border-l-2 border-yellow-500">
                                                                            <div className="text-[9px] uppercase font-bold text-gray-400 mb-2">Sol (Esencia)</div>
                                                                            <div className="text-[10px] font-bold text-gray-800 mb-1">¿Cómo soy en esencia?</div>
                                                                            <p className="text-xs font-serif italic text-gray-600 leading-relaxed">
                                                                                "{characterProfiles[selectedCharacterId].fullAnalysis.threePillars.sunReasoning}"
                                                                            </p>
                                                                        </div>
                                                                        <div className="bg-[#F9F8F4] p-4 rounded border-l-2 border-blue-400">
                                                                            <div className="text-[9px] uppercase font-bold text-gray-400 mb-2">Luna (Emoción)</div>
                                                                            <div className="text-[10px] font-bold text-gray-800 mb-1">¿Cómo siento?</div>
                                                                            <p className="text-xs font-serif italic text-gray-600 leading-relaxed">
                                                                                "{characterProfiles[selectedCharacterId].fullAnalysis.threePillars.moonReasoning}"
                                                                            </p>
                                                                        </div>
                                                                        <div className="bg-[#F9F8F4] p-4 rounded border-l-2 border-green-500">
                                                                            <div className="text-[9px] uppercase font-bold text-gray-400 mb-2">Ascendente (Máscara)</div>
                                                                            <div className="text-[10px] font-bold text-gray-800 mb-1">¿Cómo me modifica la vida?</div>
                                                                            <p className="text-xs font-serif italic text-gray-600 leading-relaxed">
                                                                                "{characterProfiles[selectedCharacterId].fullAnalysis.threePillars.ascendantReasoning}"
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="group">
                                                                    <label className="label-deep">Super-Objetivo (Deseo Profundo)</label>
                                                                    <input className="input-deep" placeholder="¿Qué quiere lograr en la vida/obra?" />
                                                                </div>
                                                                <div className="group">
                                                                    <label className="label-deep">Objetivo de Escena</label>
                                                                    <input className="input-deep" placeholder="¿Qué quiere AHORA mismo?" />
                                                                </div>
                                                            </div>

                                                            <div className="group">
                                                                <label className="label-deep text-[#C55959]">Acciones (Estrategias)</label>
                                                                <textarea className="textarea-deep h-16" placeholder="¿Qué hace para conseguir lo que quiere? (Verbos de acción)" />
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="group">
                                                                    <label className="label-deep">Obstáculos (Externos)</label>
                                                                    <textarea className="textarea-deep h-20" placeholder="¿Quién o qué se interpone?" />
                                                                </div>
                                                                <div className="group">
                                                                    <label className="label-deep">Obstáculos (Internos)</label>
                                                                    <textarea className="textarea-deep h-20" placeholder="Miedos, dudas, demonios internos..." />
                                                                </div>
                                                            </div>

                                                            <div className="group">
                                                                <label className="label-deep text-purple-600">Lo No Dicho (Subtexto & Secretos)</label>
                                                                <textarea
                                                                    className="textarea-deep h-20"
                                                                    placeholder="¿Qué esconde? ¿Qué piensa pero no dice?"
                                                                    value={characterProfiles[selectedCharacterId].deepAnalysis?.unsaid || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...characterProfiles];
                                                                        if (!updated[selectedCharacterId].deepAnalysis) updated[selectedCharacterId].deepAnalysis = {};
                                                                        updated[selectedCharacterId].deepAnalysis.unsaid = e.target.value;
                                                                        setCharacterProfiles(updated);
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="group">
                                                                    <label className="label-deep">Mundo Emocional (Tránsito)</label>
                                                                    <input
                                                                        className="input-deep"
                                                                        placeholder="¿Qué emociones le atraviesan?"
                                                                        value={characterProfiles[selectedCharacterId].deepAnalysis?.emotions || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...characterProfiles];
                                                                            if (!updated[selectedCharacterId].deepAnalysis) updated[selectedCharacterId].deepAnalysis = {};
                                                                            updated[selectedCharacterId].deepAnalysis.emotions = e.target.value;
                                                                            setCharacterProfiles(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="group">
                                                                    <label className="label-deep">Desenlace (Arco)</label>
                                                                    <input
                                                                        className="input-deep"
                                                                        placeholder="¿Cómo termina en esta escena?"
                                                                        value={characterProfiles[selectedCharacterId].deepAnalysis?.outcome || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...characterProfiles];
                                                                            if (!updated[selectedCharacterId].deepAnalysis) updated[selectedCharacterId].deepAnalysis = {};
                                                                            updated[selectedCharacterId].deepAnalysis.outcome = e.target.value;
                                                                            setCharacterProfiles(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* ACÉRCAME A SU ESENCIA */}
                                                            <div className="pt-8 border-t border-black/5 mt-8 flex flex-col items-center">
                                                                <button
                                                                    disabled={isRefining}
                                                                    onClick={async () => {
                                                                        const char = characterProfiles[selectedCharacterId];
                                                                        const deep = char.deepAnalysis || {};
                                                                        const hasDeepData = deep.unsaid || deep.emotions || deep.outcome;

                                                                        let targetSun = char.fullAnalysis.sunSign;
                                                                        let targetMoon = char.fullAnalysis.knownMoon || char.fullAnalysis.moonSign || 'Aries';
                                                                        let targetAsc = char.fullAnalysis.knownAscendant || char.fullAnalysis.ascendant || 'Aries';

                                                                        let aiMessage = '';

                                                                        // AI REFINEMENT STEP
                                                                        if (hasDeepData) {
                                                                            try {
                                                                                setIsRefining(true);
                                                                                const refined = await refineCharacter({
                                                                                    name: char.name,
                                                                                    currentProfile: {
                                                                                        sun: targetSun,
                                                                                        moon: targetMoon,
                                                                                        ascendant: targetAsc
                                                                                    },
                                                                                    deepAnalysis: deep
                                                                                });

                                                                                // Apply Refined Adjustments
                                                                                // Update targets for subsequent calculations
                                                                                targetSun = refined.suggestedSun;
                                                                                targetMoon = refined.suggestedMoon;
                                                                                targetAsc = refined.suggestedAscendant;

                                                                                // Prepare AI message
                                                                                aiMessage = `VERDICTO CÓSMICO: ${refined.verdict}\n\nADJETIVO: ${refined.adjective.toUpperCase()}\n\nCarta Reajustada para coincidir con la profundidad psicológica.`;

                                                                                // Update the character profile in state
                                                                                setCharacterProfiles(prev => {
                                                                                    const updated = [...prev];
                                                                                    const current = updated[selectedCharacterId];

                                                                                    current.fullAnalysis.sunSign = refined.suggestedSun;
                                                                                    current.fullAnalysis.moonSign = refined.suggestedMoon;
                                                                                    current.fullAnalysis.ascendant = refined.suggestedAscendant;

                                                                                    // Mark Overrides to ensure they stick visually
                                                                                    current.fullAnalysis.knownMoon = refined.suggestedMoon;
                                                                                    current.fullAnalysis.knownAscendant = refined.suggestedAscendant;

                                                                                    // Update Planets if suggested
                                                                                    if (refined.suggestedPlanets) {
                                                                                        if (refined.suggestedPlanets.Mercury) current.fullAnalysis.mercurySign = refined.suggestedPlanets.Mercury;
                                                                                        if (refined.suggestedPlanets.Venus) current.fullAnalysis.venusSign = refined.suggestedPlanets.Venus;
                                                                                        if (refined.suggestedPlanets.Mars) current.fullAnalysis.marsSign = refined.suggestedPlanets.Mars;
                                                                                        if (refined.suggestedPlanets.Jupiter) current.fullAnalysis.jupiterSign = refined.suggestedPlanets.Jupiter;
                                                                                        if (refined.suggestedPlanets.Saturn) current.fullAnalysis.saturnSign = refined.suggestedPlanets.Saturn;
                                                                                        if (refined.suggestedPlanets.Uranus) current.fullAnalysis.uranusSign = refined.suggestedPlanets.Uranus;
                                                                                        if (refined.suggestedPlanets.Neptune) current.fullAnalysis.neptuneSign = refined.suggestedPlanets.Neptune;
                                                                                        if (refined.suggestedPlanets.Pluto) current.fullAnalysis.plutoSign = refined.suggestedPlanets.Pluto;
                                                                                    }

                                                                                    current.fullAnalysis.verdict = refined.verdict;
                                                                                    current.fullAnalysis.adjective = refined.adjective;

                                                                                    return updated;
                                                                                });

                                                                            } catch (e) {
                                                                                console.error("Refinement failed", e);
                                                                                aiMessage = "Error en el refinamiento por IA. Se procederá con la sincronización mecánica.";
                                                                            } finally {
                                                                                setIsRefining(false);
                                                                            }
                                                                        }

                                                                        // Recalculate Elements (Geometry) and Auto-Sync Chart Date (Physics)
                                                                        setCharacterProfiles(prev => {
                                                                            const updated = [...prev];
                                                                            const current = updated[selectedCharacterId];

                                                                            // 1. Recalculate Elements (Geometry)
                                                                            const newElements = recalculateElements(current.elements, targetSun, targetMoon, targetAsc);
                                                                            current.elements = newElements;

                                                                            // 2. Auto-Sync Chart Date (Physics) - "Acercar"
                                                                            let foundDate: string | null = null;
                                                                            let matches: Date[] = [];

                                                                            try {
                                                                                for (let y = 1985; y <= 1995; y += 2) {
                                                                                    matches = findPossibleBirthDates(y, targetSun, targetMoon, targetAsc);
                                                                                    if (matches.length > 0) {
                                                                                        foundDate = matches[0].toISOString();
                                                                                        break;
                                                                                    }
                                                                                }
                                                                            } catch (e) { console.warn("Auto-sync date failed", e); }

                                                                            if (foundDate) {
                                                                                current.birthData.date = foundDate;
                                                                            }

                                                                            // Final alert
                                                                            if (aiMessage) {
                                                                                alert(aiMessage);
                                                                            } else {
                                                                                alert(foundDate ? "Carta Sincronizada (Mecánica)." : "Geometría Recalculada.");
                                                                            }

                                                                            return updated;
                                                                        });
                                                                    }}
                                                                    className="bg-gradient-to-r from-black via-[#1a1a1a] to-gray-800 text-white px-12 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex flex-col items-center gap-1 group disabled:opacity-50 disabled:cursor-wait"
                                                                >
                                                                    {isRefining ? (
                                                                        <>
                                                                            <Loader2 className="animate-spin text-[#C55959]" />
                                                                            <span className="text-[9px] opacity-80 font-serif italic">Reinterpretando el Alma...</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="text-sm font-bold uppercase tracking-[0.2em] group-hover:text-[#C55959] transition-colors">Acércame a su Esencia</span>
                                                                            <span className="text-[9px] opacity-50 font-serif italic text-gray-300">Reinterpretar & Sincronizar</span>
                                                                        </>
                                                                    )}
                                                                </button>

                                                                {/* Diagram */}
                                                                <div className="mt-8 w-full max-w-lg p-6 bg-white border border-black/5 rounded-xl shadow-inner flex justify-center">
                                                                    <ElementalDiagram
                                                                        fire={characterProfiles[selectedCharacterId].elements?.fire || 25}
                                                                        earth={characterProfiles[selectedCharacterId].elements?.earth || 25}
                                                                        air={characterProfiles[selectedCharacterId].elements?.air || 25}
                                                                        water={characterProfiles[selectedCharacterId].elements?.water || 25}
                                                                        size={250}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* EMPTY STATE */}
                                        {(!selectedCharacterId || !characterProfiles[selectedCharacterId]) && (
                                            <div className="h-full flex flex-col items-center justify-center glass-panel">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                                    <Sparkles className="text-gray-300" />
                                                </div>
                                                <h3 className="text-gray-400 font-serif italic mb-2">"El escenario está vacío..."</h3>
                                                <p className="text-[10px] text-gray-300 uppercase tracking-widest max-w-xs text-center">Pega el guión a la izquierda y pulsa Analizar para invocar a los personajes.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div >
                    )
                }



                {/* --- VIEW 3: SPIRIT (NETWORK) --- */}
                {
                    viewMode === 'SPIRIT' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn min-h-screen pb-12">
                            {/* Left: Network List */}
                            <div className="lg:col-span-1 glass-panel p-6 flex flex-col">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={18} /> Mi Red</h3>

                                <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2">
                                    <button onClick={() => setSpiritTargetId('user')} className={`w-full text-left p-3 rounded border transition-all ${spiritTargetId === 'user' ? 'bg-black text-white border-black' : 'bg-white border-black/10 hover:border-black/30'}`}>
                                        <span className="text-xs font-bold uppercase block">Yo Mismo</span>
                                    </button>
                                    {characterProfiles.map((char, i) => (
                                        <button key={'char-' + i} onClick={() => setSpiritTargetId('char-' + i)} className={`w-full text-left p-3 rounded border transition-all ${spiritTargetId === 'char-' + i ? 'bg-[#C55959] text-white border-[#C55959]' : 'bg-white border-black/10 hover:border-[#C55959]/50'}`}>
                                            <span className="text-xs font-bold uppercase block">{char.name}</span>
                                            <span className="text-[9px] opacity-70">Personaje de Guión</span>
                                        </button>
                                    ))}
                                    {friends.map((friend, i) => (
                                        <button key={friend.id} onClick={() => setSpiritTargetId(friend.id)} className={`w-full text-left p-3 rounded border transition-all ${spiritTargetId === friend.id ? 'bg-[#5B7C99] text-white border-[#5B7C99]' : 'bg-white border-black/10 hover:border-[#5B7C99]/50'}`}>
                                            <span className="text-xs font-bold uppercase block">{friend.name}</span>
                                            <span className="text-[9px] opacity-70">Compañero / Red</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-black/5">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Añadir Conexión</p>
                                    <input className="input-minimal w-full mb-2 bg-white" placeholder="Nombre" value={newFriend.name} onChange={e => setNewFriend({ ...newFriend, name: e.target.value })} />
                                    <div className="flex gap-2">
                                        <input type="date" className="input-minimal w-full bg-white" value={newFriend.date} onChange={e => setNewFriend({ ...newFriend, date: e.target.value })} />
                                        <button onClick={handleAddFriend} className="bg-[#5B7C99] text-white rounded px-3"><UserPlus size={16} /></button>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: CHART DISPLAY (Now reordered on mobile via flex-order or just structure) */}
                            {/* RIGHT COLUMN: CHART + DATA */}
                            <div className="lg:col-span-2 flex flex-col gap-6">

                                {/* MAIN CHART CARD */}
                                <div className="glass-panel p-4 md:p-8 bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
                                    {/* Decor */}
                                    <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl font-serif pointer-events-none animate-spin-slow">❂</div>

                                    <div className="flex justify-between items-center mb-6 z-10">
                                        <h2 className="text-2xl font-serif text-[#1a1a1a] flex items-center gap-2">
                                            <span className="text-[#C55959]">★</span> Mapa Astral
                                        </h2>
                                        <div className="flex gap-2">
                                            <button onClick={() => setCosmosViewMode('RADIAL')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${cosmosViewMode === 'RADIAL' ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>Radial</button>
                                            <button onClick={() => setCosmosViewMode('SPHERE')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${cosmosViewMode === 'SPHERE' ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>Esfera</button>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
                                        {currentUser && currentUser.date ? (
                                            <div className="w-full max-w-2xl aspect-square">
                                                <ChartZoomWrapper title={`Carta Astral: ${currentUser.city || 'Usuario'}`}>
                                                    {cosmosViewMode === 'RADIAL' ? (
                                                        <NatalChart2D
                                                            date={currentUser.date}
                                                            latitude={currentUser.latitude}
                                                            longitude={currentUser.longitude}
                                                            width={800}
                                                            height={800}
                                                            showTransits={true} // Show transits on outer ring
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden relative">
                                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                                                            <p className="text-white text-xs font-mono">Modo Esfera 3D (Próximamente)</p>
                                                        </div>
                                                    )}
                                                </ChartZoomWrapper>
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-400 p-12 border-2 border-dashed border-gray-200 rounded-xl">
                                                <Atom size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="text-sm font-serif italic">"Como es arriba, es abajo..."</p>
                                                <p className="text-[10px] uppercase tracking-widest mt-2">Introduce tus datos de origen para revelar el mapa.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* PLANETARY TRINITY & DETAILS (Integrated below chart) */}
                                    {currentUser && userSigns && (
                                        <div className="mt-8 pt-8 border-t border-black/5 w-full">
                                            <h3 className="text-center text-xs font-bold uppercase tracking-[0.3em] text-[#C55959] mb-6">Trinidad Alquímica</h3>
                                            <PlanetaryTrinity sun={userSigns.sun} moon={userSigns.moon} asc={userSigns.ascendant} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: The Spirit Comparison */}
                            <div className="lg:col-span-2 glass-panel p-8 flex flex-col items-center justify-center relative bg-[#0a0a0a] text-white overflow-hidden">
                                {/* Background Effect for Spirit */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>

                                {currentUser && spiritTargetId ? (
                                    <div className="relative z-10 w-full h-full flex flex-col">
                                        <div className="text-center mb-6">
                                            <h2 className="text-2xl font-serif">Sinastría de Espíritu</h2>
                                            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mt-1">
                                                Conectando Energía_A con Energía_B
                                            </p>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center w-full">
                                            <div className="w-full max-w-xl aspect-square">
                                                <ChartZoomWrapper title="Sinastría Espiritual">
                                                    <SynastryOverlay
                                                        userDate={currentUser.date}
                                                        userLat={currentUser.latitude}
                                                        userLon={currentUser.longitude}
                                                        userName="ENERGÍA BASE (YO)"

                                                        // Dynamic Target Resolving
                                                        otherDate={
                                                            spiritTargetId.startsWith('char-')
                                                                ? characterProfiles[parseInt(spiritTargetId.split('-')[1])].birthData.date
                                                                : spiritTargetId === 'user' ? currentUser.date
                                                                    : friends.find(f => f.id === spiritTargetId)?.birthData.date || new Date().toISOString()
                                                        }
                                                        otherLat={40}
                                                        otherLon={-3}
                                                        otherName={
                                                            spiritTargetId.startsWith('char-')
                                                                ? characterProfiles[parseInt(spiritTargetId.split('-')[1])].name
                                                                : spiritTargetId === 'user' ? "REFLEJO (YO)"
                                                                    : friends.find(f => f.id === spiritTargetId)?.name || "Target"
                                                        }
                                                    />
                                                </ChartZoomWrapper>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center opacity-30">
                                        <Sparkles size={64} className="mx-auto mb-4" />
                                        <p className="uppercase tracking-widest">Selecciona una conexión de tu red para ver el vínculo espiritual.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {showLibrary && <ArchetypeLibrary onClose={() => setShowLibrary(false)} />}
            </div >
        </>
    );
}
