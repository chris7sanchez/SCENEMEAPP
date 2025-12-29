"use client";
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Body, GeoVector, Equator } from 'astronomy-engine';

interface CelestialSphereProps {
    date: string;
    width?: number;
    height?: number;
}

const PLANETS = [
    { name: 'Sol', body: Body.Sun, color: '#FDB813', size: 10, glow: true },
    { name: 'Luna', body: Body.Moon, color: '#F0F0F0', size: 8, glow: true },
    { name: 'Mercurio', body: Body.Mercury, color: '#B7B7B7', size: 4 },
    { name: 'Venus', body: Body.Venus, color: '#E3963E', size: 6 },
    { name: 'Marte', body: Body.Mars, color: '#FF4500', size: 5 },
    { name: 'Júpiter', body: Body.Jupiter, color: '#D2691E', size: 9 },
    { name: 'Saturno', body: Body.Saturn, color: '#DAA520', size: 8 },
    { name: 'Urano', body: Body.Uranus, color: '#40E0D0', size: 6 },
    { name: 'Neptuno', body: Body.Neptune, color: '#4169E1', size: 6 },
    { name: 'Plutón', body: Body.Pluto, color: '#800080', size: 4 },
];

// Simple star catalog (approximate positions for visual flair)
const STARS = Array.from({ length: 300 }).map(() => ({
    ra: Math.random() * 24,
    dec: (Math.random() * 180) - 90,
    brightness: Math.random() * 0.8 + 0.2
}));

