import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Ruler,
    Eye,
    Scissors,
    Globe,
    Car,
    Award,
    Camera,
    Upload,
    CheckCircle,
    ChevronRight,
    ChevronLeft,
    Briefcase,
    Mic,
    Music,
    Dumbbell,
    Shield
} from 'lucide-react';

export default function RegistrationPage({ onComplete, onLoginClick }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
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
        hairLength: '',
        ethnicity: '',
        bodyType: '',
        clothingSize: '',
        shoeSize: '',
        tattoos: 'no',
        piercings: false,
        orthodontics: false,

        // Skills & Assets (The "Predictive" Data)
        languages: [],
        accents: [],
        sports: [],
        music: [],
        drivingLicense: false,
        passport: false,
        weapons: false,
        nudity: 'none', // none, partial, full

        // Medical / Limits
        allergies: '',
        phobias: '',

        // Professional Profile
        actingAgeMin: '',
        actingAgeMax: '',
        experienceLevel: '',
        archetypes: [], // e.g., "Villain", "Hero", "Corporate", "Parent"
        unionStatus: '',

        // Links
        imdbLink: '',
        reelLink: '',
        instagramLink: ''
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayToggle = (category, item) => {
        setFormData(prev => {
            const current = prev[category] || [];
            const updated = current.includes(item)
                ? current.filter(i => i !== item)
                : [...current, item];
            return { ...prev, [category]: updated };
        });
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we would send data to Firebase
        console.log("Form Data Submitted:", formData);
        onComplete();
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
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Camera className="text-white" size={20} />
                        </div>
                        <span className="font-bold text-xl text-slate-900">ActoPro <span className="text-indigo-600">Talent ID</span></span>
                    </div>
                    <div className="text-sm text-slate-500">
                        Paso {step} de 4
                    </div>
                </div>
            </header>

            <main className="flex-1 py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

                        {/* Progress Bar */}
                        <div className="h-2 bg-slate-100 w-full">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                                style={{ width: `${(step / 4) * 100}%` }}
                            ></div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">

                            {/* STEP 1: BASIC INFO */}
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-slate-900">Comencemos con lo básico</h2>
                                        <p className="text-slate-500">Tu identidad profesional empieza aquí.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Nombre</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text" name="firstName" required
                                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="Tu nombre"
                                                    value={formData.firstName} onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Apellidos</label>
                                            <input
                                                type="text" name="lastName" required
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="Tus apellidos"
                                                value={formData.lastName} onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Email Profesional</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="email" name="email" required
                                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="actor@ejemplo.com"
                                                    value={formData.email} onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Teléfono</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="tel" name="phone" required
                                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="+34 600 000 000"
                                                    value={formData.phone} onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Ciudad de Residencia</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text" name="city" required
                                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="Madrid, Barcelona..."
                                                    value={formData.city} onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Fecha de Nacimiento</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="date" name="birthDate" required
                                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={formData.birthDate} onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: PHYSICAL PROFILE */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-slate-900">Perfil Físico</h2>
                                        <p className="text-slate-500">Datos cruciales para pre-selección de vestuario y casting.</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">Altura (cm)</label>
                                            <div className="relative">
                                                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="number" name="height"
                                                    className="w-full pl-9 pr-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="175"
                                                    value={formData.height} onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">Peso (kg)</label>
                                            <input
                                                type="number" name="weight"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="70"
                                                value={formData.weight} onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">Ojos</label>
                                            <select
                                                name="eyeColor"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                                value={formData.eyeColor} onChange={handleInputChange}
                                            >
                                                <option value="">Seleccionar</option>
                                                <option value="brown">Marrones</option>
                                                <option value="blue">Azules</option>
                                                <option value="green">Verdes</option>
                                                <option value="hazel">Miel</option>
                                                <option value="black">Negros</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">Cabello</label>
                                            <select
                                                name="hairColor"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                                value={formData.hairColor} onChange={handleInputChange}
                                            >
                                                <option value="">Seleccionar</option>
                                                <option value="black">Moreno</option>
                                                <option value="brown">Castaño</option>
                                                <option value="blonde">Rubio</option>
                                                <option value="red">Pelirrojo</option>
                                                <option value="grey">Cano</option>
                                                <option value="white">Blanco</option>
                                                <option value="bald">Calvo</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Talla Camisa/Chaqueta</label>
                                            <input
                                                type="text" name="clothingSize"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                placeholder="M / 40"
                                                value={formData.clothingSize} onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Talla Pantalón</label>
                                            <input
                                                type="text" name="pantSize"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                placeholder="42 / 32"
                                                value={formData.pantSize} onChange={handleInputChange} // Note: need to add to state if not there
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Talla Zapato</label>
                                            <input
                                                type="number" name="shoeSize"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                placeholder="43"
                                                value={formData.shoeSize} onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <label className="text-sm font-medium text-slate-700 block mb-2">Rasgos y Preferencias</label>
                                        <div className="flex flex-wrap gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50">
                                                <input
                                                    type="checkbox"
                                                    name="tattoos"
                                                    checked={formData.tattoos === 'yes'}
                                                    onChange={(e) => setFormData({ ...formData, tattoos: e.target.checked ? 'yes' : 'no' })}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm">Tatuajes visibles</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50">
                                                <input
                                                    type="checkbox"
                                                    name="piercings"
                                                    checked={formData.piercings}
                                                    onChange={handleInputChange}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm">Piercings</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50">
                                                <input
                                                    type="checkbox"
                                                    name="orthodontics"
                                                    checked={formData.orthodontics}
                                                    onChange={handleInputChange}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm">Ortodoncia</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Disponibilidad para Desnudos</label>
                                            <p className="text-xs text-slate-400 mb-2">Información privada solo para casting.</p>
                                            <select
                                                name="nudity"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                                value={formData.nudity} onChange={handleInputChange}
                                            >
                                                <option value="none">No</option>
                                                <option value="partial">Parcial (Topless/Trasero)</option>
                                                <option value="full">Integral</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Alergias / Fobias</label>
                                            <p className="text-xs text-slate-400 mb-2">Importante para catering y escenas de riesgo.</p>
                                            <input
                                                type="text" name="allergies"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                                                placeholder="Ej: Nueces, Alturas, Arañas..."
                                                value={formData.allergies} onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: SKILLS & ARCHETYPES (THE BRAIN) */}
                            {step === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-slate-900">Tu Valor Único</h2>
                                        <p className="text-slate-500">Ayúdanos a encontrarte el papel perfecto sin casting previo.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <Briefcase size={18} className="text-indigo-600" />
                                            ¿Qué perfiles sueles interpretar? (Arquetipos)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {ARCHETYPES.map(arch => (
                                                <button
                                                    key={arch}
                                                    type="button"
                                                    onClick={() => handleArrayToggle('archetypes', arch)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${formData.archetypes.includes(arch)
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                                        }`}
                                                >
                                                    {arch}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <Dumbbell size={18} className="text-emerald-600" /> Habilidades Deportivas
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {SKILLS_SPORTS.map(sport => (
                                                    <button
                                                        key={sport}
                                                        type="button"
                                                        onClick={() => handleArrayToggle('sports', sport)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${formData.sports.includes(sport)
                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                            : 'bg-slate-50 text-slate-500 border-slate-100'
                                                            }`}
                                                    >
                                                        {sport}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <Music size={18} className="text-pink-600" /> Música y Baile
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {SKILLS_MUSIC.map(skill => (
                                                    <button
                                                        key={skill}
                                                        type="button"
                                                        onClick={() => handleArrayToggle('music', skill)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${formData.music.includes(skill)
                                                            ? 'bg-pink-100 text-pink-800 border-pink-200'
                                                            : 'bg-slate-50 text-slate-500 border-slate-100'
                                                            }`}
                                                    >
                                                        {skill}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 space-y-4">
                                        <label className="text-sm font-bold text-slate-900">Idiomas y Acentos</label>
                                        <textarea
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            placeholder="Ej: Español (Nativo), Inglés (C1 - Acento Británico), Francés (Básico)..."
                                            rows="2"
                                        ></textarea>
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-4">
                                        <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex-1 min-w-[200px]">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.drivingLicense ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                {formData.drivingLicense && <CheckCircle size={14} className="text-white" />}
                                            </div>
                                            <input type="checkbox" name="drivingLicense" checked={formData.drivingLicense} onChange={handleInputChange} className="hidden" />
                                            <div className="flex items-center gap-2">
                                                <Car size={18} className="text-slate-500" />
                                                <span className="text-sm font-medium">Carnet de Conducir</span>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex-1 min-w-[200px]">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.passport ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                {formData.passport && <CheckCircle size={14} className="text-white" />}
                                            </div>
                                            <input type="checkbox" name="passport" checked={formData.passport} onChange={handleInputChange} className="hidden" />
                                            <div className="flex items-center gap-2">
                                                <Globe size={18} className="text-slate-500" />
                                                <span className="text-sm font-medium">Pasaporte en regla</span>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex-1 min-w-[200px]">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.weapons ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                {formData.weapons && <CheckCircle size={14} className="text-white" />}
                                            </div>
                                            <input type="checkbox" name="weapons" checked={formData.weapons} onChange={handleInputChange} className="hidden" />
                                            <div className="flex items-center gap-2">
                                                <Shield size={18} className="text-slate-500" />
                                                <span className="text-sm font-medium">Manejo de Armas</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: MEDIA & LINKS */}
                            {step === 4 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-slate-900">Tu Material</h2>
                                        <p className="text-slate-500">Muestra lo que sabes hacer.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer group">
                                            <div className="bg-slate-100 p-4 rounded-full mb-4 group-hover:bg-white transition-colors">
                                                <Upload className="text-slate-400 group-hover:text-indigo-600" size={24} />
                                            </div>
                                            <h3 className="font-bold text-slate-700">Headshot Principal</h3>
                                            <p className="text-xs text-slate-400 mt-1">JPG o PNG, max 5MB</p>
                                        </div>

                                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer group">
                                            <div className="bg-slate-100 p-4 rounded-full mb-4 group-hover:bg-white transition-colors">
                                                <Upload className="text-slate-400 group-hover:text-indigo-600" size={24} />
                                            </div>
                                            <h3 className="font-bold text-slate-700">Foto Cuerpo Entero</h3>
                                            <p className="text-xs text-slate-400 mt-1">JPG o PNG, max 5MB</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Link a Videobook / Reel (YouTube/Vimeo)</label>
                                            <input
                                                type="url" name="reelLink"
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="https://..."
                                                value={formData.reelLink} onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Link a IMDb / Instagram Profesional</label>
                                            <input
                                                type="url" name="imdbLink"
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="https://..."
                                                value={formData.imdbLink} onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="mt-10 flex justify-between pt-6 border-t border-slate-100">
                                {step > 1 ? (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex items-center gap-2 px-6 py-3 text-slate-600 font-medium hover:text-slate-900 transition-colors"
                                    >
                                        <ChevronLeft size={20} /> Anterior
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={onLoginClick}
                                        className="flex items-center gap-2 px-6 py-3 text-slate-400 font-medium hover:text-slate-600 transition-colors"
                                    >
                                        Ya tengo cuenta
                                    </button>
                                )}

                                {step < 4 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                    >
                                        Siguiente <ChevronRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                                    >
                                        Completar Registro <CheckCircle size={20} />
                                    </button>
                                )}
                            </div>

                        </form>
                    </div>

                    <p className="text-center text-slate-400 text-sm mt-8">
                        © 2024 ActoPro. Tus datos están protegidos y solo son visibles para directores de casting verificados.
                    </p>
                </div>
            </main>
        </div>
    );
}
