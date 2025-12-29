import React, { useRef } from 'react';
import { Book, X, Pencil, Trash2, Loader2, Atom, Sun, BookOpen } from 'lucide-react';
import { UserData, ChartTheme, CosmosViewMode } from './types';
import NatalChart2D from './NatalChart2D';
import CelestialSphere from './CelestialSphere';
import { ChartZoomWrapper, PlanetaryTrinity } from './shared-components';

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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn grid-flow-dense">

            {/* ITEM 1: INPUTS */}
            <div className="lg:col-span-4 flex flex-col gap-4 order-1">
                <div className="glass-panel p-8 relative overflow-hidden group h-fit bg-white/70 backdrop-blur-md border border-white/40">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <h1 className="text-9xl font-serif transform rotate-12 text-[#1a1a1a]">🜍</h1>
                    </div>

                    <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] flex items-center gap-2">
                                <span>🜁</span> Origen
                            </h2>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Configuración de la Piedra Angular</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 mb-8 relative z-10">
                        <div className="group/input relative">
                            <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 block group-focus-within/input:text-[#C55959] transition-colors">Nombre del Alquimista</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="input-minimal flex-1 bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] transition-colors text-lg font-serif px-3 py-2"
                                    placeholder="Nombre o Alias..."
                                    value={currentUser?.name || ''}
                                    onChange={e => setCurrentUser(prev => prev ? { ...prev, name: e.target.value } : { name: e.target.value, date: new Date().toISOString(), latitude: 40, longitude: -3 })}
                                />
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

                            {showUserLibrary && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-black/10 shadow-2xl rounded-lg z-50 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 bg-[#F9F8F4] border-b border-black/5 flex justify-between items-center sticky top-0">
                                        <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500 font-mono">Bibliotheca Anthropos</span>
                                        <button onClick={() => setShowUserLibrary(false)}><X size={12} /></button>
                                    </div>
                                    {userLibrary.length === 0 && (
                                        <div className="p-4 text-center text-xs text-gray-400 italic">No hay registros antiguos.</div>
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
                                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 flex items-center gap-2"><span>Hora</span><span className="text-[8px] bg-red-100 text-red-800 px-1 rounded font-mono">TEMPUS</span></label>
                                <input ref={timeRef} type="time" className="input-minimal w-full text-center font-mono bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] py-3 text-lg" value={currentUser?.date ? new Date(currentUser.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '12:00'} onChange={e => { const [h, m] = e.target.value.split(':'); const d = currentUser?.date ? new Date(currentUser.date) : new Date(); d.setHours(parseInt(h) || 0, parseInt(m) || 0); setCurrentUser(prev => prev ? { ...prev, date: d.toISOString() } : { date: d.toISOString(), latitude: 40, longitude: -3 }); }} />
                            </div>
                            <div className="relative">
                                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 block">Lugar</label>
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
                            <span className="uppercase tracking-widest text-xs font-bold">{userLibrary.some(u => u.name === currentUser?.name) ? 'Actualizar Registro' : 'Cristalizar Esencia'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ITEM 2: CHART */}
            <div className="lg:col-span-8 lg:row-span-2 flex flex-col gap-6 order-2">
                <div className="glass-panel p-4 md:p-10 bg-white/95 backdrop-blur-2xl border border-white/60 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden min-h-[600px] flex flex-col rounded-3xl">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[20rem] font-serif pointer-events-none animate-spin-slow select-none text-stone-900">❂</div>

                    <div className="flex justify-between items-center mb-10 z-10">
                        <h2 className="text-3xl font-serif text-[#1a1a1a] flex items-center gap-4">
                            <span className="text-[#C55959] animate-pulse">★</span>
                            <span className="tracking-tight">Mapa del Destino</span>
                        </h2>
                        <div className="flex bg-stone-100 p-1 rounded-full border border-stone-200">
                            <button onClick={() => setCosmosViewMode('RADIAL')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-full transition-all duration-300 ${cosmosViewMode === 'RADIAL' ? 'bg-white text-[#C55959] shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>Radial</button>
                            <button onClick={() => setCosmosViewMode('SPHERE')} className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-full transition-all duration-300 ${cosmosViewMode === 'SPHERE' ? 'bg-white text-[#C55959] shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>Esfera</button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full mb-8">
                        {currentUser && currentUser.date ? (
                            <div className="w-full max-w-3xl aspect-square">
                                <ChartZoomWrapper
                                    title={`Speculum: ${currentUser.name || currentUser.city || 'Anónimo'}`}
                                    theme={chartTheme}
                                    onThemeChange={setChartTheme}
                                >
                                    {cosmosViewMode === 'RADIAL' ? (
                                        <NatalChart2D
                                            date={currentUser.date}
                                            latitude={currentUser.latitude}
                                            longitude={currentUser.longitude}
                                            transitsDate={transitDate.toISOString()}
                                            showTransits={true}
                                            theme={chartTheme}
                                        />
                                    ) : (
                                        <CelestialSphere
                                            date={currentUser.date}
                                            width={600}
                                            height={600}
                                        />
                                    )}
                                </ChartZoomWrapper>
                            </div>
                        ) : (
                            <div className="text-center text-stone-300 p-20 border-2 border-dashed border-stone-100 rounded-3xl bg-stone-50/50">
                                <Atom size={64} className="mx-auto mb-6 opacity-10 animate-spin-slow" />
                                <h3 className="text-xl font-serif italic text-stone-400 mb-2">"Abyssus abyssum invocat"</h3>
                                <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Inicia la Gran Obra introduciendo tus datos</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full max-w-2xl mx-auto px-4">
                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 shadow-inner group">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest flex items-center gap-2">
                                    <span className="w-1 h-1 bg-[#C55959] rounded-full"></span>
                                    Cronómetro de Tránsitos
                                </label>
                                <span className="font-mono text-[10px] text-[#C55959] font-bold bg-[#C55959]/10 px-2 py-0.5 rounded">
                                    {Math.abs(Math.floor((transitDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Días {transitDate >= new Date() ? 'Futuro' : 'Pasado'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="-90"
                                max="90"
                                value={Math.floor((transitDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                                onChange={(e) => { const days = parseInt(e.target.value); const newDate = new Date(); newDate.setDate(newDate.getDate() + days); setTransitDate(newDate); }}
                                className="w-full accent-[#C55959] h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between mt-4">
                                <button onClick={() => setTransitDate(new Date())} className="text-[9px] font-bold uppercase text-stone-400 hover:text-stone-800 transition-colors py-1 px-3 border border-stone-200 rounded hover:border-stone-400">Restaurar Presente</button>
                                <div className="text-[10px] text-stone-500 font-serif italic flex items-center gap-1">
                                    <X size={10} className="text-stone-300" />
                                    {transitDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {currentUser && userSigns && (
                        <div className="mt-12 pt-10 border-t border-stone-100 w-full">
                            <h3 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-stone-300 mb-8">Triada Inmortal</h3>
                            <PlanetaryTrinity sun={userSigns.sun} moon={userSigns.moon} asc={userSigns.ascendant} />
                        </div>
                    )}
                </div>
            </div>

            {/* ITEM 3: TRANSITS */}
            <div className="lg:col-span-4 flex flex-col gap-4 order-3">
                <div className="glass-panel p-8 bg-[#F2F0E9] relative flex flex-col border border-[#E5E2D8] shadow-lg rounded-2xl h-full">
                    <div className="absolute top-6 right-6 text-6xl opacity-5 font-serif select-none pointer-events-none">🜃</div>
                    <h2 className="text-2xl font-serif text-[#1a1a1a] mb-2 flex items-center gap-3">
                        <span className="text-[#C55959]">🜂</span>
                        <span>Efluvios Celestes</span>
                    </h2>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#5B7C99] mb-8 border-b border-[#5B7C99]/20 pb-4 leading-relaxed">
                        {transitDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>

                    {/* AI READING */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
                        {dailyReading && (
                            <div className="p-6 bg-white/90 backdrop-blur-sm border-l-4 border-[#C55959] rounded-r-2xl shadow-sm transform hover:-translate-y-1 transition-transform duration-500">
                                <h3 className="text-base font-serif font-bold text-[#C55959] mb-3 leading-tight uppercase tracking-tight">{dailyReading.headline}</h3>
                                <p className="text-xs font-serif italic text-gray-700 leading-loose opacity-90 italic">"{dailyReading.reading}"</p>
                            </div>
                        )}
                        {isReadingLoading && (
                            <div className="p-10 flex flex-col items-center justify-center gap-4 text-stone-400">
                                <div className="relative">
                                    <Loader2 size={32} className="animate-spin text-[#C55959] opacity-40" />
                                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase">Oracle</div>
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Consultando la Bóveda...</span>
                            </div>
                        )}

                        {/* ASPECTS LIST */}
                        <div className="space-y-3">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#5B7C99] flex items-center gap-2 mb-4">
                                <span className="w-4 h-[1px] bg-[#5B7C99]/30"></span>
                                Conjunciones & Ángulos
                            </h4>
                            {dailyAspects.length > 0 ? dailyAspects.map((aspect, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-white/40 hover:bg-white/80 transition-colors rounded-xl border border-white/50 group">
                                    <div className="text-2xl opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all text-[#C55959] font-serif">{aspect.symbol || '✧'}</div>
                                    <div className="flex-1">
                                        <div className="text-[9px] font-black uppercase tracking-wider text-stone-800 mb-1">
                                            {aspect.planet1}
                                            <span className="text-[#C55959] mx-2 opacity-50">•</span>
                                            {aspect.type}
                                            <span className="text-[#C55959] mx-2 opacity-50">•</span>
                                            {aspect.planet2}
                                        </div>
                                        <div className="text-[10px] text-stone-500 leading-relaxed font-serif italic italic">{aspect.descriptionEs || "La influencia energética resuena en tu estructura."}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-20 flex flex-col items-center">
                                    <div className="text-4xl mb-2">✦</div>
                                    <p className="text-[9px] font-black uppercase tracking-widest">Silencio Estelar</p>
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
