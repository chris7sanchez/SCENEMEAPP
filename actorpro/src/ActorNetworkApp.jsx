import React, { useState } from 'react';
import {
    Calendar,
    Users,
    MessageSquare,
    Shield,
    Lock,
    LogOut,
    Plus,
    Search,
    MapPin,
    Phone,
    Mail,
    Clapperboard,
    Bell
} from 'lucide-react';

// --- Mock Data ---
const MOCK_USERS = [
    {
        id: 1,
        name: 'Ana García',
        role: 'actor',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        contact: { phone: '+34 600 000 001', email: 'ana@example.com' },
        location: 'Madrid',
        bio: 'Actriz con experiencia en teatro clásico y doblaje.'
    },
    {
        id: 2,
        name: 'Carlos Ruiz',
        role: 'actor',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        contact: { phone: '+34 600 000 002', email: 'carlos@example.com' },
        location: 'Barcelona',
        bio: 'Especialista en cine de acción y modelaje.'
    },
    {
        id: 3,
        name: 'Elena Web',
        role: 'actor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
        contact: { phone: '+34 600 000 003', email: 'elena@example.com' },
        location: 'Valencia',
        bio: 'Bailarina y actriz de musicales.'
    },
    {
        id: 99,
        name: 'Admin Producción',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        contact: { phone: 'N/A', email: 'admin@actopro.com' },
        location: 'Oficina Central',
        bio: 'Gestión de casting y producción.'
    },
];

const MOCK_AGENDA = [
    { id: 1, title: 'Casting: Serie "El Misterio"', date: '2023-12-10', time: '10:00', type: 'casting', description: 'Audiciones para personajes secundarios. Preparar monólogo dramático.' },
    { id: 2, title: 'Rodaje: Escena 4', date: '2023-12-12', time: '08:00', type: 'rodaje', description: 'Localización exterior. Traer ropa de abrigo. Catering incluido.' },
    { id: 3, title: 'Taller de Improvisación', date: '2023-12-15', time: '16:00', type: 'taller', description: 'Abierto a todos los miembros. Impartido por Juan Pérez.' },
];

