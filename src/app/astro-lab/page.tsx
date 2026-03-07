'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_CHARACTERS, Character } from '@/lib/astro-lab/types';
import AstroLabSimulator from '@/components/astro-lab/AstroLabSimulator';
import { Search, Filter, User, BookOpen, UserCircle, Home as HomeIcon, ChevronRight } from 'lucide-react';
import '@/styles/astro-lab.css';

type AppStep = 'lobby' | 'character-select' | 'house-select' | 'sign-select' | 'simulation';

export default function AstroLabPage() {
    const [step, setStep] = useState<AppStep>('lobby');
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

    return (
        <main className="min-h-screen astrolab-container">
            <AnimatePresence mode="wait">
                {step === 'lobby' && (
                    <motion.div 
                        key="lobby"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="astrolab-light min-h-screen p-6"
                    >
                        <header className="max-w-md mx-auto mb-12 text-center">
                            <h1 className="text-3xl font-serif mb-2 astrolab-ink-text">Astro Lab</h1>
                            <p className="text-sm opacity-60">Explora las conexiones arquetípicas</p>
                        </header>

                        <div className="grid gap-6 max-w-sm mx-auto">
                            <LobbyCard 
                                title="PERSONAJES" 
                                description="Selecciona tu actor estelar" 
                                icon={<UserCircle className="w-6 h-6" />}
                                onClick={() => setStep('character-select')}
                            />
                            <LobbyCard 
                                title="CASAS" 
                                description="Define el escenario de acción" 
                                icon={<HomeIcon className="w-6 h-6" />}
                                onClick={() => {}}
                                disabled
                            />
                            <LobbyCard 
                                title="SIGNOS" 
                                description="Añade el matiz de personalidad" 
                                icon={<BookOpen className="w-6 h-6" />}
                                onClick={() => {}}
                                disabled
                            />
                        </div>
                    </motion.div>
                )}

                {step === 'character-select' && (
                    <motion.div 
                        key="chars"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        className="astrolab-light min-h-screen pb-24"
                    >
                        {/* Header based on user image */}
                        <div className="p-4 flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                <input 
                                    type="text" 
                                    placeholder="Search Characters" 
                                    className="search-bar-rounded pl-12 focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-col items-center opacity-70">
                                <User className="w-5 h-5" />
                                <span className="text-[9px] font-bold">Element</span>
                            </div>
                            <div className="flex flex-col items-center opacity-70">
                                <Filter className="w-5 h-5" />
                                <span className="text-[9px] font-bold">Archetype</span>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="character-grid">
                            {INITIAL_CHARACTERS.map((char) => (
                                <CharacterCard 
                                    key={char.id} 
                                    char={char} 
                                    isSelected={selectedCharacter?.id === char.id}
                                    onSelect={() => setSelectedCharacter(char)}
                                />
                            ))}
                        </div>

                        {/* Bottom Nav Mockup */}
                        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-t border-black/5 flex justify-around items-center px-4">
                            <NavItem icon={<HomeIcon className="w-5 h-5" />} label="Home" onClick={() => setStep('lobby')} />
                            <NavItem icon={<UserCircle className="w-5 h-5" />} label="Characters" active />
                            <NavItem icon={<BookOpen className="w-5 h-5" />} label="Lore" />
                            <NavItem icon={<User className="w-5 h-5" />} label="Profile" />
                        </div>

                        {/* Proceed Button (Bottom Right) */}
                        {selectedCharacter && (
                            <motion.button 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={() => setStep('simulation')}
                                className="fixed bottom-24 right-6 w-14 h-14 bg-amber-900 text-white rounded-full shadow-xl flex items-center justify-center z-50"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </motion.button>
                        )}
                    </motion.div>
                )}

                {step === 'simulation' && (
                    <motion.div 
                        key="sim"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="astrolab-dark min-h-screen"
                    >
                        <AstroLabSimulator />
                        <button 
                            onClick={() => setStep('character-select')}
                            className="fixed top-20 left-4 px-4 py-2 bg-white/10 rounded-full text-xs"
                        >
                            Volver a Selección
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

function LobbyCard({ title, description, icon, onClick, disabled }: { title: string, description: string, icon: React.ReactNode, onClick: () => void, disabled?: boolean }) {
    return (
        <button 
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "w-full p-6 parchment-card text-left flex items-center gap-6 transition-all",
                disabled ? "opacity-30 grayscale" : "hover:scale-105 active:scale-95"
            )}
        >
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-900/60">
                {icon}
            </div>
            <div>
                <h3 className="font-serif text-lg tracking-widest astrolab-ink-text">{title}</h3>
                <p className="text-xs opacity-50">{description}</p>
            </div>
        </button>
    );
}

function CharacterCard({ char, isSelected, onSelect }: { char: Character, isSelected: boolean, onSelect: () => void }) {
    return (
        <div className="flex flex-col items-center">
            <button 
                onClick={onSelect}
                className={cn(
                    "w-full aspect-[4/5] parchment-card overflow-hidden transition-all border-2",
                    isSelected ? "border-amber-600 scale-105 shadow-xl" : "border-transparent"
                )}
            >
                <img src={char.image} className="w-full h-2/3 object-cover border-b border-amber-900/10" alt={char.name} />
                <div className="p-3 text-center h-1/3 flex flex-col justify-center">
                    <h4 className="font-serif text-sm font-bold truncate">{char.name}</h4>
                    <p className="text-[9px] opacity-60 uppercase tracking-tight">{char.archetype}</p>
                </div>
            </button>
            <button className="mt-2 text-[10px] font-bold text-amber-900/60 uppercase tracking-widest hover:text-amber-900">
                Ver Ficha
            </button>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                active ? "text-amber-800" : "text-black/30"
            )}
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
