'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { INITIAL_CHARACTERS, STARS, SCENES, LENSES } from '@/lib/astro-lab/types';
import { cn } from '@/lib/utils';
import '@/styles/astro-lab.css';

export default function AstroLabSimulator() {
    const [character] = useState(INITIAL_CHARACTERS[0]); // Default to Solara as in Stitch design

    return (
        <div className="astrolab-container min-h-screen text-white font-sans overflow-x-hidden">
            {/* <!-- Global Navigation Header --> */}
            <header className="flex justify-between items-center p-4 astrolab-header">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    <h1 className="text-xl font-bold tracking-widest text-blue-300 uppercase">ASTROLAB</h1>
                </div>
                <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-white/20 text-white/50 hover:text-white transition-colors">
                    <span className="text-xs">?</span>
                </button>
            </header>

            {/* <!-- Main Orbital View Section --> */}
            <section id="orbital-view" className="astrolab-orbital-view">
                <div className="astrolab-radial-glow"></div>

                {/* <!-- Elemental Nodes Around Circle --> */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="relative w-72 h-72 border border-blue-900/40 rounded-full flex items-center justify-center"
                >
                    {/* <!-- Active Character Card --> */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="astrolab-character-card"
                    >
                        <img
                            src={character.image}
                            alt={character.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="char-info-overlay">
                            <p className="text-orange-400 font-bold uppercase tracking-widest text-sm mb-1">{character.name}</p>
                            <div className="flex justify-center gap-1">
                                {character.elementalIcons.map((icon, i) => (
                                    <span key={i} className="text-[10px]">{icon}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* <!-- Elemental Orbits (Floating Nodes) --> */}

                    {/* Top Node */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="astrolab-slot astrolab-slot-blue"
                        >
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                        </motion.div>
                        <span className="block text-[10px] text-blue-300 font-bold uppercase mt-2 text-center tracking-widest">Active Slot</span>
                    </div>

                    {/* Left Node */}
                    <div className="absolute top-1/2 -left-6 -translate-y-1/2">
                        <motion.div
                            animate={{ x: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="astrolab-slot astrolab-slot-orange"
                        >
                            <span className="text-xs">🔥</span>
                        </motion.div>
                    </div>

                    {/* Right Node */}
                    <div className="absolute top-1/2 -right-6 -translate-y-1/2">
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                            className="astrolab-slot astrolab-slot-green"
                        >
                            <span className="text-xs">🌲</span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Narrative Layer (Dynamic Interpretation) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-16 max-w-lg text-center px-6"
                >
                    <div className="inline-block px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6">
                        <span className="astrolab-mono text-[9px] text-blue-400">Simulation Output</span>
                    </div>
                    <h2 className="text-2xl font-medium leading-relaxed italic text-white/90">
                        "The solar energy manifests through the character's core, creating a beacon of stability in the resource chamber."
                    </h2>
                </motion.div>
            </section>

            {/* Selection Grid (Interactive part for the user) */}
            <section className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer group">
                    <p className="astrolab-mono text-[9px] opacity-40 mb-3">Vector 1</p>
                    <p className="font-bold text-sm group-hover:text-blue-400 transition-colors">STARS & ELEMENTS</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer group">
                    <p className="astrolab-mono text-[9px] opacity-40 mb-3">Vector 2</p>
                    <p className="font-bold text-sm group-hover:text-amber-400 transition-colors">DOMAIN CHAMBERS</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer group">
                    <p className="astrolab-mono text-[9px] opacity-40 mb-3">Vector 3</p>
                    <p className="font-bold text-sm group-hover:text-emerald-400 transition-colors">FOCAL LENSES</p>
                </div>
            </section>

            <footer className="mt-20 py-10 border-t border-white/5 text-center">
                <p className="astrolab-mono text-[8px] opacity-20 tracking-[0.5em]">Astro Lab Independence // System Core v1.1.2</p>
            </footer>
        </div>
    );
}