export default function CelestialSphere({ date, width = 500, height = 500 }: CelestialSphereProps) {
    const [rotation, setRotation] = useState({ x: 15, y: 0 });
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        setRotation(prev => ({ x: prev.x + dy * 0.5, y: prev.y + dx * 0.5 }));
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    // Touch Events for Mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        isDragging.current = true;
        const touch = e.touches[0];
        lastMouse.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        const touch = e.touches[0];
        const dx = touch.clientX - lastMouse.current.x;
        const dy = touch.clientY - lastMouse.current.y;
        setRotation(prev => ({ x: prev.x + dy * 0.5, y: prev.y + dx * 0.5 }));
        lastMouse.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
    };

    // 3D Math Helpers
    const project = (x: number, y: number, z: number) => {
        // Rotate around X axis
        const radX = (rotation.x * Math.PI) / 180;
        const y1 = y * Math.cos(radX) - z * Math.sin(radX);
        const z1 = y * Math.sin(radX) + z * Math.cos(radX);

        // Rotate around Y axis
        const radY = (rotation.y * Math.PI) / 180;
        const x2 = x * Math.cos(radY) - z1 * Math.sin(radY);
        const z2 = x * Math.sin(radY) + z1 * Math.cos(radY);

        // Perspective projection
        const scale = 250 / (250 - z2); // Simple perspective
        const x2d = x2 * scale + width / 2;
        const y2d = y1 * scale + height / 2;

        return { x: x2d, y: y2d, z: z2, scale };
    };

    const data = useMemo(() => {
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return [];

            const points: any[] = [];
            const r = 180; // Sphere radius

            // 0. Stars (Background)
            STARS.forEach((s, i) => {
                // Convert RA/Dec to Cartesian
                // RA: 0-24h -> 0-360 deg
                const raRad = (s.ra * 15 * Math.PI) / 180;
                const decRad = (s.dec * Math.PI) / 180;

                const x = r * Math.cos(decRad) * Math.cos(raRad);
                const y = r * Math.sin(decRad); // Up
                const z = r * Math.cos(decRad) * Math.sin(raRad);

                points.push({
                    type: 'star',
                    x, y: -y, z, // Flip Y for screen
                    brightness: s.brightness,
                    color: '#FFF'
                });
            });

            // 1. Planets
            PLANETS.forEach(p => {
                const vec = GeoVector(p.body, d, true);
                const mag = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);

                points.push({
                    type: 'planet',
                    name: p.name,
                    color: p.color,
                    size: p.size,
                    glow: p.glow,
                    x: (vec.x / mag) * r,
                    y: -(vec.z / mag) * r,
                    z: (vec.y / mag) * r
                });
            });

            // 2. Celestial Equator Ring
            for (let i = 0; i < 360; i += 5) {
                const rad = (i * Math.PI) / 180;
                points.push({
                    type: 'grid',
                    x: r * Math.cos(rad),
                    y: 0,
                    z: r * Math.sin(rad),
                    color: '#333'
                });
            }

            // 3. Ecliptic Ring (Tilt 23.4 deg)
            const tilt = (23.4 * Math.PI) / 180;
            for (let i = 0; i < 360; i += 3) {
                const rad = (i * Math.PI) / 180;
                let x = r * Math.cos(rad);
                let y = 0;
                let z = r * Math.sin(rad);

                const y_tilt = y * Math.cos(tilt) - z * Math.sin(tilt);
                const z_tilt = y * Math.sin(tilt) + z * Math.cos(tilt);

                points.push({
                    type: 'ecliptic',
                    x: x,
                    y: -z * Math.sin(tilt),
                    z: z * Math.cos(tilt),
                    color: '#C55959'
                });
            }

            return points;
        } catch (e) {
            console.error("CelestialSphere Error:", e);
            return [];
        }
    }, [date]);

    // Render loop
    const renderItems = data.map((item, i) => {
        const p = project(item.x, item.y, item.z);
        return { ...item, ...p, key: i };
    }).sort((a, b) => a.z - b.z); // Z-sort

    // Earth Projection
    const earthProj = project(0, 0, 0);

    return (
        <div
            className="w-full h-full bg-black relative overflow-hidden cursor-move group touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000_100%)]"></div>

            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>

                {/* Central Earth */}
                <g transform={`translate(${earthProj.x}, ${earthProj.y})`}>
                    <circle r={15 * earthProj.scale} fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                    <text y={25 * earthProj.scale} fill="#3b82f6" fontSize="8" textAnchor="middle" opacity="0.7">TIERRA</text>
                </g>

                {renderItems.map((item) => {
                    const opacity = (item.z + 250) / 500; // Depth fade

                    if (item.type === 'planet') {
                        return (
                            <g key={item.key} className="transition-all duration-75">
                                {item.glow && <circle cx={item.x} cy={item.y} r={item.size * item.scale * 2} fill={item.color} opacity={opacity * 0.3} filter="blur(4px)" />}
                                <circle cx={item.x} cy={item.y} r={item.size * item.scale} fill={item.color} opacity={opacity + 0.2} />
                                <text x={item.x} y={item.y - 12} fill={item.color} fontSize="9" fontWeight="bold" textAnchor="middle" opacity={opacity}>{item.name}</text>
                                <line x1={earthProj.x} y1={earthProj.y} x2={item.x} y2={item.y} stroke={item.color} strokeWidth="0.5" opacity={opacity * 0.1} strokeDasharray="2,2" />
                            </g>
                        );
                    }
                    if (item.type === 'star') {
                        return (
                            <circle key={item.key} cx={item.x} cy={item.y} r={Math.max(0.5, item.brightness * item.scale)} fill="white" opacity={opacity * item.brightness} />
                        );
                    }
                    if (item.type === 'grid' || item.type === 'ecliptic') {
                        return (
                            <circle key={item.key} cx={item.x} cy={item.y} r={1 * item.scale} fill={item.color} opacity={opacity * (item.type === 'ecliptic' ? 0.6 : 0.2)} />
                        );
                    }
                    return null;
                })}
            </svg>

            <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
                <div className="inline-block bg-black/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Esfera Celeste (Geocéntrica)</p>
                    <p className="text-[10px] text-gray-600">Arrastra para rotar • <span className="text-[#C55959]">Eclíptica</span> • <span className="text-gray-500">Ecuador</span></p>
                </div>
            </div>
        </div>
    );
}
