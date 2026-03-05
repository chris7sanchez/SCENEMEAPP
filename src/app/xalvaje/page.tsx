'use client';

import React, { useEffect, useState, useRef } from 'react';
import './xalvaje.css';

export default function XalvajeIntro() {
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dustParticles, setDustParticles] = useState<{ id: number, left: string, top: string, delay: string, duration: string, size: string, blur: string, drift: number }[]>([]);

    useEffect(() => {
        setMounted(true);

        // Generate more realistic dust particles
        const particles = Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: `${Math.random() * 10}s`,
            duration: `${15 + Math.random() * 20}s`,
            size: `${0.5 + Math.random() * 3}px`,
            blur: Math.random() > 0.7 ? `${1 + Math.random() * 3}px` : '0px',
            drift: (Math.random() - 0.5) * 300 // Unitless number
        }));
        setDustParticles(particles);

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            containerRef.current.style.setProperty('--mouse-x', `${x}%`);
            containerRef.current.style.setProperty('--mouse-y', `${y}%`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (!mounted) return null;

    return (
        <div className="xalvaje-container" ref={containerRef}>
            {/* Cinematic Background - The one being discovered */}
            <img
                src="/xalvaje-ref.jpg"
                alt="Xalvaje Reference"
                className="background-image-reveal"
            />

            <div className="film-grain"></div>
            <div className="vignette"></div>
            <div className="dirt-overlay"></div>
            <div className="smoke-layer"></div>

            {/* Dust particles only visible in light */}
            <div className="dust-container">
                {dustParticles.map(p => (
                    <div
                        key={p.id}
                        className="dust"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            filter: `blur(${p.blur})`,
                            '--drift-x': p.drift,
                            animationDelay: p.delay,
                            animationDuration: p.duration
                        } as any}
                    />
                ))}
            </div>

            <div className="content">
                <div className="logo-wrapper">
                    <div className="x-structural">
                        <div className="x-messages">
                            <span className="msg msg-1">CREATIVIDAD</span>
                            <span className="msg msg-2">PODER</span>
                            <span className="msg msg-3">MISTERIO</span>
                            <span className="msg msg-4">XALVAJE</span>
                        </div>
                        <div className="flashlight-glow"></div>
                    </div>
                </div>
                <p className="tagline">
                    Dando luz a las sombras
                </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-10 left-10 text-[10px] tracking-[0.5rem] opacity-30 uppercase">
                Production No. 001 // XALVAJE STUDIOS
            </div>

            <div className="absolute top-10 right-10 flex items-center gap-4 opacity-50">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-[10px] tracking-widest uppercase">Recording</span>
            </div>
        </div>
    );
}
