import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewMode } from './types';

interface AlchemicalPortalProps {
    isTransitioning: boolean;
    fromMode: ViewMode;
    toMode: ViewMode;
}

const SYMBOLS: Record<ViewMode, string> = {
    'COSMOS': '☉',
    'BODY': '☿',
    'SPIRIT': '♅',
    'ALCHIMESTRY': '⚗'
};

const COLORS: Record<ViewMode, string> = {
    'COSMOS': '#1a1a1a',
    'BODY': '#C55959',
    'SPIRIT': '#4f46e5',
    'ALCHIMESTRY': '#C5A059'
};

const AlchemicalPortal: React.FC<AlchemicalPortalProps> = ({ isTransitioning, fromMode, toMode }) => {
    return (
        <AnimatePresence>
            {isTransitioning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
                >
                    {/* Portal Background */}
                    <motion.div
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: [0, 1.5, 1], rotate: [0, 180, 360] }}
                        exit={{ scale: 0, rotate: 720 }}
                        transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(circle, ${COLORS[toMode]}22 0%, transparent 70%)`
                        }}
                    />

                    {/* Concentric Circles */}
                    {[0, 1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: [0, 1 + i * 0.3],
                                opacity: [0, 0.6, 0],
                                rotate: [0, 360]
                            }}
                            transition={{
                                duration: 1.5,
                                delay: i * 0.1,
                                ease: "easeOut"
                            }}
                            className="absolute rounded-full border-2"
                            style={{
                                borderColor: COLORS[toMode],
                                width: `${200 + i * 100}px`,
                                height: `${200 + i * 100}px`
                            }}
                        />
                    ))}

                    {/* Morphing Symbol */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1], rotate: [- 180, 0], opacity: [0, 1, 1] }}
                        exit={{ scale: 0, rotate: 180, opacity: 0 }}
                        transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
                        className="relative z-10"
                    >
                        {/* From Symbol (fading out) */}
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center text-9xl font-serif"
                            style={{ color: COLORS[fromMode] }}
                        >
                            {SYMBOLS[fromMode]}
                        </motion.div>

                        {/* To Symbol (fading in) */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="flex items-center justify-center text-9xl font-serif"
                            style={{ color: COLORS[toMode] }}
                        >
                            {SYMBOLS[toMode]}
                        </motion.div>
                    </motion.div>

                    {/* Particles */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                            animate={{
                                scale: [0, 1, 0],
                                x: Math.cos((i / 12) * Math.PI * 2) * 300,
                                y: Math.sin((i / 12) * Math.PI * 2) * 300,
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 1.2,
                                delay: i * 0.05,
                                ease: "easeOut"
                            }}
                            className="absolute w-2 h-2 rounded-full"
                            style={{ backgroundColor: COLORS[toMode] }}
                        />
                    ))}

                    {/* Glow effect */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.5, 2] }}
                        transition={{ duration: 1.2 }}
                        className="absolute w-[600px] h-[600px] rounded-full blur-[100px]"
                        style={{ backgroundColor: COLORS[toMode] }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AlchemicalPortal;
