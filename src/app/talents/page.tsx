'use client';

import React, { useState } from 'react';
import { Search, MapPin, Star, Filter, Clapperboard, Info, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// --- MOCK DATA CON MÁS DETALLES ---
const TALENTS = [
    {
        id: 1,
        name: "Elena R.",
        role: "Actriz & Modelo",
        location: "Madrid",
        age: 24,
        gender: "Femenino",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60",
        tags: ["Cine", "Publicidad", "Drama"],
        rating: 4.9,
        isSceneMePartner: true // <--- LA CLAVE
    },
    {
        id: 2,
        name: "Marc V.",
        role: "Actor de Método",
        location: "Barcelona",
        age: 30,
        gender: "Masculino",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=60",
        tags: ["Teatro", "Voz", "Acción"],
        rating: 5.0,
        isSceneMePartner: false
    },
    {
        id: 3,
        name: "Sarah J.",
        role: "Actriz Versátil",
        location: "Valencia",
        age: 28,
        gender: "Femenino",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60",
        tags: ["Comedia", "TV", "Musical"],
        rating: 4.8,
        isSceneMePartner: true
    },
    {
        id: 4,
        name: "David L.",
        role: "Especialista",
        location: "Madrid",
        age: 35,
        gender: "Masculino",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60",
        tags: ["Acción", "Stunt", "Cine"],
        rating: 4.7,
        isSceneMePartner: true
    },
    {
        id: 5,
        name: "Ana M.",
        role: "Actriz de Doblaje",
        location: "Sevilla",
        age: 45,
        gender: "Femenino",
        image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=60",
        tags: ["Voz", "Radio", "Narración"],
        rating: 4.9,
        isSceneMePartner: false
    },
    {
        id: 6,
        name: "Javier P.",
        role: "Actor Característico",
        location: "Bilbao",
        age: 52,
        gender: "Masculino",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60",
        tags: ["Cine", "Indie", "Drama"],
        rating: 4.6,
        isSceneMePartner: true
    }
];

export default function TalentsPage() {
    // Estados para filtros y envío
    const [filterPartner, setFilterPartner] = useState(false);
    const [ageRange, setAgeRange] = useState([18, 60]);
    const [searchQuery, setSearchQuery] = useState("");

    // Estados para el formulario de contacto
    const [selectedTalent, setSelectedTalent] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sentSuccess, setSentSuccess] = useState(false);

    // Lógica de filtrado
    const filteredTalents = TALENTS.filter(talent => {
        const matchesPartner = filterPartner ? talent.isSceneMePartner : true;
        const matchesAge = talent.age >= ageRange[0] && talent.age <= ageRange[1];
        const matchesSearch = talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            talent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesPartner && matchesAge && matchesSearch;
    });

    const handleSendRequest = async () => {
        if (!message.trim() || !selectedTalent) return;

        setIsSending(true);
        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'collab_request',
                    to: 'christian@sceneme.com', // TODO: Replace with admin email or talent email
                    data: {
                        requesterName: 'Usuario Scene Me', // TODO: Get from auth context
                        requesterEmail: 'user@example.com',
                        targetName: selectedTalent.name,
                        message: message
                    }
                })
            });
            setSentSuccess(true);
            setTimeout(() => {
                setSentSuccess(false);
                setMessage("");
                setSelectedTalent(null); // Close dialog logic would need to be handled by controlling the open state
            }, 2000);
        } catch (error) {
            console.error("Error sending request:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-slate-50">
                {/* HERO SECTION */}
                <div className="bg-blue-600 text-white py-16 px-6 relative overflow-hidden">
                    {/* Back Button */}
                    <div className="absolute top-6 left-6 z-50">
                        <a
                            href="/creator"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all hover:border-white/50 group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al Dashboard
                        </a>
                    </div>

                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="max-w-7xl mx-auto relative z-10 text-center">
                        <div className="mb-6">
                            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-wider leading-none text-yellow-400 whitespace-nowrap">
                                SCENE ME
                            </h1>
                            <p className="text-xl md:text-3xl font-black uppercase tracking-[0.4em] text-yellow-400/90 mt-0">
                                PARTNER
                            </p>
                        </div>
                        <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium">
                            Encuentra al partner ideal para tu escena o colabora en proyectos de otros.
                        </p>

                        {/* SEARCH BAR */}
                        <div className="max-w-3xl mx-auto bg-white p-2 rounded-full shadow-2xl flex items-center">
                            <div className="pl-4 text-slate-400">
                                <Search size={24} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, habilidad, ciudad..."
                                className="flex-1 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none bg-transparent text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg font-bold">
                                BUSCAR
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">

                    {/* SIDEBAR FILTERS */}
                    <aside className="w-full lg:w-64 space-y-8 h-fit sticky top-24">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <Filter size={20} className="text-blue-600" />
                                <h3 className="font-bold text-slate-900">Filtros</h3>
                            </div>

                            {/* SCENE ME PARTNER TOGGLE */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="partner-mode"
                                        checked={filterPartner}
                                        onCheckedChange={(c) => setFilterPartner(c as boolean)}
                                        className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label
                                            htmlFor="partner-mode"
                                            className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-blue-900"
                                        >
                                            Solo <span className="text-yellow-600 font-black">PARTNERS</span> Scene Me
                                        </Label>
                                        <p className="text-xs text-slate-500">
                                            Actores disponibles para colaborar a cambio de material.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* AGE SLIDER */}
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between">
                                    <Label className="text-sm font-bold">Edad</Label>
                                    <span className="text-xs text-slate-500">{ageRange[0]} - {ageRange[1]} años</span>
                                </div>
                                <Slider
                                    defaultValue={[18, 60]}
                                    max={80}
                                    min={16}
                                    step={1}
                                    value={ageRange}
                                    onValueChange={setAgeRange}
                                    className="py-4"
                                />
                            </div>

                            {/* GENDER */}
                            <div className="space-y-3">
                                <Label className="text-sm font-bold">Género</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Todos', 'Femenino', 'Masculino', 'No Binario'].map(g => (
                                        <button key={g} className="px-3 py-1 text-xs border rounded-full hover:bg-slate-50 transition-colors">
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* INFO BOX */}
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-2 mb-2 text-blue-900 font-bold text-sm">
                                <Info size={16} />
                                ¿Qué es Scene Me <span className="text-yellow-600 font-black">PARTNER</span>?
                            </div>
                            <p className="text-xs text-blue-600/80 leading-relaxed">
                                Es nuestro programa de colaboración. Los actores con la insignia <Clapperboard className="inline w-3 h-3" /> aceptan rodar contigo gratis a cambio de recibir el material editado para su videobook.
                            </p>
                        </div>
                    </aside>

                    {/* RESULTS GRID */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                {filteredTalents.length} Talentos encontrados
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredTalents.map((talent) => (
                                <div key={talent.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 flex flex-col relative">

                                    {/* SCENE ME BADGE */}
                                    {talent.isSceneMePartner && (
                                        <div className="absolute top-2 left-2 z-20">
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge className="bg-blue-600/90 hover:bg-blue-700 text-white border-none shadow-sm flex items-center gap-1 px-1.5 py-0.5 text-[10px]">
                                                        <Clapperboard size={10} className="fill-current" />
                                                        PARTNER
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[200px] bg-slate-900 text-white border-none">
                                                    <p>Este actor colabora en tu escena a cambio del material.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    )}

                                    {/* Image Container */}
                                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-200">
                                        <img
                                            src={talent.image}
                                            alt={talent.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm z-20">
                                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-[10px] font-bold text-slate-900">{talent.rating}</span>
                                        </div>

                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                                        <div className="absolute bottom-3 left-3 text-white">
                                            <h3 className="text-lg font-bold leading-tight">{talent.name}</h3>
                                            <p className="text-blue-200 text-[10px] font-medium truncate">{talent.role}</p>
                                            <p className="text-white/60 text-[10px] mt-0.5">{talent.age} años • {talent.location}</p>
                                        </div>
                                    </div>

                                    {/* Info & Actions */}
                                    <div className="p-3 flex-1 flex flex-col justify-between gap-3">
                                        <div className="flex flex-wrap gap-1">
                                            {talent.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="px-1.5 py-0.5 bg-slate-50 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded border border-slate-100">
                                                    {tag}
                                                </span>
                                            ))}
                                            {talent.tags.length > 2 && (
                                                <span className="px-1.5 py-0.5 text-slate-400 text-[9px] font-bold">+ {talent.tags.length - 2}</span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 mt-auto">
                                            {talent.isSceneMePartner ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] h-8 shadow-blue-200 shadow-sm"
                                                            onClick={() => setSelectedTalent(talent)}
                                                        >
                                                            SOLICITAR
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                        <DialogHeader>
                                                            <DialogTitle>Solicitar Colaboración</DialogTitle>
                                                            <DialogDescription>
                                                                Envía una solicitud a <strong>{talent.name}</strong> para tu próxima escena.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        {!sentSuccess ? (
                                                            <div className="grid gap-4 py-4">
                                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                                                                    <p className="font-bold mb-1">Cómo funciona:</p>
                                                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                                                        <li>Scene Me notificará al actor.</li>
                                                                        <li>Si acepta, os pondremos en contacto.</li>
                                                                        <li>El rodaje se gestiona a través de Scene Me.</li>
                                                                    </ul>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="message">Mensaje para {talent.name}</Label>
                                                                    <textarea
                                                                        id="message"
                                                                        className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        placeholder="Hola, tengo un guion de drama y busco un perfil como el tuyo para rodar en Madrid..."
                                                                        value={message}
                                                                        onChange={(e) => setMessage(e.target.value)}
                                                                    ></textarea>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="py-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                                                    <Check className="text-green-600 w-6 h-6" />
                                                                </div>
                                                                <h3 className="text-lg font-bold text-green-800">¡Solicitud Enviada!</h3>
                                                                <p className="text-sm text-slate-500 mt-2">Te avisaremos cuando {talent.name} responda.</p>
                                                            </div>
                                                        )}

                                                        <DialogFooter>
                                                            {!sentSuccess && (
                                                                <Button
                                                                    type="submit"
                                                                    className="bg-blue-600 text-white w-full"
                                                                    onClick={handleSendRequest}
                                                                    disabled={isSending || !message.trim()}
                                                                >
                                                                    {isSending ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
                                                                </Button>
                                                            )}
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <Button disabled className="w-full bg-slate-100 text-slate-400 font-bold text-[10px] h-8">
                                                    NO DISPONIBLE
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
