"use client";
import React, { useState, useId } from 'react';
import { Plus, Minus, Save } from 'lucide-react';
import NatalChart2D from '@/components/antigravity/NatalChart2D';

interface ChartViewerProps {
    date?: string;
    latitude?: number;
    longitude?: number;
    transitsDate?: string;
    knownAscendant?: string;
    knownMoon?: string;
    customPlanets?: Record<string, string | undefined>;
    transparent?: boolean;
    forceAriesZero?: boolean;
    title?: string; // For the filename
}

export default function ChartViewer({
    date,
    latitude = 40.4168,
    longitude = -3.7038,
    transitsDate,
    knownAscendant,
    knownMoon,
    customPlanets,
    transparent,
    forceAriesZero,
    title = "carta_astral"
}: ChartViewerProps) {
    const [chartZoom, setChartZoom] = useState(1);
    const uniqueId = useId().replace(/:/g, ''); // Sanitize ID for querySelector
    const containerId = `chart-container-${uniqueId}`;

    const downloadChartAsImage = () => {
        const svgElement = document.querySelector(`#${containerId} svg`) as SVGSVGElement;
        if (!svgElement) return;

        // Serialize SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Create Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1000; // High res
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            // Draw white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw image
            ctx.drawImage(img, 0, 0, 1000, 1000);

            // Download
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `${title.replace(/\s+/g, '_').toLowerCase()}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    return (
        <div className="relative w-full aspect-square group/chart">
            {/* Zoom Controls */}
            <div className="absolute top-2 right-2 z-30 flex flex-col gap-1">
                <button
                    onClick={() => setChartZoom(prev => Math.min(prev + 0.1, 2.5))}
                    className="w-8 h-8 bg-white border border-black/10 rounded-full flex items-center justify-center text-gray-600 hover:text-[#C55959] hover:border-[#C55959] shadow-lg transition-all"
                    title="Acercar"
                >
                    <Plus size={16} />
                </button>
                <button
                    onClick={() => setChartZoom(prev => Math.max(prev - 0.1, 0.5))}
                    className="w-8 h-8 bg-white border border-black/10 rounded-full flex items-center justify-center text-gray-600 hover:text-[#C55959] hover:border-[#C55959] shadow-lg transition-all"
                    title="Alejar"
                >
                    <Minus size={16} />
                </button>
                <button
                    onClick={() => setChartZoom(1)}
                    className="w-8 h-8 bg-white border border-black/10 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 hover:text-[#C55959] hover:border-[#C55959] shadow-lg transition-all"
                    title="Restablecer"
                >
                    1x
                </button>
                <div className="h-px w-4 bg-gray-300 my-1 mx-auto"></div>
                <button
                    onClick={downloadChartAsImage}
                    className="w-8 h-8 bg-[#1a1a1a] border border-black/10 rounded-full flex items-center justify-center text-white hover:bg-[#C55959] shadow-lg transition-all"
                    title="Guardar Imagen (PNG)"
                >
                    <Save size={14} />
                </button>
            </div>

            {/* The Chart Circle */}
            <div id={containerId} className="w-full h-full relative border-[20px] border-[#F9F8F4] rounded-full shadow-2xl overflow-hidden bg-white">
                <div className="absolute inset-0 border border-black/5 rounded-full pointer-events-none z-20"></div>
                {/* Decorative Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/5 text-9xl z-0 pointer-events-none">✵</div>

                <div
                    className="relative z-10 w-full h-full p-4 transition-transform duration-300 ease-out origin-center"
                    style={{ transform: `scale(${chartZoom})` }}
                >
                    <NatalChart2D
                        date={date}
                        latitude={latitude}
                        longitude={longitude}
                        transitsDate={transitsDate}
                        knownAscendant={knownAscendant}
                        knownMoon={knownMoon}
                        customPlanets={customPlanets}
                        transparent={transparent}
                        forceAriesZero={forceAriesZero}
                    />
                </div>
            </div>
        </div>
    );
}
