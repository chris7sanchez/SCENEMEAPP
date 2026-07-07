import React, { useRef, useState, useEffect } from 'react';
import { Book, X, Pencil, Trash2, Loader2, Atom } from 'lucide-react';
import { UserData, ChartTheme, CosmosViewMode } from './types';
import NatalChart2D from './NatalChart2D';
import { ChartZoomWrapper } from './shared-components';
import { calculateAstroBalance } from '@/utils/astrology';
import { calculateRealPlanets } from '@/utils/astronomy';
import { AsteroidPosition, signOfLongitude, degreeInSign } from '@/utils/asteroids';

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
}

const SIGN_ESS: Record<string, string> = {
    'Aries': 'directo, impulsivo y con mucha iniciativa',
    'Tauro': 'tranquilo y sensorial; necesitas seguridad y cuidar lo tuyo',
    'Géminis': 'curioso y comunicativo; pruebas, cambias y tiendes puentes',
    'Cáncer': 'sensible y protector; te mueve el afecto y cuidar a los tuyos',
    'Leo': 'expresivo y cálido; necesitas brillar y que te vean',
    'Virgo': 'observador y práctico; mejoras y afinas todo lo que tocas',
    'Libra': 'buscas armonía y equilibrio; te cuesta el conflicto',
    'Escorpio': 'intenso y profundo; lo vives todo a fondo, sin medias tintas',
    'Sagitario': 'libre y aventurero; necesitas sentido y horizonte',
    'Capricornio': 'responsable y constante; maduras pronto y vas a por tus metas',
    'Acuario': 'independiente y original; piensas distinto al resto',
    'Piscis': 'sensible y soñador; captas lo que otros no ven',
};

