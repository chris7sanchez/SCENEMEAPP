import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Clock, Search, X, Zap } from 'lucide-react';
import { calculateRealPlanets } from '@/utils/astronomy';
import { calculateAspects } from '@/utils/astrology';

interface MiniCalculatorProps {
    currentDate?: string;
}

type CalculatorTab = 'progression' | 'timezone' | 'aspects';

const MiniCalculator: React.FC<MiniCalculatorProps> = ({ currentDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<CalculatorTab>('timezone');

    // Timezone converter state
    const [localTime, setLocalTime] = useState(new Date().toISOString().slice(0, 16));
    const [utcTime, setUtcTime] = useState('');

    // Aspect search state
    const [aspectSearchDate, setAspectSearchDate] = useState(currentDate || new Date().toISOString());
    const [foundAspects, setFoundAspects] = useState<any[]>([]);

    const handleTimezoneConversion = (input: string, type: 'local' | 'utc') => {
        if (type === 'local') {
            setLocalTime(input);
            const date = new Date(input);
            setUtcTime(date.toISOString().slice(0, 16));
        } else {
            setUtcTime(input);
            const date = new Date(input + 'Z');
            setLocalTime(date.toISOString().slice(0, 16).replace('Z', ''));
        }
    };

    const searchAspects = () => {
        try {
            const planets = calculateRealPlanets(aspectSearchDate, 0, 0);
            const aspects = calculateAspects(planets.planets, planets.planets, 'NATAL');
            setFoundAspects(aspects.slice(0, 10));
        } catch (e) {
            console.error('Aspect search error:', e);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`fixed bottom-32 right-6 z-[99] w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${isOpen ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-50'
                    }`}
            >
                {isOpen ? <X size={20} /> : <Calculator size={20} />}
            </motion.button>

            {/* Calculator Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 400, y: 0 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 400, y: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-32 right-24 z-[98] w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-black/10 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-wider">Calculadora Rápida</h3>
                                    <p className="text-[9px] opacity-75 uppercase tracking-widest">Herramientas Esenciales</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-black/5 bg-gray-50">
                            {[
                                { id: 'timezone', icon: Clock, label: 'Hora' },
                                { id: 'aspects', icon: Search, label: 'Aspectos' },
                                { id: 'progression', icon: Calculator, label: 'Progresión' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as CalculatorTab)}
                                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                                            ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    <tab.icon size={12} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[400px] overflow-y-auto">
                            {activeTab === 'timezone' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                                            Hora Local
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={localTime}
                                            onChange={(e) => handleTimezoneConversion(e.target.value, 'local')}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <span className="text-indigo-600 text-xs">⇅</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                                            Hora UTC
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={utcTime}
                                            onChange={(e) => handleTimezoneConversion(e.target.value, 'utc')}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="bg-indigo-50 p-4 rounded-xl">
                                        <p className="text-[9px] text-indigo-900 leading-relaxed font-medium">
                                            💡 Modifica cualquier campo para ver la conversión instantánea entre zonas horarias.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'aspects' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                                            Fecha de Búsqueda
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={aspectSearchDate.slice(0, 16)}
                                            onChange={(e) => setAspectSearchDate(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <button
                                        onClick={searchAspects}
                                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Search size={14} />
                                        Buscar Aspectos
                                    </button>

                                    {foundAspects.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                                Resultados ({foundAspects.length})
                                            </p>
                                            {foundAspects.map((aspect, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold">
                                                            {aspect.planet1} • {aspect.type} • {aspect.planet2}
                                                        </span>
                                                        <span className="text-[9px] text-gray-400">
                                                            {aspect.orb?.toFixed(2)}°
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-600">
                                                        {aspect.descriptionEs || 'Aspecto detectado'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'progression' && (
                                <div className="space-y-4">
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Calculator size={32} className="text-indigo-600" />
                                        </div>
                                        <h4 className="font-black text-sm mb-2 text-gray-900">Progresiones Secundarias</h4>
                                        <p className="text-xs text-gray-500 mb-6 max-w-[250px] mx-auto">
                                            Calcula progresiones secundarias basadas en la carta natal
                                        </p>
                                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                            <p className="text-[10px] text-amber-900 font-semibold">
                                                🚧 Característica en desarrollo
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MiniCalculator;
