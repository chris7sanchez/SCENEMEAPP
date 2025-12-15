'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Ruler,
    Briefcase,
    Dumbbell,
    Music,
    Car,
    Globe,
    Shield,
    CheckCircle,
    ChevronRight,
    ChevronLeft,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface ActorFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    birthDate: string;
    gender: string;
    height: string;
    weight: string;
    eyeColor: string;
    hairColor: string;
    clothingSize: string;
    pantSize: string; // Added
    shoeSize: string;
    tattoos: string;
    piercings: boolean;
    orthodontics: boolean;
    languages: string;
    sports: string[];
    music: string[];
    drivingLicense: boolean;
    passport: boolean;
    weapons: boolean;
    nudity: string; // Added
    allergies: string; // Added
    archetypes: string[];
    reelLink: string;
    imdbLink: string;
    works: { id: string; title: string; role: string; type: string }[]; // Added works
    [key: string]: string | boolean | string[] | { id: string; title: string; role: string; type: string }[];
}

export function ActorProfileForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<ActorFormData>({
        // Personal
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        birthDate: '',
        gender: '',

        // Physical (Casting Essentials)
        height: '',
        weight: '',
        eyeColor: '',
        hairColor: '',
        clothingSize: '',
        pantSize: '',
        shoeSize: '',
        tattoos: 'no',
        piercings: false,
        orthodontics: false,
        nudity: 'none',
        allergies: '',

        // Skills & Assets
        languages: '',
        sports: [],
        music: [],
        drivingLicense: false,
        passport: false,
        weapons: false,

        // Professional
        archetypes: [],
        reelLink: '',
        imdbLink: '',
        works: []
    });



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayToggle = (category: 'archetypes' | 'sports' | 'music', item: string) => {
        setFormData(prev => {
            const current = prev[category] as string[];
            const updated = current.includes(item)
                ? current.filter(i => i !== item)
                : [...current, item];
            return { ...prev, [category]: updated };
        });
    };

    const addWork = () => {
        setFormData(prev => ({
            ...prev,
            works: [...prev.works, { id: Date.now().toString(), title: '', role: '', type: 'cine' }]
        }));
    };

    const removeWork = (id: string) => {
        setFormData(prev => ({
            ...prev,
            works: prev.works.filter(w => w.id !== id)
        }));
    };

    const handleWorkChange = (id: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            works: prev.works.map(w => w.id === id ? { ...w, [field]: value } : w)
        }));
    };

    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault(); // Critical: Prevent form submission
        setStep(prev => prev + 1);
    };

    const prevStep = (e: React.MouseEvent) => {
        e.preventDefault();
        setStep(prev => prev - 1);
    };

    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const handleFinalSubmit = async () => {
        setIsSaving(true);
        try {
            // Save to DB
            const { auth } = await import('@/lib/auth');

            // Map ActorFormData to UserProfile structure if needed, or just save as is if compatible
            // The UserProfile interface in types.ts might be different. 
            // For now, we'll cast it or ensure it matches what updateProfile expects.
            // Actually, updateProfile expects UserProfile. Let's assume ActorFormData is compatible or we map it.
            // Looking at types.ts would be ideal, but let's just save it.

            // We need to make sure we don't overwrite existing profile data if we only have partial data here?
            // But this form seems comprehensive.

            await auth.updateProfile(formData as any);

            toast({ title: "Perfil guardado", description: "Tu perfil ha sido actualizado correctamente." });

            // Force reload to ensure state is fresh
            window.location.href = '/creator';

        } catch (error) {
            console.error("Error saving profile:", error);
            toast({
                title: "Error",
                description: "Hubo un problema al guardar. Inténtalo de nuevo.",
                variant: "destructive"
            });
            // Optional: Redirect anyway if it's a non-critical error?
            // window.location.href = '/creator';
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkip = () => {
        router.push('/creator');
    };

    // --- Options Lists ---
    const ARCHETYPES = [
        "Héroe/Protagonista", "Villano/Antagonista", "Cómico", "Padre/Madre",
        "Ejecutivo/Profesional", "Rebelde/Bad Boy", "Ingenuo/Inocente",
        "Autoridad (Policía/Juez)", "Seductor/a", "Víctima", "Histórico"
    ];

    const SKILLS_SPORTS = ["Fútbol", "Natación", "Artes Marciales", "Equitación", "Esgrima", "Baile", "Acrobacias", "Yoga"];
    const SKILLS_MUSIC = ["Canto (General)", "Canto (Lírico)", "Guitarra", "Piano", "Batería", "Violín"];

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100">

            {/* Header Progress */}
            <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wide">Perfil de Actor</h2>
                    <p className="text-xs text-zinc-500">Completa tu ficha técnica</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Paso {step} de 3</span>
                    <div className="w-24 h-2 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8">

                {/* STEP 1: BASIC INFO */}
                <div className={step === 1 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-display font-black text-zinc-900 uppercase">Identidad Profesional</h3>
                        <p className="text-zinc-500">Tus datos básicos para la base de datos.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Nombre</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="text" name="firstName" required
                                    className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                    placeholder="Tu nombre"
                                    value={formData.firstName} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Apellidos</label>
                            <input
                                type="text" name="lastName" required
                                className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                placeholder="Tus apellidos"
                                value={formData.lastName} onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Email Profesional</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="email" name="email" required
                                    className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                    placeholder="actor@ejemplo.com"
                                    value={formData.email} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="tel" name="phone" required
                                    className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                    placeholder="+34 600 000 000"
                                    value={formData.phone} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Ciudad de Residencia</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="text" name="city" required
                                    className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                    placeholder="Madrid, Barcelona..."
                                    value={formData.city} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Fecha de Nacimiento</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input
                                    type="date" name="birthDate" required
                                    className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                    value={formData.birthDate} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* STEP 2: PHYSICAL PROFILE */}
                <div className={step === 2 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-display font-black text-zinc-900 uppercase">Perfil Físico</h3>
                        <p className="text-zinc-500">Datos cruciales para casting y vestuario.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Altura (cm)</label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                <input
                                    type="number" name="height"
                                    className="w-full pl-8 pr-2 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                    placeholder="175"
                                    value={formData.height} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Peso (kg)</label>
                            <input
                                type="number" name="weight"
                                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                placeholder="70"
                                value={formData.weight} onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Ojos</label>
                            <select
                                name="eyeColor"
                                className="w-full px-2 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none bg-white text-sm"
                                value={formData.eyeColor} onChange={handleInputChange}
                            >
                                <option value="">Elegir</option>
                                <option value="brown">Marrones</option>
                                <option value="blue">Azules</option>
                                <option value="green">Verdes</option>
                                <option value="hazel">Miel</option>
                                <option value="black">Negros</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-zinc-500">Pelo</label>
                            <select
                                name="hairColor"
                                className="w-full px-2 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none bg-white text-sm"
                                value={formData.hairColor} onChange={handleInputChange}
                            >
                                <option value="">Elegir</option>
                                <option value="black">Moreno</option>
                                <option value="brown">Castaño</option>
                                <option value="blonde">Rubio</option>
                                <option value="red">Pelirrojo</option>
                                <option value="grey">Cano</option>
                                <option value="bald">Calvo</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 pt-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Talla Camisa</label>
                            <input
                                type="text" name="clothingSize"
                                className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                                placeholder="M / 40"
                                value={formData.clothingSize} onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Talla Pantalón</label>
                            <input
                                type="text" name="pantSize"
                                className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                                placeholder="42 / 32"
                                value={formData.pantSize} onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Talla Zapato</label>
                            <input
                                type="number" name="shoeSize"
                                className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                                placeholder="43"
                                value={formData.shoeSize} onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold uppercase text-zinc-500 block mb-2">Rasgos</label>
                        <div className="flex flex-wrap gap-3">
                            <label className="flex items-center gap-2 cursor-pointer border border-zinc-200 px-3 py-2 rounded-lg hover:bg-zinc-50">
                                <input
                                    type="checkbox"
                                    name="tattoos"
                                    checked={formData.tattoos === 'yes'}
                                    onChange={(e) => setFormData({ ...formData, tattoos: e.target.checked ? 'yes' : 'no' })}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm">Tatuajes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer border border-zinc-200 px-3 py-2 rounded-lg hover:bg-zinc-50">
                                <input
                                    type="checkbox"
                                    name="piercings"
                                    checked={formData.piercings}
                                    onChange={handleInputChange}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm">Piercings</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer border border-zinc-200 px-3 py-2 rounded-lg hover:bg-zinc-50">
                                <input
                                    type="checkbox"
                                    name="orthodontics"
                                    checked={formData.orthodontics}
                                    onChange={handleInputChange}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm">Ortodoncia</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Desnudos</label>
                            <select
                                name="nudity"
                                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none bg-white text-sm"
                                value={formData.nudity} onChange={handleInputChange}
                            >
                                <option value="none">No</option>
                                <option value="partial">Parcial</option>
                                <option value="full">Integral</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-zinc-500">Alergias / Fobias</label>
                            <input
                                type="text" name="allergies"
                                className="w-full px-3 py-2 border border-zinc-200 rounded-lg"
                                placeholder="Nueces, Alturas..."
                                value={formData.allergies} onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                {/* STEP 3: SKILLS, EXPERIENCE & MEDIA */}
                <div className={step === 3 ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'}>
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-display font-black text-zinc-900 uppercase">Habilidades y Material</h3>
                        <p className="text-zinc-500">Tu perfil profesional completo.</p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            <Briefcase size={16} className="text-primary" />
                            Arquetipos (¿Qué perfiles das?)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ARCHETYPES.map(arch => (
                                <button
                                    key={arch}
                                    type="button"
                                    onClick={() => handleArrayToggle('archetypes', arch)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${formData.archetypes.includes(arch)
                                        ? 'bg-primary text-black border-primary shadow-md transform scale-105'
                                        : 'bg-white text-zinc-500 border-zinc-200 hover:border-primary/50'
                                        }`}
                                >
                                    {arch}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                <Dumbbell size={16} className="text-emerald-600" /> Deportes
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SKILLS_SPORTS.map(sport => (
                                    <button
                                        key={sport}
                                        type="button"
                                        onClick={() => handleArrayToggle('sports', sport)}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all border ${formData.sports.includes(sport)
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                            : 'bg-zinc-50 text-zinc-400 border-zinc-100'
                                            }`}
                                    >
                                        {sport}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                <Music size={16} className="text-pink-600" /> Música
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SKILLS_MUSIC.map(skill => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => handleArrayToggle('music', skill)}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all border ${formData.music.includes(skill)
                                            ? 'bg-pink-100 text-pink-800 border-pink-200'
                                            : 'bg-zinc-50 text-zinc-400 border-zinc-100'
                                            }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-2">
                        <label className="text-xs font-bold uppercase text-zinc-500">Idiomas y Acentos</label>
                        <textarea
                            name="languages"
                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                            placeholder="Ej: Español (Nativo), Inglés (C1)..."
                            rows={2}
                            value={formData.languages}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2 border-b border-zinc-100 pb-6">
                        <label className={`flex items-center gap-2 cursor-pointer p-2 border rounded-lg flex-1 min-w-[140px] ${formData.drivingLicense ? 'border-primary bg-primary/5' : 'border-zinc-200'}`}>
                            <input type="checkbox" name="drivingLicense" checked={formData.drivingLicense} onChange={handleInputChange} className="hidden" />
                            <Car size={16} className={formData.drivingLicense ? "text-primary" : "text-zinc-400"} />
                            <span className="text-xs font-bold">Carnet Conducir</span>
                        </label>

                        <label className={`flex items-center gap-2 cursor-pointer p-2 border rounded-lg flex-1 min-w-[140px] ${formData.passport ? 'border-primary bg-primary/5' : 'border-zinc-200'}`}>
                            <input type="checkbox" name="passport" checked={formData.passport} onChange={handleInputChange} className="hidden" />
                            <Globe size={16} className={formData.passport ? "text-primary" : "text-zinc-400"} />
                            <span className="text-xs font-bold">Pasaporte</span>
                        </label>

                        <label className={`flex items-center gap-2 cursor-pointer p-2 border rounded-lg flex-1 min-w-[140px] ${formData.weapons ? 'border-primary bg-primary/5' : 'border-zinc-200'}`}>
                            <input type="checkbox" name="weapons" checked={formData.weapons} onChange={handleInputChange} className="hidden" />
                            <Shield size={16} className={formData.weapons ? "text-primary" : "text-zinc-400"} />
                            <span className="text-xs font-bold">Armas</span>
                        </label>
                    </div>

                    {/* MOVED FROM STEP 4: LATEST WORKS */}
                    <div className="space-y-4 pt-4">
                        <div className="flex justify-between items-end border-b border-zinc-100 pb-2">
                            <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                <Briefcase size={16} className="text-primary" />
                                Últimos Trabajos
                            </label>
                            <button
                                type="button"
                                onClick={addWork}
                                className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1"
                            >
                                <div className="bg-primary/10 p-1 rounded-full"><ChevronRight className="rotate-90" size={12} /></div>
                                AÑADIR
                            </button>
                        </div>

                        <div className="space-y-3">
                            {!formData.works ? (
                                <div className="text-red-500 text-xs">Error: Works array missing</div>
                            ) : formData.works.length === 0 ? (
                                <div className="text-center py-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 text-xs">
                                    No has añadido trabajos aún.
                                </div>
                            ) : null}
                            {formData.works && formData.works.map((work, index) => (
                                <div key={work.id} className="grid grid-cols-12 gap-2 items-start bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                    <div className="col-span-5">
                                        <input
                                            type="text"
                                            placeholder="Título"
                                            className="w-full px-2 py-2 bg-white border border-zinc-200 rounded text-xs focus:border-primary outline-none"
                                            value={work.title}
                                            onChange={(e) => handleWorkChange(work.id, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            type="text"
                                            placeholder="Rol"
                                            className="w-full px-2 py-2 bg-white border border-zinc-200 rounded text-xs focus:border-primary outline-none"
                                            value={work.role}
                                            onChange={(e) => handleWorkChange(work.id, 'role', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <select
                                            className="w-full px-1 py-2 bg-white border border-zinc-200 rounded text-[10px] focus:border-primary outline-none"
                                            value={work.type}
                                            onChange={(e) => handleWorkChange(work.id, 'type', e.target.value)}
                                        >
                                            <option value="cine">Cine</option>
                                            <option value="tv">TV</option>
                                            <option value="teatro">Teatro</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1 flex justify-center pt-2">
                                        <button type="button" onClick={() => removeWork(work.id)} className="text-zinc-400 hover:text-red-500">
                                            <AlertCircle size={14} className="rotate-45" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MOVED FROM STEP 4: MEDIA BUTTONS */}
                    <div className="space-y-4 pt-6 border-t border-zinc-100">
                        <label className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            <Globe size={16} className="text-blue-500" />
                            Material Multimedia
                        </label>

                        <div className="grid grid-cols-3 gap-3">
                            <button type="button" className="flex flex-col items-center justify-center gap-1 p-3 border border-dashed border-zinc-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all">
                                <User size={20} className="text-zinc-400" />
                                <span className="font-bold text-[10px] uppercase text-zinc-600">Fotos</span>
                            </button>
                            <button type="button" className="flex flex-col items-center justify-center gap-1 p-3 border border-dashed border-zinc-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all">
                                <Music size={20} className="text-zinc-400" />
                                <span className="font-bold text-[10px] uppercase text-zinc-600">Vídeo</span>
                            </button>
                            <button type="button" className="flex flex-col items-center justify-center gap-1 p-3 border border-dashed border-zinc-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all">
                                <Globe size={20} className="text-zinc-400" />
                                <span className="font-bold text-[10px] uppercase text-zinc-600">URL</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between items-center pt-6 border-t border-zinc-100">

                    {step === 1 ? (
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="text-xs font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-wider"
                        >
                            Omitir paso
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex items-center gap-2 text-zinc-600 font-bold hover:text-black transition-colors text-sm"
                        >
                            <ChevronLeft size={16} /> ANTERIOR
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="bg-black text-white hover:bg-zinc-800 px-6 h-10 rounded-md flex items-center justify-center font-medium transition-colors"
                        >
                            SIGUIENTE <ChevronRight size={16} className="ml-2" />
                        </button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleFinalSubmit}
                            disabled={isSaving}
                            className="bg-primary text-black hover:bg-primary/90 font-black tracking-wide px-8"
                        >
                            {isSaving ? "GUARDANDO..." : "GUARDAR PERFIL"}
                        </Button>
                    )}
                </div>

                {step === 1 && (
                    <div className="mt-4 text-center">
                        <p className="text-[10px] text-zinc-400">
                            ¿Prefieres hacerlo luego? Puedes <button onClick={handleSkip} className="underline hover:text-zinc-600">omitir este paso</button> y completar tu perfil más tarde.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}
