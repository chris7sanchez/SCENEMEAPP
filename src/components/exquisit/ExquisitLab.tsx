'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Sun, Star, Droplet, Heart, Info, FlaskConical, Beaker, ClipboardList, Calculator, Scroll, Layers, Zap, InfoIcon, X, Search } from 'lucide-react';
import { aceites } from '@/data/exquisit/oils';
import { MOLECULAS } from '@/data/exquisit/molecules';
import { ACORDES_PROFESIONALES } from '@/data/exquisit/accords';
import { calculateRealPlanets, convertToUTC, getSignFromLongitude } from '@/utils/astronomy';

const NATURAL_NOTES: Record<string, 'Salida' | 'Corazón' | 'Base'> = {
  'Bergamota': 'Salida', 'Naranja': 'Salida', 'Limón': 'Salida', 'Menta': 'Salida', 'Eucalipto': 'Salida', 'Lavanda': 'Salida', 'Neroli': 'Salida', 'Pimienta negra': 'Salida',
  'Rosa': 'Corazón', 'Jazmín': 'Corazón', 'Geranio': 'Corazón', 'Clavo': 'Corazón', 'Canela': 'Corazón', 'Jengibre': 'Corazón', 'Romero': 'Corazón', 'Cardamomo': 'Corazón', 'Palmarosa': 'Corazón', 'Manzanilla': 'Corazón', 'Salvia': 'Corazón', 'Violeta': 'Corazón', 'Lirio': 'Corazón', 'Ylang-Ylang': 'Corazón', 'Manzanilla Romana': 'Corazón',
  'Sándalo': 'Base', 'Pachulí': 'Base', 'Vetiver': 'Base', 'Cedro': 'Base', 'Incienso': 'Base', 'Mirra': 'Base', 'Vainilla': 'Base', 'Ciprés': 'Base', 'Enebro': 'Base', 'Coco': 'Base'
};

const ELEMENT_BOOSTERS: Record<string, string> = {
  'Fire': 'Canela',
  'Earth': 'Vetiver',
  'Air': 'Menta',
  'Water': 'Ylang-Ylang'
};

const getRealNote = (name: string): 'Salida' | 'Corazón' | 'Base' => {
  return NATURAL_NOTES[name] || MOLECULAS[name]?.nota || 'Corazón';
};

const getTherapeuticInfo = (name: string) => {
    const info = (aceites.propiedades as any)[name];
    if (info) return info;
    for (const sign in aceites.signos) {
        if ((aceites.signos as any)[sign].principal === name) return { efectos: (aceites.signos as any)[sign].propiedades };
    }
    return { efectos: 'Esencia pura de origen natural con alta vibración.' };
};

