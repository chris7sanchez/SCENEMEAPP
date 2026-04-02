import React, { useRef, useState } from 'react';
import { Book, X, Pencil, Trash2, Loader2, Atom, Sun, BookOpen } from 'lucide-react';
import { UserData, ChartTheme, CosmosViewMode } from './types';
import NatalChart2D from './NatalChart2D';
import CelestialSphere from './CelestialSphere';
import { ChartZoomWrapper, PlanetaryTrinity } from './shared-components';
import { calculateAstroBalance } from '@/utils/astrology';
import { calculateRealPlanets } from '@/utils/astronomy';

interface CosmosViewProps {
    currentUser: UserData | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<UserData | null>>;
    userLibrary: UserData[];
    setUserLibrary: React.Dispatch<React.SetStateAction<UserData[]>>;
    showUserLibrary: boolean;
    setShowUserLibrary: (show: boolean) => void;
    dateParts: { day: string; month: string; year: string };
    handleDatePartChange: (part: 'day' | 'month' | 'year', value: string) => void;
    handleLocationSearch: () => void;
    isSearching: boolean;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    locationResults: any[];
    selectLocation: (loc: any) => void;
    handleSaveUser: (user: UserData) => void;
    transitDate: Date;
    setTransitDate: (d: Date) => void;
    cosmosViewMode: CosmosViewMode;
    setCosmosViewMode: (m: CosmosViewMode) => void;
    chartTheme: ChartTheme;
    setChartTheme: (t: ChartTheme) => void;
    userSigns: any;
    dailyReading: any;
    isReadingLoading: boolean;
    dailyAspects: any[];
}