const CosmosView: React.FC<CosmosViewProps> = (props) => {
    const {
        currentUser, setCurrentUser, userLibrary, setUserLibrary,
        showUserLibrary, setShowUserLibrary, dateParts, handleDatePartChange,
        handleLocationSearch, isSearching, searchQuery, setSearchQuery,
        locationResults, selectLocation, handleSaveUser,
        transitDate, setTransitDate, chartTheme, setChartTheme,
        dailyReading, isReadingLoading
    } = props;

    const dayRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLSelectElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);
    const timeRef = useRef<HTMLInputElement>(null);

    const efluvios: any[] = dailyReading?.efluvios ?? (dailyReading ? [dailyReading] : []);

    const [asteroids, setAsteroids] = useState<AsteroidPosition[]>([]);
    useEffect(() => {
        if (!currentUser?.date) { setAsteroids([]); return; }
        let cancelled = false;
        fetch(`/api/asteroids?date=${encodeURIComponent(currentUser.date)}`)
            .then(r => r.json())
            .then(j => { if (!cancelled && j?.ok && Array.isArray(j.asteroids)) setAsteroids(j.asteroids); })
            .catch(() => { });
        return () => { cancelled = true; };
    }, [currentUser?.date]);

    // Datos de la carta (planetas + ascendente) para leyenda y esencia
    const astro = currentUser?.date
        ? calculateRealPlanets(currentUser.date, currentUser.latitude, currentUser.longitude)
        : null;
    const legendPlanets: any[] = astro?.planets ?? [];
    const sunSign = (() => { const p = legendPlanets.find(x => x.name === 'Sol'); return p ? signOfLongitude(p.longitude) : ''; })();
    const moonSign = (() => { const p = legendPlanets.find(x => x.name === 'Luna'); return p ? signOfLongitude(p.longitude) : ''; })();
    const ascSign = astro ? signOfLongitude(astro.ascendant) : '';

    const diffDays = Math.floor((transitDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-fadeIn">

            <div className="lg:col-span-3 flex flex-col gap-5 order-1">

                <div className="glass-panel p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <h1 className="text-7xl font-serif transform rotate-12 text-[#1a1a1a]">🜍</h1>
                    </div>
                    <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
                        <div>
                            <h2 className="text-lg font-serif text-[#1a1a1a] flex items-center gap-2"><span>🜁</span> Tu Carta Natal</h2>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Introduce tus datos de nacimiento</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 relative z-10">
                        <div className="relative">
                            <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mb-1 block">Tu Nombre</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="input-minimal flex-1 bg-[#F9F8F4] border border-black/10 focus:border-[#C55959] transition-colors text-lg font-serif px-3 py-2"
                                    placeholder="Nombre o alias..."
                                    value={currentUser?.name || ''}
                                    onChange={e => setCurrentUser(prev => prev ? { ...prev, name: e.target.value } : { name: e.target.value, date: new Date().toISOString(), latitude: 40, longitude: -3 })}
                                />
                                <button onClick={() => setShowUserLibrary(!showUserLibrary)} className="p-2 hover:bg-[#F9F8F4] text-gray-400 hover:text-[#C55959] transition-colors relative" title="Cargar carta guardada">
                                    <Book size={18} />
                                    {userLibrary.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-[#C55959] animate-pulse" />}
                                </button>
                            </div>
                            {showUserLibrary && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-black/10 shadow-2xl z-50 max-h-64 overflow-y-auto">
                                    <div className="p-2 bg-[#F9F8F4] border-b border-black/5 flex justify-between items-center sticky top-0">
                                        <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500 font-mono">Cartas Guardadas</span>
                                        <button onClick={() => setShowUserLibrary(false)}><X size={12} /></button>
                                    </div>
                                    {userLibrary.length === 0 && <div className="p-4 text-center text-xs text-gray-400 italic">No hay cartas guardadas aún.</div>}
                                    {userLibrary.map((user, i) => (
                                        <div key={i} className="p-3 border-b border-black/5 hover:bg-[#F9F8F4] flex justify-between items-center transition-colors">
                                            <div className="cursor-pointer flex-1" onClick={() => { setCurrentUser(user); setTransitDate(new Date()); setShowUserLibrary(false); }}>
                                                <div className="font-bold text-sm text-[#1a1a1a]">{user.name || user.city}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">{new Date(user.date).toLocaleDateString()}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); setCurrentUser(user); setShowUserLibrary(false); }} className="text-gray-300 hover:text-[#C55959]"><Pencil size={12} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); const updated = userLibrary.filter((_, idx) => idx !== i); setUserLibrary(updated); localStorage.setItem('userLibrary', JSON.stringify(updated)); }} className="text-gray-300 hover:text-red-600"><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-4 gap-3">
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
                                <div className="absolute top-full left-0 w-full bg-white border border-black/10 shadow-xl z-50 mt-1 max-h-48 overflow-y-auto">
                                    {locationResults.map((loc: any) => (
                                        <button key={loc.id} onClick={() => selectLocation(loc)} className="w-full text-left px-4 py-2 hover:bg-[#F9F8F4] border-b border-black/5 flex flex-col items-start gap-1">
                                            <div className="font-bold text-[10px] uppercase text-stone-800">{loc.name}</div>
                                            <div className="text-[8px] text-gray-500 font-mono italic">{loc.admin1}, {loc.country}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={() => currentUser && handleSaveUser(currentUser)} className="bg-[#1a1a1a] hover:bg-[#C55959] text-[#F9F8F4] px-6 py-3 w-full flex items-center justify-center gap-3 transition-all mt-1 shadow-2xl">
                            <span className="text-lg">🜄</span>
                            <span className="uppercase tracking-widest text-xs font-bold">{userLibrary.some(u => u.name === currentUser?.name) ? 'Actualizar Datos' : 'Guardar Carta'}</span>
                        </button>
                    </div>
                </div>

                {currentUser && astro && (() => {
                    const data = calculateAstroBalance(astro.planets);
                    const Bar = ({ label, value, color }: { label: string; value: number; color: string }) => (
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-500">{label}</span>
                                <span className="text-[11px] font-serif italic text-stone-400">{value}%</span>
                            </div>
                            <div className="h-[3px] w-full bg-stone-100 overflow-hidden">
                                <div className="h-full" style={{ width: `${value}%`, backgroundColor: color }} />
                            </div>
                        </div>
                    );
                    return (
                        <div className="glass-panel p-5 shadow-lg">
                            <h2 className="text-base font-serif text-[#1a1a1a] mb-4 flex items-center gap-2"><span className="text-[#C55959]">🜃</span> Balance</h2>
                            <div className="space-y-4">
                                <div className="space-y-2.5">
                                    <h4 className="text-[8px] font-black uppercase tracking-[0.25em] text-[#C55959]">Elementos</h4>
                                    <Bar label="Fuego" value={data.elements.Fuego} color="#FF6B6B" />
                                    <Bar label="Tierra" value={data.elements.Tierra} color="#8E9775" />
                                    <Bar label="Aire" value={data.elements.Aire} color="#6B96B4" />
                                    <Bar label="Agua" value={data.elements.Agua} color="#4A90E2" />
                                </div>
                                <div className="space-y-2.5">
                                    <h4 className="text-[8px] font-black uppercase tracking-[0.25em] text-[#C55959]">Modalidades</h4>
                                    <Bar label="Cardinal" value={data.modalities.Cardinal} color="#1a1a1a" />
                                    <Bar label="Fijo" value={data.modalities.Fijo} color="#1a1a1a" />
                                    <Bar label="Mutable" value={data.modalities.Mutable} color="#1a1a1a" />
                                </div>
                                <div className="space-y-2.5">
                                    <h4 className="text-[8px] font-black uppercase tracking-[0.25em] text-[#C55959]">Polaridades</h4>
                                    <Bar label="Activa (Yang)" value={data.polarities.Yang} color="#C55959" />
                                    <Bar label="Receptiva (Yin)" value={data.polarities.Yin} color="#5B7C99" />
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            <div className="lg:col-span-6 flex flex-col gap-6 order-2">
                <div className="glass-panel p-4 md:p-6 relative overflow-hidden flex flex-col shadow-2xl border border-black/5">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[12rem] font-serif pointer-events-none animate-spin-slow select-none text-stone-900">❂</div>

                    <div className="flex justify-between items-center mb-5 z-10">
                        <h2 className="text-xl font-serif text-[#1a1a1a] flex items-center gap-3">
                            <span className="text-[#C55959] animate-pulse">★</span>
                            <span className="tracking-tight uppercase font-black text-base">Tu Mapa Astral</span>
                        </h2>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
                        {currentUser && currentUser.date ? (
                            <div className="w-full max-w-xl aspect-square">
                                <ChartZoomWrapper title={`Carta de: ${currentUser.name || currentUser.city || 'Anónimo'}`} theme={chartTheme} onThemeChange={setChartTheme}>
                                    <NatalChart2D date={currentUser.date} latitude={currentUser.latitude} longitude={currentUser.longitude} transitsDate={transitDate.toISOString()} showTransits={true} theme={chartTheme} />
                                </ChartZoomWrapper>
                            </div>
                        ) : (
                            <div className="text-center text-stone-300 p-12 border-2 border-dashed border-stone-100 bg-stone-50/50">
                                <Atom size={48} className="mx-auto mb-4 opacity-10 animate-spin-slow" />
                                <h3 className="text-base font-serif italic text-stone-400 mb-2">"Abyssus abyssum invocat"</h3>
                                <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Introduce tus datos de nacimiento para ver tu carta</p>
                            </div>
                        )}
                    </div>

                    {currentUser && (sunSign || moonSign || ascSign) && (
                        <div className="mt-6 pt-5 border-t border-stone-100 w-full">
                            <h3 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-stone-400 mb-4">Tu Esencia</h3>
                            <div className="space-y-3 max-w-xl mx-auto">
                                {sunSign && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg w-6 text-center" style={{ color: '#FDB813' }}>☉</span>
                                        <div><div className="text-sm font-bold text-[#1a1a1a]">Sol en {sunSign}</div><div className="text-[13px] text-stone-600 leading-relaxed">En el fondo eres {SIGN_ESS[sunSign]}.</div></div>
                                    </div>
                                )}
                                {moonSign && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg w-6 text-center" style={{ color: '#8a8f99' }}>☽</span>
                                        <div><div className="text-sm font-bold text-[#1a1a1a]">Luna en {moonSign}</div><div className="text-[13px] text-stone-600 leading-relaxed">Emocionalmente, {SIGN_ESS[moonSign]}.</div></div>
                                    </div>
                                )}
                                {ascSign && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-xs font-mono font-bold w-6 text-center pt-1" style={{ color: '#C55959' }}>AC</span>
                                        <div><div className="text-sm font-bold text-[#1a1a1a]">Ascendente {ascSign}</div><div className="text-[13px] text-stone-600 leading-relaxed">Por fuera te muestras {SIGN_ESS[ascSign]}.</div></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-3 order-3">
                <div className="glass-panel p-5 shadow-lg">
                    <h2 className="text-base font-serif text-[#1a1a1a] mb-1 flex items-center gap-2"><span className="text-[#C55959]">🜔</span> Posiciones</h2>
                    <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-gray-400 mb-3 border-b border-black/5 pb-3">Astros y asteroides de tu carta</p>
                    {currentUser ? (
                        <div className="flex flex-col">
                            {legendPlanets.map((p: any) => (
                                <div key={p.name} className="flex items-center gap-2 py-1.5 border-b border-black/5 text-xs">
                                    <span style={{ color: p.color }} className="text-base w-5 text-center">{p.symbol}</span>
                                    <span className="text-stone-700 flex-1">{p.name}</span>
                                    <span className="font-mono text-[10px] text-stone-400">{Math.floor(p.degree)}° {p.sign?.slice(0, 3)}</span>
                                </div>
                            ))}
                            <div className="mt-3 mb-1 text-[9px] font-mono uppercase tracking-[0.18em] text-[#9370DB]">Asteroides</div>
                            {asteroids.length > 0 ? asteroids.map((a) => (
                                <div key={a.name} className="flex items-center gap-2 py-1.5 border-b border-black/5 text-xs">
                                    <span style={{ color: a.color }} className="text-base w-5 text-center">{a.symbol}</span>
                                    <span className="text-stone-700 flex-1">{a.name}</span>
                                    <span className="font-mono text-[10px] text-stone-400">{degreeInSign(a.longitude)}° {signOfLongitude(a.longitude).slice(0, 3)}</span>
                                </div>
                            )) : <div className="text-[10px] text-stone-300 italic py-2">Cargando…</div>}
                        </div>
                    ) : (
                        <div className="text-center text-stone-300 py-12"><p className="text-[10px] uppercase tracking-[0.3em] font-bold">Introduce tus datos</p></div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-12 order-4">
                <div className="glass-panel p-6 shadow-lg">
                    <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                        <h2 className="text-xl font-serif text-[#1a1a1a] flex items-center gap-3"><span className="text-[#C55959]">🜂</span> Tránsitos</h2>
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#5B7C99]">{transitDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>

                    <div className="bg-stone-50 p-4 border border-stone-100 shadow-inner mb-5">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Ver tránsitos en otra fecha</label>
                            <span className="font-mono text-[10px] text-[#C55959] font-bold bg-[#C55959]/10 px-2 py-0.5 rounded">{Math.abs(diffDays)} días {diffDays >= 0 ? 'en el futuro' : 'en el pasado'}</span>
                        </div>
                        <input type="range" min="-90" max="90" value={diffDays} onChange={(e) => { const days = parseInt(e.target.value); const nd = new Date(); nd.setDate(nd.getDate() + days); setTransitDate(nd); }} className="w-full accent-[#C55959] h-1.5 bg-stone-200 appearance-none cursor-pointer" />
                        <div className="flex justify-between mt-3">
                            <button onClick={() => setTransitDate(new Date())} className="text-[9px] font-bold uppercase text-stone-400 hover:text-stone-800 py-1 px-3 border border-stone-200 hover:border-stone-400">Volver al hoy</button>
                            <span className="text-[10px] text-stone-500 font-serif italic">{transitDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>

                    {isReadingLoading && efluvios.length === 0 ? (
                        <div className="py-10 flex flex-col items-center justify-center gap-4 text-stone-400">
                            <Loader2 size={28} className="animate-spin text-[#C55959] opacity-40" />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Consultando los astros...</span>
                        </div>
                    ) : efluvios.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {efluvios.map((eflu: any, i: number) => (
                                <div key={i} className="p-4 bg-white/90 border border-stone-100 border-l-2 border-l-[#C55959]">
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C55959] mb-1.5">{eflu.planetSource}</div>
                                    <p className="text-[13px] text-stone-700 leading-relaxed">{eflu.reading}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 opacity-30"><div className="text-3xl mb-1">✦</div><p className="text-[9px] font-black uppercase tracking-widest">Sin tránsitos fuertes hoy</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CosmosView;
