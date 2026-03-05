'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const STEPS = [
    {
        id: 1,
        title: "EL ENCUENTRO",
        subtitle: "Descubrimiento",
        videoSrc: "",
        description: "Analizamos tu perfil y encontramos tu factor X."
    },
    {
        id: 2,
        title: "LA PREPARACIÓN",
        subtitle: "Training",
        videoSrc: "",
        description: "Trabajamos las escenas que potencian tu castability."
    },
    {
        id: 3,
        title: "EL RESULTADO",
        subtitle: "Expansión",
        videoSrc: "",
        description: "Material de industria listo para moverte."
    }
];

export function VideoMethodSection() {
    return (
        <section className="w-full py-12 bg-white border-t border-zinc-100">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-10 space-y-2">
                    <span className="bg-zinc-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        El Método Scene Me
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-zinc-900 uppercase tracking-tighter">
                        Tu Éxito en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">3 Pasos</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STEPS.map((step) => (
                        <VideoCard key={step.id} step={step} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function VideoCard({ step }: { step: typeof STEPS[0] }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play().catch(e => console.error("Play failed", e));
            } else {
                videoRef.current.pause();
            }
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.defaultMuted = true;
        }
    }, []);

    return (
        <div className="group relative aspect-[9/16] bg-zinc-100 rounded-2xl overflow-hidden shadow-xl border-4 border-white cursor-pointer" onClick={togglePlay}>
            <video
                ref={videoRef}
                src={step.videoSrc}
                className="w-full h-full object-cover"
                loop
                muted
                autoPlay
                playsInline
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={(e) => console.error("Video load error:", e)}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

            {/* Controls / Status */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={toggleMute}
                    className="bg-black/20 hover:bg-black/50 backdrop-blur-md p-2 rounded-full text-white transition-all"
                >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
            </div>

            {/* Text Content Overlay */}
            <div className={`absolute bottom-0 left-0 w-full p-6 text-white pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-black font-black text-sm">
                        {step.id}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                        {step.subtitle}
                    </span>
                </div>
                <h3 className="text-2xl font-black uppercase leading-none mb-2">
                    {step.title}
                </h3>
                <p className="text-sm text-zinc-300 leading-tight font-medium">
                    {step.description}
                </p>
            </div>

            {/* Play Button Overlay (when paused) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full animate-pulse">
                        <Play size={32} className="text-white fill-white" />
                    </div>
                </div>
            )}
        </div>
    );
}