const CosmosView: React.FC<CosmosViewProps> = (props) => {
    const {
        currentUser, setCurrentUser, userLibrary, setUserLibrary,
        showUserLibrary, setShowUserLibrary, dateParts, handleDatePartChange,
        handleLocationSearch, isSearching, searchQuery, setSearchQuery,
        locationResults, selectLocation, handleSaveUser,
        transitDate, setTransitDate, cosmosViewMode, setCosmosViewMode,
        chartTheme, setChartTheme, userSigns, dailyReading,
        isReadingLoading, dailyAspects
    } = props;

    const dayRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLSelectElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);
    const timeRef = useRef<HTMLInputElement>(null);

    // Tab state for efluvios — stable, no auto-changes
    const [activeEfluvio, setActiveEfluvio] = useState(0);

    // Ensure active tab doesn't go out of range when a new reading arrives
    const efluvios: any[] = dailyReading?.efluvios ?? (dailyReading ? [dailyReading] : []);
    const safeActiveEfluvio = Math.min(activeEfluvio, Math.max(0, efluvios.length - 1));
    const currentEfluvio = efluvios[safeActiveEfluvio];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn grid-flow-dense">

            {/* DATOS DE NACIMIENTO */}
            <div className="lg:col-span-4 flex flex-col gap-4 order-1">
                <div className="glass-panel p-8 relative overflow-hidden group h-fit">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <h1 className="text-9xl font-serif transform rotate-12 text-[#1a1a1a]">🜍</h1>
                    </div>

                    <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] flex items-center gap-2">
                                <span>🜁</span> Tu Carta Natal
                            </h2>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Introduce tus datos de nacimiento</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 mb-8 relative z-10">
                        <div className="group/input relative">
                            <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 block group-focus-within/input:text-[#C55959] transition-colors">Tu Nombre</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="input-minimal flex-1 bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] transition-colors text-lg font-serif px-3 py-2"
                                    placeholder="Nombre o alias..."
                                    value={currentUser?.name || ''}
                                    onChange={e => setCurrentUser(prev => prev ? { ...prev, name: e.target.value } : { name: e.target.value, date: new Date().toISOString(), latitude: 40, longitude: -3 })}
                                />
                                <button
                                    onClick={() => setShowUserLibrary(!showUserLibrary)}
                                    className="p-2 hover:bg-[#F9F8F4] rounded-none text-gray-400 hover:text-[#C55959] transition-colors relative"
                                    title="Cargar carta guardada"
                                >
                                    <Book size={18} />
                                    {userLibrary.length > 0 && (
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-[#C55959] rounded-none animate-pulse" />
                                    )}
                                </button>
                            </div>

                            {showUserLibrary && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-black/10 shadow-2xl rounded-none z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 bg-[#F9F8F4] border-b border-black/5 flex justify-between items-center sticky top-0">
                                        <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500 font-mono">Cartas Guardadas</span>
                                        <button onClick={() => setShowUserLibrary(false)}><X size={12} /></button>
                                    </div>
                                    {userLibrary.length === 0 && (
                                        <div className="p-4 text-center text-xs text-gray-400 italic">No hay cartas guardadas aún.</div>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 flex items-center gap-2"><span>Hora</span><span className="text-[8px] bg-red-100 text-red-800 px-1 rounded font-mono">HORA LOCAL</span></label>
                                <input ref={timeRef} type="time" className="input-minimal w-full text-center font-mono bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] py-3 text-lg" value={currentUser?.date ? new Date(currentUser.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '12:00'} onChange={e => { const [h, m] = e.target.value.split(':'); const d = currentUser?.date ? new Date(currentUser.date) : new Date(); d.setHours(parseInt(h) || 0, parseInt(m) || 0); setCurrentUser(prev => prev ? { ...prev, date: d.toISOString() } : { date: d.toISOString(), latitude: 40, longitude: -3 }); }} />
                            </div>
                            <div className="relative">
                                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 block">Ciudad de Nacimiento</label>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Ciudad..." className="input-minimal flex-1 bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] px-3 py-2 uppercase text-[10px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()} />
                                    <button onClick={handleLocationSearch} disabled={isSearching} className="bg-black text-white px-3 py-2 text-[10px] font-bold uppercase hover:bg-[#C55959] transition-colors min-w-[70px] flex justify-center items-center">{isSearching ? <Loader2 className="animate-spin" size={14} /> : 'BUSCAR'}</button>
                                </div>
                                {locationResults.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-black/10 shadow-xl z-50 mt-1 max-h-48 overflow-y-auto rounded-b-lg">
                                        {locationResults.map((loc: any) => (
                                            <button key={loc.id} onClick={() => selectLocation(loc)} className="w-full text-left px-4 py-2 hover:bg-[#F9F8F4] border-b border-black/5 flex flex-col items-start gap-1">
                                                <div className="font-bold text-[10px] uppercase text-stone-800">{loc.name}</div>
                                                <div className="text-[8px] text-gray-500 font-mono italic">{loc.admin1}, {loc.country}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button onClick={() => currentUser && handleSaveUser(currentUser)} className="btn-primary self-start bg-[#1a1a1a] hover:bg-[#C55959] text-[#F9F8F4] border border-white/10 px-8 py-4 w-full flex items-center justify-center gap-3 group transition-all mt-2 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <span className="text-xl group-hover:rotate-180 transition-transform duration-700">🜄</span>
                            <span className="uppercase tracking-widest text-xs font-bold">{userLibrary.some(u => u.name === currentUser?.name) ? 'Actualizar Datos' : 'Guardar Carta'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* CARTA NATAL */}
            <div className="lg:col-span-8 lg:row-span-2 flex flex-col gap-6 order-2">
                <div className="glass-panel p-4 md:p-10 relative overflow-hidden min-h-[600px] flex flex-col rounded-none shadow-2xl border border-black/5">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[20rem] font-serif pointer-events-none animate-spin-slow select-none text-stone-900">❂</div>

                    <div className="flex justify-between items-center mb-10 z-10">
                        <h2 className="text-3xl font-serif text-[#1a1a1a] flex items-center gap-4">
                            <span className="text-[#C55959] animate-pulse">★</span>
                            <span className="tracking-tight uppercase font-black text-xl">Tu Mapa Astral</span>
                        </h2>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full mb-8">
                        {currentUser && currentUser.date ? (
                            <div className="w-full max-w-3xl aspect-square">
                                <ChartZoomWrapper
                                    title={`Carta de: ${currentUser.name || currentUser.city || 'Anónimo'}`}
                                    theme={chartTheme}
                                    onThemeChange={setChartTheme}
                                >
                                    <NatalChart2D
                                        date={currentUser.date}
                                        latitude={currentUser.latitude}
                                        longitude={currentUser.longitude}
                                        transitsDate={transitDate.toISOString()}
                                        showTransits={true}
                                        theme={chartTheme}
                                    />
                                </ChartZoomWrapper>
                            </div>
                        ) : (
                            <div className="text-center text-stone-300 p-20 border-2 border-dashed border-stone-100 rounded-none bg-stone-50/50">
                                <Atom size={64} className="mx-auto mb-6 opacity-10 animate-spin-slow" />
                                <h3 className="text-xl font-serif italic text-stone-400 mb-2">"Abyssus abyssum invocat"</h3>
                                <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Introduce tus datos de nacimiento para ver tu carta</p>
                            </div>
                        )}
                    </div>

                    {/* EXPLORADOR DE TRÁNSITOS */}
                    <div className="w-full max-w-2xl mx-auto px-4">
                        <div className="bg-stone-50 p-6 rounded-none border border-stone-100 shadow-inner group">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest flex items-center gap-2">
                                    <span className="w-1 h-1 bg-[#C55959] rounded-none"></span>
                                    Ver Tránsitos en Otra Fecha
                                </label>
                                <span className="font-mono text-[10px] text-[#C55959] font-bold bg-[#C55959]/10 px-2 py-0.5 rounded">
                                    {Math.abs(Math.floor((transitDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} días {transitDate >= new Date() ? 'en el futuro' : 'en el pasado'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="-90"
                                max="90"
                                value={Math.floor((transitDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                                onChange={(e) => { const days = parseInt(e.target.value); const newDate = new Date(); newDate.setDate(newDate.getDate() + days); setTransitDate(newDate); }}
                                className="w-full accent-[#C55959] h-1.5 bg-stone-200 rounded-none appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between mt-4">
                                <button onClick={() => setTransitDate(new Date())} className="text-[9px] font-bold uppercase text-stone-400 hover:text-stone-800 transition-colors py-1 px-3 border border-stone-200 rounded hover:border-stone-400">Volver al Hoy</button>
                                <div className="text-[10px] text-stone-500 font-serif italic flex items-center gap-1">
                                    <X size={10} className="text-stone-300" />
                                    {transitDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {currentUser && userSigns && (
                        <div className="mt-12 pt-10 border-t border-stone-100 w-full">
                            <h3 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-stone-300 mb-8">Tu Tríada Principal</h3>
                            <PlanetaryTrinity sun={userSigns.sun} moon={userSigns.moon} asc={userSigns.ascendant} />
                        </div>
                    )}
                </div>
            </div>

            {/* EFLUVIOS CELESTES */}
            <div className="lg:col-span-4 flex flex-col gap-4 order-3">
                <div className="glass-panel p-8 relative flex flex-col shadow-lg rounded-none h-full">
                    <div className="absolute top-6 right-6 text-6xl opacity-5 font-serif select-none pointer-events-none">🜃</div>
                    <h2 className="text-2xl font-serif text-[#1a1a1a] mb-2 flex items-center gap-3">
                        <span className="text-[#C55959]">🜂</span>
                        <span>Efluvios Celestes</span>
                    </h2>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#5B7C99] mb-4 border-b border-[#5B7C99]/20 pb-4 leading-relaxed">
                        Influencias planetarias activas — {transitDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>

                    {/* TABS DE EFLUVIOS — solo aparecen cuando hay más de uno */}
                    {efluvios.length > 1 && (
                        <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-hide">
                            {efluvios.map((eflu: any, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveEfluvio(i)}
                                    className={`flex-shrink-0 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-full border transition-all duration-200 ${
                                        safeActiveEfluvio === i
                                            ? 'bg-[#C55959] text-white border-[#C55959] shadow-md'
                                            : 'bg-white/60 text-stone-400 border-stone-200 hover:border-[#C55959]/50 hover:text-[#C55959]'
                                    }`}
                                    title={eflu?.planetSource || `Efluvio ${i + 1}`}
                                >
                                    {eflu?.planetSource || `Efluvio ${i + 1}`}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">

                        {/* EFLUVIO ACTIVO */}
                        {currentEfluvio && (
                            <div className="space-y-6">
                                <div className="p-8 bg-white/95 backdrop-blur-md border-l-4 border-[#C55959] rounded-none shadow-xl transform hover:-translate-y-1 transition-all duration-700 relative overflow-hidden group">
                                    <div className="absolute -top-4 -right-4 text-6xl opacity-[0.03] rotate-12 pointer-events-none group-hover:rotate-45 transition-transform duration-1000">🜁</div>
                                    <span className="inline-block px-3 py-1 bg-[#C55959]/10 text-[#C55959] text-[8px] font-black uppercase tracking-[0.3em] rounded-none mb-4">
                                        {currentEfluvio.theme || 'Influencia Activa'}
                                    </span>
                                    <h3 className="text-xl font-serif font-black text-[#1a1a1a] mb-4 leading-tight uppercase tracking-tight decoration-[#C55959]/30 underline-offset-8 decoration-2 underline">
                                        {currentEfluvio.headline}
                                    </h3>
                                    <p className="text-sm font-serif italic text-gray-800 leading-relaxed opacity-90 first-letter:text-3xl first-letter:font-black first-letter:mr-1 first-letter:float-left mb-6">
                                        {currentEfluvio.reading}
                                    </p>
                                    {currentEfluvio.advice && (
                                        <div className="mt-6 p-5 bg-black/5 rounded-none border border-black/5 relative shadow-inner">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C55959] mb-2 flex items-center gap-2">
                                                <Sun size={12} className="animate-pulse" /> Consejo para Hoy
                                            </p>
                                            <p className="text-xs text-gray-900 leading-relaxed font-serif">
                                                &quot;{currentEfluvio.advice}&quot;
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isReadingLoading && !currentEfluvio && (
                            <div className="p-10 flex flex-col items-center justify-center gap-4 text-stone-400">
                                <div className="relative">
                                    <Loader2 size={32} className="animate-spin text-[#C55959] opacity-40" />
                                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase">✦</div>
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Consultando los astros...</span>
                            </div>
                        )}

                        {/* BALANCE DE ELEMENTOS */}
                        {currentUser && (
                            <div className="space-y-10 animate-fadeIn delay-300">
                                {(() => {
                                    const astroData = calculateRealPlanets(currentUser.date, currentUser.latitude, currentUser.longitude);
                                    const data = calculateAstroBalance(astroData.planets);

                                    const Bar = ({ label, value, color, icon }: { label: string, value: number, color: string, icon: string }) => (
                                        <div className="space-y-2 group">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 group-hover:text-stone-800 transition-colors flex items-center gap-2">
                                                    <span className="text-sm opacity-50">{icon}</span> {label}
                                                </span>
                                                <span className="text-sm font-serif italic text-stone-400 group-hover:text-[#C55959] transition-colors">{value}%</span>
                                            </div>
                                            <div className="h-[2px] w-full bg-stone-100 relative overflow-hidden">
                                                <div
                                                    className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${value}%`, backgroundColor: color }}
                                                />
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <>
                                            {/* Elementos */}
                                            <div className="space-y-6 bg-[#F9F8F4]/50 p-6 border border-black/5 hover:bg-white transition-all">
                                                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C55959] mb-4 flex items-center gap-3">
                                                    <span className="w-4 h-[1px] bg-[#C55959]/30"></span> Balance de Elementos
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                                    <Bar label="Fuego" value={data.elements.Fuego} color="#FF6B6B" icon="🜂" />
                                                    <Bar label="Tierra" value={data.elements.Tierra} color="#8E9775" icon="🜃" />
                                                    <Bar label="Aire" value={data.elements.Aire} color="#6B96B4" icon="🜁" />
                                                    <Bar label="Agua" value={data.elements.Agua} color="#4A90E2" icon="🜄" />
                                                </div>
                                            </div>

                                            {/* Modalidades y Polaridades */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-[#F9F8F4]/50 p-6 border border-black/5 hover:bg-white transition-all space-y-6">
                                                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C55959] mb-4 flex items-center gap-3">
                                                        <span className="w-4 h-[1px] bg-[#C55959]/30"></span> Modalidades
                                                    </h4>
                                                    <Bar label="Cardinal" value={data.modalities.Cardinal} color="#1a1a1a" icon="◇" />
                                                    <Bar label="Fijo" value={data.modalities.Fijo} color="#1a1a1a" icon="□" />
                                                    <Bar label="Mutable" value={data.modalities.Mutable} color="#1a1a1a" icon="△" />
                                                </div>
                                                <div className="bg-[#F9F8F4]/50 p-6 border border-black/5 hover:bg-white transition-all space-y-6">
                                                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C55959] mb-4 flex items-center gap-3">
                                                        <span className="w-4 h-[1px] bg-[#C55959]/30"></span> Polaridades
                                                    </h4>
                                                    <Bar label="Activa (Yang)" value={data.polarities.Yang} color="#C55959" icon="☼" />
                                                    <Bar label="Receptiva (Yin)" value={data.polarities.Yin} color="#5B7C99" icon="☽" />
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {/* ASPECTOS ACTIVOS */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-800 flex items-center gap-2 mb-6">
                                <span className="w-6 h-[2px] bg-[#C55959]"></span>
                                Conexiones Planetarias del Día
                            </h4>
                            {dailyAspects.length > 0 ? dailyAspects.map((aspect, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-white/40 hover:bg-white/80 transition-colors rounded-none border border-white/50 group">
                                    <div className="text-2xl opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all text-[#C55959] font-serif">{aspect.symbol || '✧'}</div>
                                    <div className="flex-1">
                                        <div className="text-[9px] font-black uppercase tracking-wider text-stone-800 mb-1">
                                            {aspect.planet1}
                                            <span className="text-[#C55959] mx-2 opacity-50">•</span>
                                            {aspect.type}
                                            <span className="text-[#C55959] mx-2 opacity-50">•</span>
                                            {aspect.planet2}
                                        </div>
                                        <div className="text-[10px] text-stone-500 leading-relaxed font-serif italic">{aspect.descriptionEs || 'Esta conexión influye en tu energía de hoy.'}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-20 flex flex-col items-center">
                                    <div className="text-4xl mb-2">✦</div>
                                    <p className="text-[9px] font-black uppercase tracking-widest">Sin aspectos activos hoy</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CosmosView;