const ExquisitLab = () => {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('grimorio');
  const [birthData, setBirthData] = useState({ 
    day: '', month: '', year: '', hour: '', minute: '', 
    name: '', place: '', 
    lat: '41.38', lon: '2.17', // Default Barcelona
    tz: '1', isDST: true 
  });
  const [chart, setChart] = useState<any>(null);
  const [perfumeFormula, setPerfumeFormula] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [manualFormula, setManualFormula] = useState<any[]>([]);
  const [selectedMolecule, setSelectedMolecule] = useState('');
  const [boostingElement, setBoostingElement] = useState<string | null>(null);
  const [savedCharts, setSavedCharts] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('exquisit_saved_charts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');

  const saveToLocalStorage = (charts: any[]) => {
    localStorage.setItem('exquisit_saved_charts', JSON.stringify(charts));
  };
  
  // Calculator state
  const [calcVol, setCalcVol] = useState(50);
  const [calcConc, setCalcConc] = useState(20);

  const calcularSigno = (dia: number, mes: number) => {
    const fechas = [
        { signo: 'Capricornio', hasta: [1, 19] }, { signo: 'Acuario', hasta: [2, 18] },
        { signo: 'Piscis', hasta: [3, 20] }, { signo: 'Aries', hasta: [4, 19] },
        { signo: 'Tauro', hasta: [5, 20] }, { signo: 'Géminis', hasta: [6, 20] },
        { signo: 'Cáncer', hasta: [7, 22] }, { signo: 'Leo', hasta: [8, 22] },
        { signo: 'Virgo', hasta: [9, 22] }, { signo: 'Libra', hasta: [10, 22] },
        { signo: 'Escorpio', hasta: [11, 21] }, { signo: 'Sagitario', hasta: [12, 21] },
        { signo: 'Capricornio', hasta: [12, 31] }
    ];
    for (let i = 0; i < fechas.length; i++) {
        if (mes < fechas[i].hasta[0] || (mes === fechas[i].hasta[0] && dia <= fechas[i].hasta[1])) return fechas[i].signo;
    }
    return 'Capricornio';
  };

  const generarCarta = () => {
    try {
      const { day, month, year, hour, minute, lat, lon, tz, isDST } = birthData;
      
      // 1. Convert to real UTC Date
      const utcDate = convertToUTC(
        `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
        `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
        parseFloat(tz),
        isDST
      );

      // 2. Calculate Real Planets
      const chartData = calculateRealPlanets(
        utcDate.toISOString(),
        parseFloat(lat),
        parseFloat(lon)
      );

      const solObj = chartData.planets.find(p => p.name === 'Sol');
      const lunaObj = chartData.planets.find(p => p.name === 'Luna');
      
      const sol = solObj ? solObj.sign : 'Aries';
      const luna = lunaObj ? lunaObj.sign : 'Aries';
      const asc = getSignFromLongitude(chartData.ascendant);
      
      const newChart = { 
        id: Date.now(),
        name: birthData.name || 'Sin Nombre',
        place: birthData.place || 'Desconocido',
        signoSolar: sol, 
        ascendente: asc, 
        luna: luna, 
        data: { ...birthData }
      };
      
      setChart(newChart);
      
      // Categorización real de ingredientes astrales según su naturaleza
      const essentialOils = [
        { esencia: (aceites.signos as any)[sol].principal, origen: 'Sol', pct: 50 },
        { esencia: (aceites.signos as any)[luna].principal, origen: 'Luna', pct: 30 },
        { esencia: (aceites.signos as any)[asc].secundarios[0], origen: 'Ascendente', pct: 20 }
      ];

      const formula: any = {
          notasSalida: [],
          notasCorazon: [],
          notasBase: []
      };

      essentialOils.forEach(item => {
        const note = getRealNote(item.esencia);
        const obj = { esencia: item.esencia, porcentaje: item.pct, origen: item.origen };
        if (note === 'Salida') formula.notasSalida.push(obj);
        else if (note === 'Corazón') formula.notasCorazon.push(obj);
        else formula.notasBase.push(obj);
      });

      setPerfumeFormula(formula);
      setStep(2);
    } catch (err) {
      console.error("Error al calcular la carta:", err);
      alert("Error en los datos. Por favor revisa la fecha y hora.");
    }
  };

  const getElementBalance = () => {
    if (!chart) return { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    const bal: any = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    const solEl = (aceites.signos as any)[chart.signoSolar].elemento;
    const lunaEl = (aceites.signos as any)[chart.luna].elemento;
    const ascEl = (aceites.signos as any)[chart.ascendente].elemento;
    bal[solEl] += 50;
    bal[lunaEl] += 30;
    bal[ascEl] += 20;
    return bal;
  };

  const boostElement = (oil: string) => {
    setPerfumeFormula((prev: any) => {
        const note = getRealNote(oil);
        const key = note === 'Salida' ? 'notasSalida' : note === 'Corazón' ? 'notasCorazon' : 'notasBase';
        
        if (prev[key].find((i: any) => i.esencia === oil)) return prev;

        const updated = { ...prev };
        updated[key] = [...updated[key], { esencia: oil, porcentaje: 10, origen: 'Potenciador Elemental' }];
        return updated;
    });
    setBoostingElement(null);
  };

  const updateFormulaItem = (key: string, index: number, field: string, value: any) => {
    setPerfumeFormula((prev: any) => {
      const updated = { ...prev };
      updated[key][index][field] = value;
      return updated;
    });
  };

  const removeFormulaItem = (key: string, index: number) => {
    setPerfumeFormula((prev: any) => {
      const updated = { ...prev };
      updated[key] = updated[key].filter((_: any, i: number) => i !== index);
      return updated;
    });
  };

  const guardarAlquimia = () => {
    const updated = [...savedCharts, { ...chart, formula: perfumeFormula }];
    setSavedCharts(updated);
    saveToLocalStorage(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const eliminarAlquimia = (id: number) => {
    const updated = savedCharts.filter(c => c.id !== id);
    setSavedCharts(updated);
    saveToLocalStorage(updated);
  };

  const cargarAlquimia = (c: any) => {
    setChart(c);
    setPerfumeFormula(c.formula);
    setBirthData(c.data);
    setStep(2);
  };

  const resetAll = () => {
    setBirthData({ 
        day: '', month: '', year: '', hour: '', minute: '', 
        name: '', place: '', 
        lat: '41.38', lon: '2.17', 
        tz: '1', isDST: true 
    });
    setChart(null);
    setPerfumeFormula(null);
    setManualFormula([]);
    setStep(1);
  };

  const addIngredient = (name?: string) => {
    const targetName = name || selectedMolecule;
    if (!targetName) return;
    
    const exists = manualFormula.find(i => i.nombre === targetName);
    if (exists) return;

    let ingredientData: any = null;

    // Search in all sources: MOLECULAS, ACORDES, then OILS
    if (MOLECULAS[targetName]) {
      const mol = MOLECULAS[targetName];
      ingredientData = {
        nombre: targetName,
        porcentaje: 0,
        tipo: mol.tipo || 'Molecula',
        familia: mol.familia || 'Varias',
        nota: mol.nota || getRealNote(targetName)
      };
    } else if (ACORDES_PROFESIONALES[targetName]) {
      const accord = ACORDES_PROFESIONALES[targetName];
      ingredientData = {
        nombre: targetName,
        porcentaje: 0,
        tipo: 'Acorde',
        familia: accord.familia || 'Varias',
        nota: 'Corazón'
      };
    } else if (NATURAL_NOTES[targetName] || (aceites.propiedades as any)[targetName]) {
      ingredientData = {
        nombre: targetName,
        porcentaje: 0,
        tipo: 'Natural',
        familia: 'Aceite Esencial',
        nota: getRealNote(targetName)
      };
    }

    if (ingredientData) {
      setManualFormula(prev => [...prev, ingredientData]);
    }
    
    if (!name) setSelectedMolecule('');
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...manualFormula];
    updated[index][field] = value;
    setManualFormula(updated);
  };

  const removeIngredient = (index: number) => {
    setManualFormula(manualFormula.filter((_, i) => i !== index));
  };

  const totalPercentage = manualFormula.reduce((acc, curr) => acc + (parseFloat(curr.porcentaje) || 0), 0);

  const getBalance = () => {
    const notes = { Salida: 0, Corazón: 0, Base: 0 };
    manualFormula.forEach(item => {
      notes[item.nota as keyof typeof notes] += (parseFloat(item.porcentaje) || 0);
    });
    return notes;
  };

  const getSugerenciaOlfativa = () => {
    if (manualFormula.length === 0) return "Empieza añadiendo moléculas para recibir consejos.";
    const notes = getBalance();
    if (notes.Salida < 10) return "Falta frescura. Añade moléculas de Salida como Dihydromyrcenol o Linalool.";
    if (notes.Base < 30) return "Poca persistencia. Añade fijadores como Iso E Super o Ambroxan.";
    if (notes.Corazón < 20) return "Falta cuerpo. Añade notas de Corazón como Hedione o Peomosa.";
    return "Balance profesional detectado. Tu fórmula tiene buena estructura.";
  };

  const autoEquilibrar = () => {
    if (manualFormula.length === 0) return;

    const notes = { Salida: 0, Corazón: 0, Base: 0 };
    manualFormula.forEach(item => {
      notes[item.nota as keyof typeof notes] += (parseFloat(item.porcentaje) || 0);
    });

    const missing = Object.entries(notes).filter(([_, val]) => val === 0).map(([k]) => k);
    
    if (missing.length > 0) {
      const suggestions: Record<string, string> = {
        'Salida': 'Dihydromyrcenol',
        'Corazón': 'Hedione',
        'Base': 'Iso E Super'
      };
      
      missing.forEach(cat => {
        const molName = Object.keys(MOLECULAS).find(m => MOLECULAS[m].nota === cat) || suggestions[cat];
        if (molName) addIngredient(molName);
      });
    }

    const target = { Salida: 20, Corazón: 30, Base: 50 };
    setManualFormula(prev => {
        const updated = prev.map(item => {
            const catMembers = prev.filter(f => f.nota === item.nota);
            const catTotal = catMembers.reduce((a, b) => a + (parseFloat(b.porcentaje) || 0), 0);
            const targetCatTotal = target[item.nota as keyof typeof target];
            
            if (catTotal === 0) {
                return { ...item, porcentaje: (targetCatTotal / catMembers.length).toFixed(1) };
            }
            
            const shareInCat = (parseFloat(item.porcentaje) || 0) / catTotal;
            return { ...item, porcentaje: (shareInCat * targetCatTotal).toFixed(1) };
        });
        return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#1a0f0a] text-[#f4e8d0] font-mono selection:bg-[#c9a961] selection:text-[#1a0f0a] overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(201,169,97,0.03)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(184,115,51,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(201,169,97,0.1) 40px, rgba(201,169,97,0.1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(201,169,97,0.1) 40px, rgba(201,169,97,0.1) 41px)' }} />
      </div>

      <header className="relative border-b-2 border-[#c9a961] overflow-hidden py-24 px-6 text-center z-10">
        <div className="absolute inset-0 z-0">
            <img 
                src="/images/exquisit/04080b9f2be4b3a0070ef4987e8afbce.jpg" 
                className="w-full h-full object-cover opacity-20 filter grayscale sepia brightness-50"
                alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a0f0a]" />
        </div>
        <div className="relative z-10">
            <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="text-7xl mb-6 opacity-80 inline-block drop-shadow-[0_0_20px_rgba(201,169,97,0.5)]">⚗</motion.div>
            <h1 className="text-5xl md:text-8xl font-display uppercase tracking-[0.3em] mb-4 bg-gradient-to-r from-[#f4d799] via-[#c9a961] to-[#b87333] bg-clip-text text-transparent">EXQUISIT</h1>
            <p className="font-serif italic text-xl tracking-[0.2em] text-[#c9a961] opacity-80">Alta Perfumería Alquímica</p>
        </div>
      </header>

      <nav className="sticky top-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-lg border-b border-[#c9a961]/30 flex flex-wrap sm:flex-nowrap">
        {[
          { id: 'grimorio', icon: Scroll, label: 'Grimorio' },
          { id: 'alquimia', icon: Sparkles, label: 'Alquimia Astral' },
          { id: 'formulador', icon: FlaskConical, label: 'Formulador' },
          { id: 'inventario', icon: Beaker, label: 'Inventario' },
          { id: 'acordes', icon: Heart, label: 'Acordes' },
          { id: 'calculadora', icon: Calculator, label: 'Calculadora' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 px-2 border-r border-[#c9a961]/20 transition-all group ${activeTab === tab.id ? 'bg-[#c9a961] text-[#1a0f0a]' : 'hover:bg-[#c9a961]/10'}`}
          >
            <div className="flex flex-col items-center gap-1">
              <tab.icon className="w-4 h-4" />
              <span className="text-[9px] uppercase font-bold tracking-widest">{tab.label}</span>
            </div>
          </button>
        ))}
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto py-12 px-6">
        <AnimatePresence mode="wait">
          {/* TAB: GRIMORIO */}
          {activeTab === 'grimorio' && (
            <motion.div key="grimorio" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-12">
               <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#c9a961]/30 pb-8">
                  <div>
                     <h2 className="text-5xl font-display tracking-[0.2em] text-[#f4d799]">EL GRIMORIO SAGRADO</h2>
                     <p className="text-sm opacity-40 uppercase tracking-[0.5em] mt-2">Sabiduría de los Aceites para la Alquimia del Alma</p>
                  </div>
                  <div className="flex gap-2">
                     {['Fire', 'Earth', 'Air', 'Water'].map(el => (
                        <div key={el} className={`px-4 py-2 text-[10px] font-bold uppercase border border-[#c9a961]/30 rounded-full ${el === 'Fire' ? 'text-orange-400' : el === 'Earth' ? 'text-green-600' : el === 'Air' ? 'text-blue-300' : 'text-blue-500'}`}>
                           {el === 'Fire' ? 'Fuego' : el === 'Earth' ? 'Tierra' : el === 'Air' ? 'Aire' : 'Agua'}
                        </div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#c9a961]/5 border border-[#c9a961]/20 p-8 mb-12 backdrop-blur-sm">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-red-500/70">
                        <Moon className="w-6 h-6" />
                        <h4 className="font-display text-2xl uppercase tracking-widest">La Sombra</h4>
                     </div>
                     <p className="text-sm leading-relaxed opacity-70 italic">
                        Representa el bloqueo o la herida psíquica. La energía densa que deseamos transmutar mediante la vibración del aceite.
                     </p>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-green-500/70">
                        <Sun className="w-6 h-6" />
                        <h4 className="font-display text-2xl uppercase tracking-widest">La Luz</h4>
                     </div>
                     <p className="text-sm leading-relaxed opacity-70 italic">
                        Es la virtud o frecuencia de sanación que el aceite despierta. El camino hacia la plenitud de la conciencia.
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                  {Object.entries(aceites.propiedades).map(([name, data]: [string, any]) => {
                     const note = getRealNote(name);
                     let element = 'Varias';
                     for (const s in aceites.signos) {
                        if ((aceites.signos as any)[s].principal === name) {
                           element = (aceites.signos as any)[s].elemento;
                           break;
                        }
                     }

                     return (
                        <div key={name} className="bg-black/60 border border-[#c9a961]/20 p-8 space-y-6 hover:border-[#c9a961] transition-all group relative overflow-hidden backdrop-blur-md">
                           <div className={`absolute top-0 right-0 w-20 h-20 opacity-10 flex items-center justify-center text-5xl`}>
                              {element === 'Fire' ? '🔥' : element === 'Earth' ? '⛰️' : element === 'Air' ? '💨' : '💧'}
                           </div>
                           
                           <div>
                              <div className="flex justify-between items-start mb-1">
                                 <h3 className="text-3xl font-display text-[#c9a961] uppercase tracking-[0.1em]">{name}</h3>
                                 <span className={`text-[8px] px-2 py-0.5 rounded-sm font-bold uppercase border ${
                                    note === 'Salida' ? 'border-cyan-400/30 text-cyan-400 bg-cyan-400/10' : 
                                    note === 'Corazón' ? 'border-rose-400/30 text-rose-400 bg-rose-400/10' : 
                                    'border-amber-600/30 text-amber-500 bg-amber-600/10'
                                 }`}>{note}</span>
                              </div>
                              <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">{element === 'Fire' ? 'Fuego' : element === 'Earth' ? 'Tierra' : element === 'Air' ? 'Aire' : element === 'Water' ? 'Agua' : 'Elemento Variable'}</p>
                           </div>

                           <div className="space-y-4">
                              <div className="space-y-1">
                                 <span className="text-[9px] font-bold text-[#c9a961] opacity-50 uppercase tracking-widest">Alquimia Química</span>
                                 <p className="text-xs italic opacity-80">{data.cientifico}</p>
                              </div>

                              <div className="space-y-1">
                                 <span className="text-[9px] font-bold text-[#c9a961] opacity-50 uppercase tracking-widest">Propiedades Sagradas</span>
                                 <p className="text-xs uppercase leading-relaxed font-bold tracking-tight">{data.efectos}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#c9a961]/20">
                                 <div className="space-y-1">
                                    <span className="text-[8px] font-bold text-red-500/60 uppercase">Sanar Sombra</span>
                                    <p className="text-[11px] opacity-70 group-hover:opacity-100 transition-opacity font-medium">{data.emocion_negativa}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <span className="text-[8px] font-bold text-green-500/60 uppercase">Activar Luz</span>
                                    <p className="text-[11px] opacity-70 group-hover:opacity-100 transition-opacity font-medium">{data.emocion_positive || data.emocion_positiva}</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </motion.div>
          )}
          {/* TAB: ALQUIMIA */}
          {activeTab === 'alquimia' && (
            <motion.div key="alquimia" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
              {step === 1 ? (
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="marble-panel p-12 border-2 border-[#c9a961] relative text-[#1a0f0a]">
                    <h2 className="text-4xl font-display mb-12 tracking-tighter text-stone">INGRESA TUS DATOS NATALES</h2>
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative">
                          <label className="text-[10px] uppercase font-bold opacity-40 tracking-widest mb-1 block">Tu Nombre</label>
                          <input 
                            className="w-full bg-transparent border-b-2 border-[#1a0f0a]/20 py-4 text-2xl outline-none focus:border-[#c9a961] text-[#1a0f0a] placeholder:text-[#1a0f0a]/30" 
                            placeholder="TU NOMBRE" 
                            value={birthData.name} 
                            onChange={e => setBirthData({...birthData, name: e.target.value})} 
                          />
                        </div>
                        <div className="relative">
                          <label className="text-[10px] uppercase font-bold opacity-40 tracking-widest mb-1 block">Lugar de Nacimiento</label>
                          <input 
                            className="w-full bg-transparent border-b-2 border-[#1a0f0a]/20 py-4 text-2xl outline-none focus:border-[#c9a961] text-[#1a0f0a] placeholder:text-[#1a0f0a]/30" 
                            placeholder="CIUDAD, PAÍS" 
                            value={birthData.place} 
                            onChange={e => setBirthData({...birthData, place: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                          <input className="bg-[#1a0f0a]/5 p-4 border border-[#1a0f0a]/10 outline-none text-[#1a0f0a] placeholder:text-[#1a0f0a]/30" placeholder="DÍA" type="number" value={birthData.day} onChange={e => setBirthData({...birthData, day: e.target.value})} />
                          <input className="bg-[#1a0f0a]/5 p-4 border border-[#1a0f0a]/10 outline-none text-[#1a0f0a] placeholder:text-[#1a0f0a]/30" placeholder="MES" type="number" value={birthData.month} onChange={e => setBirthData({...birthData, month: e.target.value})} />
                          <input className="bg-[#1a0f0a]/5 p-4 border border-[#1a0f0a]/10 outline-none text-[#1a0f0a] placeholder:text-[#1a0f0a]/30" placeholder="AÑO" type="number" value={birthData.year} onChange={e => setBirthData({...birthData, year: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <input className="bg-[#1a0f0a]/5 p-4 border border-[#1a0f0a]/10 outline-none text-[#1a0f0a] placeholder:text-[#1a0f0a]/30" placeholder="HORA (0-23)" type="number" value={birthData.hour} onChange={e => setBirthData({...birthData, hour: e.target.value})} />
                          <input className="bg-[#1a0f0a]/5 p-4 border border-[#1a0f0a]/10 outline-none text-[#1a0f0a] placeholder:text-[#1a0f0a]/30" placeholder="MIN (0-59)" type="number" value={birthData.minute} onChange={e => setBirthData({...birthData, minute: e.target.value})} />
                      </div>

                      <div className="bg-black/5 p-6 border border-black/10 space-y-4">
                        <p className="text-[10px] uppercase font-bold text-[#1a0f0a]/60 tracking-widest">Ajuste de Precisión (Barcelona por defecto)</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <div>
                             <label className="text-[9px] uppercase opacity-40 mb-1 block">Latitud</label>
                             <input className="w-full bg-transparent border-b border-black/20 text-xs py-1" value={birthData.lat} onChange={e => setBirthData({...birthData, lat: e.target.value})} />
                           </div>
                           <div>
                             <label className="text-[9px] uppercase opacity-40 mb-1 block">Longitud</label>
                             <input className="w-full bg-transparent border-b border-black/20 text-xs py-1" value={birthData.lon} onChange={e => setBirthData({...birthData, lon: e.target.value})} />
                           </div>
                           <div>
                             <label className="text-[9px] uppercase opacity-40 mb-1 block">Huso (TZ)</label>
                             <input className="w-full bg-transparent border-b border-black/20 text-xs py-1" value={birthData.tz} onChange={e => setBirthData({...birthData, tz: e.target.value})} />
                           </div>
                           <div className="flex flex-col justify-end">
                             <button 
                               onClick={() => setBirthData({...birthData, isDST: !birthData.isDST})}
                               className={`text-[9px] uppercase py-1 border transition-all ${birthData.isDST ? 'bg-black text-white' : 'opacity-40'}`}
                             >
                               {birthData.isDST ? 'Horario Verano' : 'Horario Invierno'}
                             </button>
                           </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button onClick={generarCarta} className="flex-1 bg-[#1a0f0a] text-[#f4d799] py-6 font-bold uppercase tracking-[0.3em] hover:bg-[#c9a961] hover:text-[#1a0f0a] transition-all">INICIAR PROCESO DE DESTILACIÓN</button>
                        <button onClick={resetAll} className="px-8 border-2 border-[#1a0f0a]/20 text-[#1a0f0a] opacity-60 hover:opacity-100 uppercase text-[10px] font-bold">Reiniciar</button>
                      </div>
                    </div>
                  </div>

                  {savedCharts.length > 0 && (
                    <div className="space-y-4">
                       <h3 className="text-xl font-display opacity-40 uppercase tracking-widest flex items-center gap-2">
                         <Scroll className="w-4 h-4" /> Alquimias Guardadas
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {savedCharts.map((c) => (
                             <div key={c.id} className="bg-black/40 border border-[#c9a961]/20 p-6 flex justify-between items-center group hover:border-[#c9a961] transition-all">
                                <div onClick={() => cargarAlquimia(c)} className="cursor-pointer flex-1">
                                   <div className="text-lg font-display text-[#c9a961] uppercase leading-tight">{c.name}</div>
                                   <div className="text-[9px] opacity-40 uppercase tracking-tighter">{c.signoSolar} · {c.place}</div>
                                 </div>
                                <div className="flex gap-4">
                                  <button onClick={() => { cargarAlquimia(c); setStep(1); }} className="text-[#c9a961] opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded">
                                    <Layers className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => eliminarAlquimia(c.id)} className="text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded">
                                    <Zap className="w-3 h-3" />
                                  </button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="marble-panel p-8 border-2 border-[#c9a961] text-[#1a0f0a] space-y-8">
                      <h3 className="text-3xl font-display text-stone uppercase">BALANCE ELEMENTAL</h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                         {Object.entries(getElementBalance()).map(([el, val]: [string, any]) => (
                            <div key={el} className="space-y-1">
                               <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                                  <span>{el === 'Fire' ? 'Fuego' : el === 'Earth' ? 'Tierra' : el === 'Air' ? 'Aire' : 'Agua'}</span>
                                  <span>{val}%</span>
                               </div>
                               <div className="h-1 bg-[#1a0f0a]/10 rounded-full overflow-hidden">
                                  <div className={`h-full ${el === 'Fire' ? 'bg-orange-500' : el === 'Earth' ? 'bg-green-700' : el === 'Air' ? 'bg-blue-300' : 'bg-blue-600'}`} style={{ width: `${val}%` }} />
                               </div>
                               {val < 25 && (
                                  <button 
                                    onClick={() => setBoostingElement(boostingElement === el ? null : el)}
                                    className={`text-[7px] px-2 py-1 rounded-sm mt-1 transition-colors uppercase font-bold ${boostingElement === el ? 'bg-[#c9a961] text-black' : 'bg-[#1a0f0a] text-white hover:bg-[#c9a961]'}`}
                                  >
                                    {boostingElement === el ? 'CERRAR' : '+ POTENCIAR'}
                                  </button>
                               )}

                               {boostingElement === el && (
                                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-3 bg-[#1a0f0a] border border-[#c9a961]/40 space-y-3 z-20 relative shadow-2xl">
                                     <p className="text-[7px] text-[#c9a961] uppercase font-bold mb-1 border-b border-[#c9a961]/20 pb-1">Elixires para {el === 'Fire' ? 'Fuego' : el === 'Earth' ? 'Tierra' : el === 'Air' ? 'Aire' : 'Agua'}:</p>
                                     <div className="grid grid-cols-1 gap-2">
                                        {[
                                          ...(aceites.signos as any)[Object.keys(aceites.signos).find(s => (aceites.signos as any)[s].elemento === el) || 'Aries'].secundarios,
                                          ELEMENT_BOOSTERS[el]
                                        ].filter((v, i, a) => a.indexOf(v) === i).map(oil => {
                                          const info = (aceites.propiedades as any)[oil];
                                          return (
                                            <button 
                                              key={oil} 
                                              onClick={() => boostElement(oil)}
                                              className="text-left group/oil"
                                            >
                                              <div className="flex justify-between items-center bg-white/5 hover:bg-[#c9a961]/10 p-2 transition-all border border-white/5 hover:border-[#c9a961]/30">
                                                <span className="text-[8px] text-white/80 group-hover/oil:text-[#c9a961] font-bold uppercase">{oil}</span>
                                                <div className="flex gap-2 text-[6px] uppercase opacity-40">
                                                  <span className="text-red-400">S: {info?.emocion_negativa || '?'}</span>
                                                  <span className="text-green-400">L: {info?.emocion_positive || info?.emocion_positiva || '?'}</span>
                                                </div>
                                              </div>
                                            </button>
                                          );
                                        })}
                                     </div>
                                  </motion.div>
                               )}
                            </div>
                         ))}
                      </div>

                      <div className="pt-8 border-t border-[#1a0f0a]/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40">Arquetipos Dominantes</h4>
                        <div className="space-y-4">
                          {['SOL', 'LUNA', 'ASCENDENTE'].map((label, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-[#1a0f0a]/5 py-2">
                                <span className="text-[9px] tracking-widest opacity-60 font-bold">{label}</span>
                                <span className="text-lg font-display tracking-widest text-[#1a0f0a]">{(chart as any)[label === 'SOL' ? 'signoSolar' : label.toLowerCase()]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>
                   <div className="bg-black/40 border-2 border-[#c9a961] p-8 flex flex-col">
                      <h3 className="text-3xl font-display mb-8 text-[#c9a961] uppercase tracking-widest text-center">ELIXIR PERSONALIZADO</h3>
                      <div className="space-y-8 flex-1">
                         {Object.entries(perfumeFormula).map(([key, value]: any) => (
                            value.length > 0 && (
                              <div key={key} className="space-y-3">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-1 h-3 ${key.includes('Salida') ? 'bg-cyan-400' : key.includes('Corazon') ? 'bg-rose-400' : 'bg-amber-600'}`} />
                                    <div className="text-[10px] uppercase font-bold text-[#c9a961] opacity-50 tracking-[0.3em]">{key.replace('notas', 'NOTAS DE ')}</div>
                                 </div>
                                 {value.map((n: any, i: number) => {
                                    const therapy = getTherapeuticInfo(n.esencia);
                                    return (
                                      <div key={i} className="group border-b border-white/10 pb-4 pl-3 relative pr-8">
                                         <div className="flex justify-between items-end mb-2">
                                            <span className="text-xl font-display uppercase tracking-widest text-[#f4d799]">{n.esencia}</span>
                                            <div className="flex items-center gap-2">
                                               <input 
                                                 type="number" 
                                                 value={n.porcentaje} 
                                                 onChange={e => updateFormulaItem(key, i, 'porcentaje', e.target.value)}
                                                 className="bg-transparent border-b border-[#c9a961]/30 w-12 text-center text-xl font-bold font-mono text-[#c9a961] outline-none"
                                               />
                                               <span className="text-xs text-[#c9a961]">%</span>
                                            </div>
                                         </div>
                                         <div className="text-[9px] text-white/40 leading-relaxed uppercase space-y-1">
                                            <p><span className="text-[#c9a961]/60 font-bold">ALQUIMIA:</span> {n.origen}</p>
                                            <p><span className="text-[#c9a961]/60 font-bold">PROPÓSITO:</span> {therapy.efectos || therapy.propiedades}</p>
                                         </div>
                                         {n.origen === 'Potenciador Elemental' && (
                                            <button 
                                              onClick={() => removeFormulaItem(key, i)}
                                              className="absolute right-0 top-0 text-red-500/30 hover:text-red-500 p-2"
                                            >
                                              <X size={12} />
                                            </button>
                                         )}
                                      </div>
                                    );
                                 })}
                              </div>
                            )
                         ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-8">
                         <button 
                            onClick={guardarAlquimia} 
                            disabled={isSaved}
                            className={`${isSaved ? 'bg-green-800 text-white' : 'bg-[#c9a961] text-black'} py-4 uppercase font-bold hover:bg-[#f4d799] transition-colors flex items-center justify-center gap-2`}
                         >
                            {isSaved ? <><Sparkles className="w-4 h-4" /> Guardado</> : 'Guardar'}
                         </button>
                         <button 
                            onClick={() => {
                               const converted: any[] = [];
                               Object.values(perfumeFormula).flat().forEach((n: any) => {
                                  converted.push({
                                     nombre: n.esencia,
                                     porcentaje: n.porcentaje,
                                     nota: getRealNote(n.esencia),
                                     familia: 'Alquimia Astral',
                                     tipo: 'Natural'
                                  });
                               });
                               setManualFormula(converted);
                               setActiveTab('formulador');
                            }}
                            className="border-2 border-[#c9a961] text-[#c9a961] py-4 uppercase font-bold hover:bg-[#c9a961] hover:text-black transition-all flex items-center justify-center gap-2"
                         >
                            <FlaskConical className="w-4 h-4" /> Llevar al Laboratorio
                         </button>
                      </div>
                      <button onClick={resetAll} className="w-full mt-4 text-[9px] uppercase font-bold opacity-30 hover:opacity-100 tracking-widest text-center">Reiniciar Proceso</button>
                   </div>
                </div>
             )}
            </motion.div>
          )}

          {/* TAB: INVENTARIO */}
          {activeTab === 'inventario' && (
            <motion.div key="inventario" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex justify-between items-end mb-8 border-b border-[#c9a961]/30 pb-4">
                   <h2 className="text-4xl font-display tracking-widest text-[#f4d799]">INVENTARIO MOLECULAR</h2>
                   <p className="text-xs opacity-40 uppercase tracking-widest">{Object.keys(MOLECULAS).length} Muestras en Stock</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(MOLECULAS).map(([name, data]: any) => (
                        <div key={name} className="bg-black/20 border border-[#c9a961]/30 p-6 hover:border-[#c9a961] transition-all group overflow-hidden relative">
                           <div className="absolute top-0 right-0 p-2 text-[8px] bg-[#c9a961] text-[#1a0f0a] font-bold uppercase">{data.tipo}</div>
                           <h3 className="text-xl font-display mb-2 text-[#c9a961] tracking-wider uppercase">{name}</h3>
                           <p className="text-[10px] font-bold opacity-30 mb-4">{data.familia}</p>
                           <p className="text-xs italic mb-6 line-clamp-2 h-10 opacity-80">{data.perfil}</p>
                           <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/5 pt-4">
                              <span>FUERZA: {data.fuerza}</span>
                              <span className="text-[#c9a961]">€{(data.coste/data.ml).toFixed(2)}/ml</span>
                           </div>
                        </div>
                    ))}
                </div>
            </motion.div>
          )}

          {/* TAB: ACORDES */}
          {activeTab === 'acordes' && (
            <motion.div key="acordes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               {Object.entries(ACORDES_PROFESIONALES).map(([name, data]: any) => (
                  <div key={name} className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-2 border-[#c9a961] group hover:border-[#f4d799] transition-all">
                     <div className="p-8 bg-[#c9a961]/10 lg:border-r-2 border-[#c9a961]">
                        <h3 className="text-3xl font-display mb-4 text-[#f4d799] uppercase tracking-tighter">{name}</h3>
                        <p className="text-xs font-bold tracking-widest opacity-40 mb-6 uppercase">{data.familia} · {data.intensidad}</p>
                        <p className="text-sm italic leading-relaxed opacity-80">{data.descripcion}</p>
                     </div>
                     <div className="lg:col-span-2 p-8 bg-black/40">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                           {Object.entries(data.formula).map(([mol, pct]: any) => (
                              <div key={mol} className="flex justify-between items-end border-b border-white/5 pb-2">
                                 <span className="text-sm font-display tracking-widest opacity-60 uppercase">{mol}</span>
                                 <span className="text-xl font-bold text-[#c9a961] font-mono">{pct}%</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               ))}
            </motion.div>
          )}

          {/* TAB: CALCULADORA */}
          {activeTab === 'calculadora' && (
             <motion.div key="calculadora" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-8">
                <div className="marble-panel p-12 border-2 border-[#c9a961] text-center text-[#1a0f0a]">
                   <h2 className="text-4xl font-display mb-12 text-stone uppercase tracking-tighter">CALCULADORA DE VOLÚMENES</h2>
                   <div className="space-y-12">
                      <div className="space-y-4">
                         <label className="text-xs font-bold tracking-widest text-[#1a0f0a]/60 uppercase">Volumen Total del Frasco ({calcVol}ml)</label>
                         <input type="range" min="5" max="250" step="5" value={calcVol} onChange={e => setCalcVol(parseInt(e.target.value))} className="w-full accent-[#1a0f0a]" />
                      </div>
                      <div className="space-y-4">
                         <label className="text-xs font-bold tracking-widest text-[#1a0f0a]/60 uppercase">Concentración ({calcConc}%)</label>
                         <div className="grid grid-cols-3 gap-2">
                            {[10, 15, 20, 25, 30].map(v => (
                               <button 
                                 key={v} 
                                 onClick={() => setCalcConc(v)} 
                                 className={`py-4 border-2 font-bold transition-all ${calcConc === v ? 'bg-[#1a0f0a] text-[#f4d799] border-[#1a0f0a]' : 'border-[#1a0f0a]/20 text-[#1a0f0a]/40 hover:border-[#1a0f0a]/40'}`}
                               >
                                 {v}%
                               </button>
                            ))}
                         </div>
                      </div>
                      <div className="pt-12 border-t-2 border-[#1a0f0a]/10 grid grid-cols-2 gap-12 text-[#1a0f0a]">
                         <div className="text-left">
                            <span className="text-[10px] uppercase font-bold opacity-60">CONCENTRADO</span>
                            <div className="text-5xl font-display tracking-tighter">{(calcVol * (calcConc/100)).toFixed(1)}<span className="text-sm">ML</span></div>
                         </div>
                         <div className="text-left">
                            <span className="text-[10px] uppercase font-bold opacity-60">DILUYENTE (ALCOHOL)</span>
                            <div className="text-5xl font-display tracking-tighter">{(calcVol * (1 - calcConc/100)).toFixed(1)}<span className="text-sm">ML</span></div>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}
          
          {/* TAB: FORMULADOR */}
          {activeTab === 'formulador' && (
             <motion.div key="formulador" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                   {/* Selector side */}
                   <div className="lg:col-span-1 space-y-8">
                      <div className="marble-panel p-8 border-2 border-[#c9a961] space-y-6 text-[#1a0f0a]">
                          <h3 className="text-2xl font-display uppercase tracking-widest">AÑADIR INGREDIENTE</h3>
                          
                          <div className="space-y-4">
                             <div className="relative">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a0f0a]/30" />
                                <input 
                                   type="text"
                                   placeholder="BUSCAR MOLÉCULA O ESENCIA..."
                                   value={ingredientSearch}
                                   onChange={e => setIngredientSearch(e.target.value)}
                                   className="w-full bg-[#1a0f0a]/5 p-4 pr-12 border border-[#1a0f0a]/20 outline-none text-[#1a0f0a] placeholder:text-[#1a0f0a]/30 text-xs font-bold uppercase tracking-widest"
                                />
                             </div>

                             <select 
                               className="w-full bg-[#1a0f0a]/5 p-4 border border-[#1a0f0a]/20 outline-none text-[#1a0f0a] rounded-none appearance-none cursor-pointer"
                               value={selectedMolecule}
                               onChange={e => setSelectedMolecule(e.target.value)}
                             >
                                 <option value="">SELECCIONAR...</option>
                                 {(['Salida', 'Corazón', 'Base'] as const).map(cat => {
                                   // Gather all unique names for this category from Molecules and Natural Notes
                                   const items = Array.from(new Set([
                                     ...Object.keys(MOLECULAS).filter(m => getRealNote(m) === cat),
                                     ...Object.keys(NATURAL_NOTES).filter(o => NATURAL_NOTES[o] === cat),
                                     ...Object.keys(aceites.propiedades).filter(o => getRealNote(o) === cat)
                                   ]))
                                   .filter(m => m.toLowerCase().includes(ingredientSearch.toLowerCase()))
                                   .sort();

                                   if (items.length === 0) return null;

                                   return (
                                     <optgroup key={cat} label={cat === 'Salida' ? '── SALIDA (Frescas) ──' : cat === 'Corazón' ? '── CORAZÓN (Cuerpo) ──' : '── BASE (Fijación) ──'}>
                                       {items.map(m => {
                                         const isMol = !!MOLECULAS[m];
                                         const detail = isMol ? (MOLECULAS[m].familia || 'Sintética') : 'Natural';
                                         return (
                                           <option key={m} value={m}>{m} ({detail})</option>
                                         );
                                       })}
                                     </optgroup>
                                   );
                                 })}
                                 
                                 {Object.keys(ACORDES_PROFESIONALES).filter(m => m.toLowerCase().includes(ingredientSearch.toLowerCase())).length > 0 && (
                                    <optgroup label="── ACORDES PROFESIONALES ──">
                                        {Object.keys(ACORDES_PROFESIONALES)
                                          .filter(m => m.toLowerCase().includes(ingredientSearch.toLowerCase()))
                                          .sort()
                                          .map(m => (
                                          <option key={m} value={m}>{m} ({ACORDES_PROFESIONALES[m].familia})</option>
                                        ))}
                                    </optgroup>
                                 )}

                                 {Object.keys(MOLECULAS).filter(m => !MOLECULAS[m].nota && getRealNote(m) === 'Corazón' && !NATURAL_NOTES[m] && m.toLowerCase().includes(ingredientSearch.toLowerCase())).length > 0 && (
                                    <optgroup label="── OTROS (Sin categorizar) ──">
                                       {Object.keys(MOLECULAS)
                                          .filter(m => !MOLECULAS[m].nota && getRealNote(m) === 'Corazón' && !NATURAL_NOTES[m] && m.toLowerCase().includes(ingredientSearch.toLowerCase()))
                                          .sort()
                                          .map(m => (
                                             <option key={m} value={m}>{m} ({MOLECULAS[m].familia || 'Varias'})</option>
                                          ))
                                       }
                                    </optgroup>
                                 )}
                             </select>
                            <button 
                              onClick={() => addIngredient()}
                              disabled={!selectedMolecule}
                              className="w-full bg-[#1a0f0a] text-[#f4d799] py-4 font-bold uppercase tracking-widest hover:bg-[#c9a961] hover:text-[#1a0f0a] transition-all disabled:opacity-20"
                            >
                               AÑADIR A LA MEZCLA
                            </button>
                            
                            <button 
                              onClick={autoEquilibrar}
                              className="w-full border-2 border-[#1a0f0a] text-[#1a0f0a] py-4 font-bold uppercase tracking-widest hover:bg-[#1a0f0a] hover:text-[#f4d799] transition-all flex items-center justify-center gap-2"
                            >
                               <Layers className="w-4 h-4" /> EQUILIBRAR FÓRMULA
                            </button>
                            <p className="text-[9px] opacity-60 text-center italic">Ajusta automáticamente a ratio profesional 20:30:50</p>
                         </div>
                      </div>

                      <div className="bg-black/40 border border-[#c9a961]/30 p-8 space-y-6">
                         <h4 className="text-xl font-display text-[#c9a961] tracking-widest uppercase">PIRÁMIDE OLFATIVA</h4>
                         <div className="space-y-6">
                            {(['Salida', 'Corazón', 'Base'] as const).map(cat => (
                               <div key={cat} className="space-y-2">
                                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                                     <span className="opacity-40">{cat}</span>
                                     <span className="text-[#c9a961]">{getBalance()[cat].toFixed(0)}%</span>
                                  </div>
                                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${Math.min(100, (getBalance()[cat] / (totalPercentage || 1)) * 100)}%` }}
                                       className="h-full bg-[#c9a961]"
                                     />
                                  </div>
                               </div>
                            ))}
                         </div>
                         <div className="p-4 bg-[#c9a961]/10 border border-[#c9a961]/20">
                            <p className="text-[10px] uppercase leading-relaxed text-[#c9a961] font-bold">
                               <span className="opacity-50">CONSEJO:</span> <br/>
                               {getSugerenciaOlfativa()}
                            </p>
                         </div>
                      </div>

                      <div className="bg-black/40 border border-[#c9a961]/30 p-8 space-y-6">
                         <h4 className="text-xl font-display text-[#c9a961] tracking-widest uppercase">BALANCE ACTUAL</h4>
                         <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                               <span className="text-[10px] uppercase font-bold opacity-40 tracking-widest">TOTAL MEZCLA</span>
                               <span className={`text-3xl font-bold font-mono ${totalPercentage > 100 ? 'text-red-500' : 'text-[#c9a961]'}`}>{totalPercentage}%</span>
                            </div>
                            {totalPercentage > 100 && (
                               <p className="text-[10px] text-red-400 uppercase font-bold text-center">¡ALERTA! El total supera el 100%</p>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* List side */}
                   <div className="lg:col-span-2 space-y-12">
                      {manualFormula.length === 0 ? (
                         <div className="h-[400px] border-2 border-dashed border-[#c9a961]/20 flex flex-col items-center justify-center text-center p-12 opacity-30">
                            <FlaskConical className="w-12 h-12 mb-4" />
                            <p className="uppercase tracking-[0.2em] text-sm">Empieza añadiendo moléculas para construir tu fórmula profesional</p>
                         </div>
                      ) : (
                         <>
                            <div className="space-y-4">
                                {manualFormula.map((item, idx) => (
                                   <div key={idx} className="bg-white/5 border border-white/10 p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center relative overflow-hidden">
                                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                        item.nota === 'Salida' ? 'bg-cyan-400' : 
                                        item.nota === 'Corazón' ? 'bg-rose-400' : 
                                        'bg-amber-600'
                                      }`} />
                                      <div className="md:col-span-1">
                                         <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[7px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-tighter ${
                                              item.nota === 'Salida' ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30' : 
                                              item.nota === 'Corazón' ? 'bg-rose-400/20 text-rose-400 border border-rose-400/30' : 
                                              'bg-amber-600/20 text-amber-500 border border-amber-600/30'
                                            }`}>
                                              {item.nota}
                                            </span>
                                         </div>
                                         <h4 className="text-lg font-display text-[#c9a961] uppercase tracking-wider leading-tight">{item.nombre}</h4>
                                         <p className="text-[9px] uppercase font-bold opacity-30">{item.familia}</p>
                                      </div>
                                     <div className="flex flex-col gap-1">
                                        <label className="text-[8px] uppercase font-bold opacity-40">Nota</label>
                                        <select 
                                          value={item.nota}
                                          onChange={e => updateIngredient(idx, 'nota', e.target.value)}
                                          className="bg-transparent border-b border-white/20 text-xs py-1 outline-none text-[#c9a961]"
                                        >
                                           <option value="Salida">SALIDA (Top)</option>
                                           <option value="Corazón">CORAZÓN (Mid)</option>
                                           <option value="Base">BASE (Drydown)</option>
                                        </select>
                                     </div>
                                     <div className="flex flex-col gap-1">
                                        <label className="text-[8px] uppercase font-bold opacity-40">Porcentaje (%)</label>
                                        <input 
                                          type="number"
                                          value={item.porcentaje}
                                          onChange={e => updateIngredient(idx, 'porcentaje', e.target.value)}
                                          className="bg-transparent border-b border-white/20 text-xl font-bold font-mono outline-none text-[#c9a961] w-full"
                                          placeholder="0"
                                        />
                                     </div>
                                     <div className="flex justify-end">
                                        <button 
                                          onClick={() => removeIngredient(idx)}
                                          className="w-10 h-10 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                        >
                                           <X size={16} />
                                        </button>
                                     </div>
                                  </div>
                               ))}
                            </div>

                            {totalPercentage > 0 && (
                               <div className="pt-8 flex justify-center">
                                  <button 
                                    onClick={() => setShowBatchDetails(!showBatchDetails)}
                                    className="px-12 py-6 bg-[#c9a961] text-[#1a0f0a] font-bold uppercase tracking-[0.2em] hover:bg-[#f4d799] transition-all flex items-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                  >
                                     {showBatchDetails ? <X className="w-5 h-5" /> : <Beaker className="w-5 h-5" />}
                                     {showBatchDetails ? 'OCULTAR CÁLCULOS' : 'VER CALCULOS DE LABORATORIO'}
                                  </button>
                               </div>
                            )}

                            {showBatchDetails && totalPercentage > 0 && (
                               <motion.div 
                                 initial={{ opacity: 0, y: 20 }} 
                                 animate={{ opacity: 1, y: 0 }}
                                 className="bg-black/60 border-2 border-[#c9a961] p-10 space-y-10 mt-12"
                               >
                                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-[#c9a961]/20">
                                     <div>
                                        <h3 className="text-3xl font-display text-[#c9a961] uppercase tracking-widest mb-2">PRODUCCIÓN FINAL</h3>
                                        <p className="text-[10px] uppercase font-bold opacity-40">Cálculo de pesos y medidas para laboratorio (Gramos)</p>
                                     </div>
                                     <div className="flex gap-4">
                                        <div className="space-y-2">
                                           <label className="text-[8px] uppercase font-bold opacity-40">Batch (ml)</label>
                                           <input type="number" value={calcVol} onChange={e => setCalcVol(parseInt(e.target.value))} className="bg-transparent border-b border-[#c9a961] text-[#f4d799] w-16 text-center outline-none font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                           <label className="text-[8px] uppercase font-bold opacity-40">Concentración (%)</label>
                                           <input type="number" value={calcConc} onChange={e => setCalcConc(parseInt(e.target.value))} className="bg-transparent border-b border-[#c9a961] text-[#f4d799] w-16 text-center outline-none font-bold" />
                                        </div>
                                     </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                     <div className="space-y-6">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a961] opacity-50">COMPUESTOS ORGÁNICOS (Concentrado)</h4>
                                        <div className="space-y-4">
                                           {manualFormula.map((item, idx) => {
                                              const totalConcentrate = calcVol * (calcConc / 100);
                                              const weight = (totalConcentrate * (parseFloat(item.porcentaje) / totalPercentage)).toFixed(2);
                                              return (
                                                 <div key={idx} className="flex justify-between items-end border-b border-white/5 pb-2">
                                                    <span className="text-xs uppercase tracking-widest opacity-80">{item.nombre}</span>
                                                    <span className="text-lg font-mono text-[#f4d799]">{weight} g</span>
                                                 </div>
                                              );
                                           })}
                                        </div>
                                     </div>

                                     <div className="space-y-8">
                                        <div className="bg-[#1a0f0a] border border-[#c9a961]/30 p-8 space-y-4">
                                           <div className="flex justify-between items-end">
                                              <span className="text-[10px] uppercase font-bold opacity-40">PESO CONCENTRADO</span>
                                              <span className="text-2xl font-display text-[#c9a961]">{(calcVol * (calcConc/100)).toFixed(2)} g</span>
                                           </div>
                                           <div className="flex justify-between items-end">
                                              <span className="text-[10px] uppercase font-bold opacity-40">ALCOHOL / DPG</span>
                                              <span className="text-2xl font-display text-[#c9a961]">{(calcVol * (1 - calcConc/100)).toFixed(2)} g</span>
                                           </div>
                                           <div className="pt-4 border-t border-[#c9a961]/20 flex justify-between items-end">
                                              <span className="text-xs uppercase font-bold text-[#c9a961]">TOTAL FINAL</span>
                                              <span className="text-4xl font-display tracking-tighter text-[#f4d799]">{calcVol.toFixed(1)} ml/g</span>
                                           </div>
                                        </div>

                                        <div className="p-6 border border-[#c9a961]/20 bg-[#c9a961]/5 text-[9px] leading-relaxed uppercase space-y-2 italic">
                                           <p className="font-bold opacity-100 not-italic text-[#c9a961]">PROTOCOLO DE LAB:</p>
                                           <p>1. Mezclar moléculas según pesos exactos en vidrio.</p>
                                           <p>2. Macerar 48-72h antes de diluir.</p>
                                           <p>3. Completar con solvente hasta alcanzar {calcVol}g.</p>
                                           <p>4. No usar envases reactivos (plástico).</p>
                                        </div>
                                     </div>
                                  </div>
                               </motion.div>
                            )}
                         </>
                      )}
                   </div>
                </div>
             </motion.div>
          )}

        </AnimatePresence>
        
        {/* SECTION: GRIMORIO (REMOVED FROM BOTTOM, NOW IN TAB) */}
      </main>

      <footer className="py-20 px-6 text-center opacity-30 border-t border-[#c9a961]/20 bg-black/20">
         <p className="text-[10px] uppercase tracking-[1em] mb-4">OPERA MAGNUM · SCIENTIA ET ARS</p>
         <div className="text-3xl">⚗</div>
      </footer>
    </div>
  );
};

export default ExquisitLab;
