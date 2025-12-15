"use client";
import React, { useState } from 'react';
import NatalChart2D from './NatalChart2D';

interface SynastryOverlayProps {
    userDate: string;
    userLat: number;
    userLon: number;
    userName: string;

    otherDate: string;
    otherLat: number;
    otherLon: number;
    otherName: string;
}

export default function SynastryOverlay({
    userDate, userLat, userLon, userName,
    otherDate, otherLat, otherLon, otherName
}: SynastryOverlayProps) {
    const [opacityA, setOpacityA] = useState(0.8);
    const [opacityB, setOpacityB] = useState(0.5);

    return (
        <div className="w-full flex flex-col items-center">
            {/* Controls */}
            <div className="w-full max-w-lg mb-8 bg-[#F9F8F4] p-4 border border-black/10 rounded">
                <div className="flex items-center gap-4 mb-4">
                    <label className="w-24 font-bold text-xs uppercase tracking-widest">{userName}</label>
                    <input
                        type="range"
                        min="0" max="1" step="0.1"
                        value={opacityA}
                        onChange={(e) => setOpacityA(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <label className="w-24 font-bold text-xs uppercase tracking-widest text-[#5B7C99]">{otherName}</label>
                    <input
                        type="range"
                        min="0" max="1" step="0.1"
                        value={opacityB}
                        onChange={(e) => setOpacityB(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5B7C99]"
                    />
                </div>
            </div>

            {/* The Stage - Micro Size */}
            <div className="relative w-20 h-20 rounded-full border border-black/10 shadow-inner overflow-hidden flex-shrink-0 bg-[#F2F0E9] ring-1 ring-[#F2F0E9]/50">

                {/* Center Point Marker for Alignment */}
                <div className="absolute top-1/2 left-1/2 w-px h-px bg-black rounded-full z-50 transform -translate-x-1/2 -translate-y-1/2 opacity-50"></div>

                {/* Layer A (User) */}
                <div className="absolute inset-0 transition-opacity duration-300 transform scale-100 origin-center" style={{ opacity: opacityA, zIndex: 10 }}>
                    <NatalChart2D
                        date={userDate}
                        latitude={userLat}
                        longitude={userLon}
                        transparent={true}
                    />
                </div>

                {/* Layer B (Other) */}
                <div className="absolute inset-0 transition-opacity duration-300 transform scale-100 origin-center" style={{ opacity: opacityB, zIndex: 20 }}>
                    <div className="w-full h-full filter hue-rotate-[160deg] saturate-150"> {/* Differentiate Colors */}
                        <NatalChart2D
                            date={otherDate}
                            latitude={otherLat}
                            longitude={otherLon}
                            transparent={true}
                        />
                    </div>
                </div>

                {/* Grid Overlay (Optional Decor) */}
                <div className="absolute inset-0 pointer-events-none opacity-20 border-4 border-black/5 rounded-full"></div>
            </div>
        </div>
    );
}
