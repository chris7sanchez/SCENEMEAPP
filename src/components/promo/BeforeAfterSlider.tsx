'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

export function BeforeAfterSlider({
    beforeImage,
    afterImage,
    beforeLabel = "Antes",
    afterLabel = "Scene Me",
    className = ""
}: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            setSliderPosition(percentage);
        }
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl cursor-col-resize select-none group border border-white/10 shadow-2xl ${className}`}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onTouchMove={handleTouchMove}
        >
            {/* AFTER Image (Background) */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src={afterImage}
                    alt="After"
                    className="w-full h-full object-cover"
                />
                <span className="absolute top-4 right-4 bg-black/60 text-white text-[10px] font-bold uppercase px-2 py-1 rounded backdrop-blur-sm tracking-widest border border-white/10">
                    {afterLabel}
                </span>
            </div>

            {/* BEFORE Image (Clipped Foreground) */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    src={beforeImage}
                    alt="Before"
                    className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-red-600/80 text-white text-[10px] font-bold uppercase px-2 py-1 rounded backdrop-blur-sm tracking-widest border border-white/10">
                    {beforeLabel}
                </span>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 hover:w-1.5 transition-all"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 text-black shadow-xl scale-90 group-hover:scale-110 transition-transform">
                    <ChevronsLeftRight size={16} />
                </div>
            </div>

            {/* Interactive hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Desliza para comparar
            </div>
        </div>
    );
}
