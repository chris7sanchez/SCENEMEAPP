import React from 'react';

interface ElementalDiagramProps {
    fire: number;
    earth: number;
    air: number;
    water: number;
    size?: number;
}

export default function ElementalDiagram({ fire, earth, air, water, size = 200 }: ElementalDiagramProps) {
    const total = fire + earth + air + water || 100;
    // Normalize to 0-1 range for plotting, then scale to radius
    const radius = size / 2;
    const center = size / 2;

    // Scale factor: Let's say 50% reaches the edge.
    const scale = (val: number) => Math.min((val / total) * 3 * radius, radius);

    // Coordinates
    // Fire (Top)
    const fireY = center - scale(fire);
    // Air (Right)
    const airX = center + scale(air);
    // Water (Bottom)
    const waterY = center + scale(water);
    // Earth (Left)
    const earthX = center - scale(earth);

    // Path for the dynamic element shape
    const pathData = `
        M ${center} ${fireY}
        L ${airX} ${center}
        L ${center} ${waterY}
        L ${earthX} ${center}
        Z
    `;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Background Guide (Perfect Square/Rhombus) */}
                <path d={`M ${center} 0 L ${size} ${center} L ${center} ${size} L 0 ${center} Z`} fill="none" stroke="#ddd" strokeDasharray="4 4" />

                {/* Axes */}
                <line x1={center} y1={0} x2={center} y2={size} stroke="#eee" />
                <line x1={0} y1={center} x2={size} y2={center} stroke="#eee" />

                {/* The Elemental Shape */}
                <path d={pathData} fill="rgba(255, 215, 0, 0.1)" stroke="black" strokeWidth="2" className="drop-shadow-lg transition-all duration-1000 ease-in-out">

                </path>

                {/* Vertices Markers with Ions */}
                <g className="transition-all duration-1000" style={{ transformBox: 'fill-box' }}>
                    {/* Fire */}
                    <circle cx={center} cy={fireY} r="4" fill="#ef4444" />
                    <text x={center} y={fireY - 10} textAnchor="middle" className="text-[10px] uppercase font-bold fill-red-500">Fuego</text>

                    {/* Air */}
                    <circle cx={airX} cy={center} r="4" fill="#eab308" />
                    <text x={airX + 10} y={center} textAnchor="start" className="text-[10px] uppercase font-bold fill-yellow-600">Aire</text>

                    {/* Water */}
                    <circle cx={center} cy={waterY} r="4" fill="#3b82f6" />
                    <text x={center} y={waterY + 15} textAnchor="middle" className="text-[10px] uppercase font-bold fill-blue-500">Agua</text>

                    {/* Earth */}
                    <circle cx={earthX} cy={center} r="4" fill="#22c55e" />
                    <text x={earthX - 10} y={center} textAnchor="end" className="text-[10px] uppercase font-bold fill-green-600">Tierra</text>
                </g>
            </svg>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-4 text-[10px] uppercase tracking-widest text-gray-500">
                <div className="text-center"><span className="text-red-500 font-bold">{Math.round((fire / total) * 100)}%</span> Fuego</div>
                <div className="text-center"><span className="text-yellow-600 font-bold">{Math.round((air / total) * 100)}%</span> Aire</div>
                <div className="text-center"><span className="text-blue-500 font-bold">{Math.round((water / total) * 100)}%</span> Agua</div>
                <div className="text-center"><span className="text-green-600 font-bold">{Math.round((earth / total) * 100)}%</span> Tierra</div>
            </div>
        </div>
    );
}