export default function ActorNetworkApp() {
    const [currentUser, setCurrentUser] = useState(MOCK_USERS[3]); // Default to Admin
    const [view, setView] = useState('dashboard'); // dashboard, agenda, network
    const [users] = useState(MOCK_USERS);
    const [agenda, setAgenda] = useState(MOCK_AGENDA);
    const [showContactModal, setShowContactModal] = useState(null);
    const [showChatModal, setShowChatModal] = useState(null);

    // --- Helpers ---
    const isAdmin = currentUser.role === 'admin';

    const handleContactClick = (user) => {
        if (isAdmin) {
            setShowContactModal(user);
        } else {
            setShowChatModal(user);
        }
    };

    const toggleUserRole = () => {
        // Toggle between Admin (id 99) and Actor (id 1) for demo purposes
        if (currentUser.id === 99) {
            setCurrentUser(MOCK_USERS[0]);
        } else {
            setCurrentUser(MOCK_USERS[3]);
        }
    };

    // --- Components ---

    const Sidebar = () => (
        <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-10">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="bg-indigo-500 p-2 rounded-lg">
                    <Clapperboard size={24} className="text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">ActoPro</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <button
                    onClick={() => setView('dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <div className="p-1"><Calendar size={18} /></div>
                    <span className="font-medium">Panel Principal</span>
                </button>
                <button
                    onClick={() => setView('agenda')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'agenda' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <div className="p-1"><Calendar size={18} /></div>
                    <span className="font-medium">Agenda & Casting</span>
                </button>
                <button
                    onClick={() => setView('network')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'network' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <div className="p-1"><Users size={18} /></div>
                    <span className="font-medium">Red de Talentos</span>
                </button>
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <img src={currentUser.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-indigo-500" />
                        <div>
                            <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                            <p className="text-xs text-indigo-400 uppercase font-bold">{currentUser.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleUserRole}
                        className="w-full text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={12} /> Cambiar Rol (Demo)
                    </button>
                </div>
            </div>
        </div>
    );

    const DashboardView = () => (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Bienvenido, {currentUser.name.split(' ')[0]}</h2>
                    <p className="text-slate-500 mt-1">Aquí tienes el resumen de hoy.</p>
                </div>
                <div className="flex gap-4">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
                        <Bell size={24} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-700">Próximos Eventos</h3>
                        <Calendar className="text-indigo-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{agenda.length}</p>
                    <p className="text-sm text-slate-500 mt-1">Eventos programados esta semana</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-700">Nuevos Talentos</h3>
                        <Users className="text-emerald-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{users.length - 1}</p>
                    <p className="text-sm text-slate-500 mt-1">Actores registrados en la red</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-700">Mensajes</h3>
                        <MessageSquare className="text-orange-500" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">3</p>
                    <p className="text-sm text-slate-500 mt-1">Mensajes no leídos</p>
                </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">¿Tienes un nuevo proyecto?</h3>
                    <p className="text-indigo-100 mb-6 max-w-lg">Gestiona tus castings y rodajes de manera eficiente. Publica nuevos eventos en la agenda para notificar a todos los talentos.</p>
                    {isAdmin && (
                        <button onClick={() => setView('agenda')} className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
                            Gestionar Agenda
                        </button>
                    )}
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                    <Clapperboard size={200} />
                </div>
            </div>
        </div>
    );

    const AgendaView = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Agenda de Producción</h2>
                {isAdmin && (
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                        <Plus size={18} /> Nuevo Evento
                    </button>
                )}
            </div>

            <div className="grid gap-4">
                {agenda.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg w-20 h-20">
                            <span className="text-xs font-bold uppercase">{new Date(item.date).toLocaleString('es-ES', { month: 'short' })}</span>
                            <span className="text-2xl font-bold">{new Date(item.date).getDate()}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 uppercase tracking-wide
                    ${item.type === 'casting' ? 'bg-pink-100 text-pink-700' :
                                            item.type === 'rodaje' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {item.type}
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                                </div>
                                <span className="text-slate-400 text-sm flex items-center gap-1">
                                    <ClockIcon /> {item.time}
                                </span>
                            </div>
                            <p className="text-slate-600 mt-2">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const NetworkView = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">Red de Talentos</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar actores..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.filter(u => u.role !== 'admin').map((user) => (
                    <div key={user.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                        <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-700 relative">
                            <div className="absolute -bottom-10 left-6">
                                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover" />
                            </div>
                        </div>
                        <div className="pt-12 p-6">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                                    <p className="text-indigo-600 text-sm font-medium flex items-center gap-1">
                                        <MapPin size={14} /> {user.location}
                                    </p>
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2">{user.bio}</p>

                            <button
                                onClick={() => handleContactClick(user)}
                                className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors
                  ${isAdmin
                                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                            >
                                {isAdmin ? (
                                    <>
                                        <Lock size={16} /> Ver Datos de Contacto
                                    </>
                                ) : (
                                    <>
                                        <MessageSquare size={16} /> Chat Interno
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // --- Modals ---

    const ContactModal = () => {
        if (!showContactModal) return null;
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Datos Privados</h3>
                        <button onClick={() => setShowContactModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <img src={showContactModal.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
                        <div>
                            <p className="font-bold text-lg">{showContactModal.name}</p>
                            <p className="text-slate-500 text-sm">Solo visible para Admin</p>
                        </div>
                    </div>

                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3 text-slate-700">
                            <Phone size={20} className="text-indigo-500" />
                            <span className="font-medium">{showContactModal.contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700">
                            <Mail size={20} className="text-indigo-500" />
                            <span className="font-medium">{showContactModal.contact.email}</span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">
                            Llamar
                        </button>
                        <button className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2 rounded-lg font-medium transition-colors">
                            Copiar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ChatModal = () => {
        if (!showChatModal) return null;
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full h-[500px] flex flex-col animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src={showChatModal.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white/30" />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold">{showChatModal.name}</h3>
                                <p className="text-xs text-indigo-200">En línea</p>
                            </div>
                        </div>
                        <button onClick={() => setShowChatModal(null)} className="text-white/70 hover:text-white">✕</button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                        <div className="flex justify-center">
                            <span className="text-xs text-slate-400 bg-slate-200 px-2 py-1 rounded-full">Hoy, 10:23</span>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                                <p className="text-sm">¡Hola! ¿Vas a ir al casting del martes?</p>
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div className="bg-white text-slate-700 px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm border border-slate-100">
                                <p className="text-sm">¡Sí! Estoy preparando el monólogo ahora mismo. ¿Tú?</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Escribe un mensaje..."
                                className="flex-1 border border-slate-200 rounded-full px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            <button className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors">
                                <MessageSquare size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ClockIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    {view === 'dashboard' && <DashboardView />}
                    {view === 'agenda' && <AgendaView />}
                    {view === 'network' && <NetworkView />}
                </div>
            </main>

            {/* Modals */}
            {showContactModal && <ContactModal />}
            {showChatModal && <ChatModal />}
        </div>
    );
}
