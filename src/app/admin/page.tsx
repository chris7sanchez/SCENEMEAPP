'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Loader2,
    Lock,
    Wand2,
    RefreshCw,
    Download,
    Mail,
    User,
    Calendar,
    Mic,
    MicOff,
    Edit,
    Save,
    Clock,
    DollarSign,
    ShoppingCart
} from "lucide-react";
import { generateVideoScript } from "@/ai/flows/generate-video-script";
import { GENRES, TONES, LOCATIONS } from "@/lib/data";

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { auth } from "@/lib/auth";

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [activeTab, setActiveTab] = useState("orders");

    // AI Generator State
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [genre, setGenre] = useState("Drama");
    const [secondaryGenre, setSecondaryGenre] = useState("-");
    const [numActors, setNumActors] = useState("2");
    const [genderActors, setGenderActors] = useState<string[]>(["Masculino", "Femenino"]);
    const [location, setLocation] = useState("Sin preferencia");
    const [customLocation, setCustomLocation] = useState("");

    // Duration State
    const [durationMode, setDurationMode] = useState<"fixed" | "range">("fixed");
    const [durationMin, setDurationMin] = useState("1");
    const [durationMax, setDurationMax] = useState("2");

    const [endingType, setEndingType] = useState("Sorpréndeme");
    const [logline, setLogline] = useState("");
    const [props, setProps] = useState("");
    const [emailToSend, setEmailToSend] = useState("");

    // Speech Recognition State
    const [isListening, setIsListening] = useState(false);

    // Language State
    // Language State
    const [language, setLanguage] = useState("Español");

    // 3 Script Options
    const [scripts, setScripts] = useState<string[]>(["", "", ""]);
    const [isGenerating, setIsGenerating] = useState<boolean[]>([false, false, false]);

    // Check authentication on mount
    useEffect(() => {
        let mounted = true;
        const checkAuth = async () => {
            try {
                // Timeout safety in case Firebase hangs
                const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));
                const authPromise = auth.getCurrentUser();

                const user = await Promise.race([authPromise, timeoutPromise]) as any;

                // Check if user is logged in AND is the admin email
                const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                if (mounted && user && user.email) {
                    if (adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase()) {
                        setIsAuthenticated(true);
                    } else if (!adminEmail) {
                        // Fallback: If no admin email configured, allow any logged in user (legacy behavior, risky)
                        // Better to require configuration, but for now let's be safe and require it.
                        console.warn("NEXT_PUBLIC_ADMIN_EMAIL not set. Admin access restricted.");
                    }
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                if (mounted) setIsLoadingAuth(false);
            }
        };
        checkAuth();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(ordersData);
            setLoadingOrders(false);
        });

        return () => unsubscribe();
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");

        // 1. Try Master Password (Emergency Access)
        if (password) {
            try {
                const res = await fetch('/api/admin/verify-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                if (res.ok) {
                    setIsAuthenticated(true);
                    return;
                }
            } catch (err) {
                console.error("Master password check failed", err);
            }
        }

        // 2. Try Standard Firebase Login
        if (!email || !password) {
            setLoginError("Por favor introduce email y contraseña (o solo contraseña maestra)");
            return;
        }

        const success = await auth.login(email, password);
        if (success) {
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) {
                setIsAuthenticated(true);
            } else {
                setLoginError("Este usuario no tiene permisos de administrador.");
                await auth.logout(); // Logout unauthorized user
            }
        } else {
            setLoginError("Credenciales incorrectas o contraseña maestra inválida.");
        }
    };

    const handleLogout = async () => {
        await auth.logout();
        setIsAuthenticated(false);
        setEmail("");
        setPassword("");
    };

    const handleMicClick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Tu navegador no soporta el reconocimiento de voz. Prueba con Chrome o Safari.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            window.location.reload(); // Simple reset to stop listening effectively
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setLogline(prev => (prev ? prev + " " : "") + transcript);
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const updateNumActors = (val: string) => {
        setNumActors(val);
        const n = parseInt(val);
        if (!isNaN(n) && n > 0) {
            setGenderActors(prev => {
                const newArr = [...prev];
                if (n > prev.length) {
                    for (let i = prev.length; i < n; i++) {
                        newArr.push("Masculino");
                    }
                } else if (n < prev.length) {
                    newArr.splice(n);
                }
                return newArr;
            });
        }
    };

    const updateActorGender = (index: number, val: string) => {
        const newArr = [...genderActors];
        newArr[index] = val;
        setGenderActors(newArr);
    };

    const generateSingleScript = async (index: number) => {
        const newIsGenerating = [...isGenerating];
        newIsGenerating[index] = true;
        setIsGenerating(newIsGenerating);

        try {
            const variationPrompt = index === 0 ? "" : index === 1 ? " Make it more dialogue-heavy." : " Make it more action-oriented with a twist.";

            // Format actors string
            const actorsDescription = genderActors.map((g, i) => `Actor ${i + 1}: ${g}`).join(", ");

            // Format duration
            let lengthString = "120 seconds"; // Default value, though it will be overwritten
            if (durationMode === "fixed") {
                lengthString = "30 seconds";
            } else {
                lengthString = `${durationMin} to ${durationMax} minutes`;
            }

            const result = await generateVideoScript({
                genre,
                secondaryGenre: secondaryGenre === "-" ? undefined : secondaryGenre,
                numActors,
                genderActors: actorsDescription,
                tones: ["Intense"],
                locationPreference: location === "Otro" ? customLocation : (location === "Sin preferencia" ? undefined : location),
                length: lengthString,
                logline: logline + variationPrompt,
                props,
                endingType,
                language

            });

            const newScripts = [...scripts];
            newScripts[index] = result.script;
            setScripts(newScripts);
        } catch (error) {
            console.error("Error generating script:", error);
            alert("Error al generar el guion.");
        } finally {
            setIsGenerating(prev => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
        }
    };

    const handleGenerateAll = async () => {
        // Trigger all 3 in parallel but don't await them here to block UI
        // Each generateSingleScript handles its own loading state
        const promises = [0, 1, 2].map(index => generateSingleScript(index));
        await Promise.all(promises);
    };

    const loadOrderIntoGenerator = (orderId: string) => {
        if (orderId === "custom") {
            setSelectedOrderId(null);
            setGenre("Drama");
            setSecondaryGenre("-");
            setNumActors("2");
            setGenderActors(["Masculino", "Femenino"]);
            setLocation("Sin preferencia");
            setCustomLocation("");
            setDurationMode("fixed");
            setEndingType("Sorpréndeme");
            setLogline("");
            setProps("");
            setLanguage("Español");

            setEmailToSend("");
            setScripts(["", "", ""]);
            return;
        }

        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        setSelectedOrderId(order.id);

        if (order.genre) {
            setGenre(order.genre);
        } else {
            setGenre("Drama");
        }

        // Map TONES from Step 5 to Secondary Genre
        if (order.tones && order.tones.length > 0) {
            setSecondaryGenre(order.tones[0]);
        } else {
            setSecondaryGenre("-");
        }

        const size = order.crewSize || 2;
        setNumActors(size.toString());
        // Default to alternating genders or just Masculino for simplicity as we can't parse 'dynamic' reliably without complex logic
        const newGenders = Array(size).fill("Masculino");
        if (size >= 2) newGenders[1] = "Femenino"; // Simple default heuristic
        setGenderActors(newGenders);

        // Location Mapping
        if (order.locations && order.locations.length > 0) {
            const loc = order.locations[0];
            // Check if loc maps to a known constant ID or Label? 
            // LOCATIONS in data.ts are strings like "Casa / Sala de estar".
            // If it matches exactly, set it. If not, it's custom.
            const isKnown = LOCATIONS.includes(loc as any);
            if (isKnown) {
                setLocation(loc);
                setCustomLocation(order.otherDetails || ""); // Preserve logic
            } else {
                // Might be strictly custom or from 'otherDetails'
                setLocation("Otro");
                setCustomLocation(loc + (order.otherDetails ? ` - ${order.otherDetails}` : ""));
            }
        } else if (order.otherDetails) {
            setLocation("Otro");
            setCustomLocation(order.otherDetails);
        } else {
            setLocation("Sin preferencia");
            setCustomLocation("");
        }

        setLogline(order.logline || order.surpriseData?.word || "");
        setProps(order.props || "");
        setLanguage("Español");

        setEmailToSend(order.contact?.email || "");

        // Reset scripts
        setScripts(["", "", ""]);
        setActiveTab("generator");
    };

    const downloadScript = (content: string, index: number) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `guion-opcion-${index + 1}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const sendEmail = (content: string) => {
        if (!emailToSend) {
            alert("Por favor, introduce un email.");
            return;
        }
        // Mock email sending
        alert(`✅ Guion enviado correctamente a ${emailToSend}`);
    };

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-2xl font-display text-primary text-center">SCENE ME ADMIN</CardTitle>
                        <CardDescription className="text-center text-zinc-400">Acceso restringido</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@sceneme.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-black/50 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-black/50 border-zinc-700 text-white"
                                />
                            </div>
                            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                            <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90 font-bold">
                                Entrar
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-4xl tracking-wider text-primary">SCENE ME ADMIN</h1>
                        <p className="text-zinc-400 font-mono text-sm">Panel de Control & Generador IA</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="border-red-900/50 text-red-500 hover:bg-red-950 hover:text-red-400">
                        <Lock className="w-4 h-4 mr-2" /> Cerrar Sesión
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
                        <TabsTrigger value="orders">📦 Pedidos ({orders.length})</TabsTrigger>
                        <TabsTrigger value="generator">✨ Generador IA {selectedOrderId && `(Pedido Activo)`}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders" className="mt-6">
                        {loadingOrders ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500">No hay pedidos aún.</div>
                        ) : (
                            <div className="grid gap-4">
                                {orders.map((order: any) => (
                                    <Card key={order.id} className="bg-zinc-900 border-zinc-800 text-white overflow-hidden">
                                        <div className="flex flex-col md:flex-row border-l-4 border-primary">
                                            {/* Left: Status & Main Info */}
                                            <div className="p-6 flex-1 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-mono text-xs text-zinc-500">ID: {order.id}</span>
                                                            <span className="bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-800 uppercase font-bold">
                                                                {order.status === 'deposit_paid' ? 'Reserva Pagada' : order.status}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                            {order.packType === 'one-scene' ? 'Pack 1 Escena' : 'Pack 2 Escenas'}
                                                        </h3>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-primary">{order.depositAmount}€</div>
                                                        <div className="text-xs text-zinc-400">Pagado (Reserva 10%)</div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-zinc-400"><User className="w-4 h-4" /> Cliente</div>
                                                        <div className="font-medium">{order.contact?.name}</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-zinc-400"><Calendar className="w-4 h-4" /> Fechas</div>
                                                        {order.shootDates && order.shootDates.length > 0 ? (
                                                            <div>
                                                                <div className="font-medium text-primary">📅 {order.shootDates.length} Días</div>
                                                                <div className="text-[10px] text-zinc-400">
                                                                    {order.shootDates.map((d: any) => new Date(d).toLocaleDateString()).join(", ")}
                                                                </div>
                                                            </div>
                                                        ) : order.shootDate ? (
                                                            <div className="font-medium text-primary">📅 {new Date(order.shootDate).toLocaleDateString()}</div>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-1">
                                                                {order.preferredMonths?.map((m: string) => (
                                                                    <span key={m} className="bg-zinc-800 px-2 py-0.5 rounded text-xs">{m}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="pt-4">
                                                    <Button
                                                        onClick={() => loadOrderIntoGenerator(order.id)}
                                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                                                    >
                                                        <Wand2 className="w-4 h-4 mr-2 text-primary" /> Generar Guiones para este Pedido
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Right: Creative Details */}
                                            <div className="bg-black/30 p-6 md:w-1/3 border-t md:border-t-0 md:border-l border-zinc-800 text-sm space-y-3">
                                                <h4 className="font-bold text-zinc-300 mb-2">Detalles Creativos</h4>
                                                <div>
                                                    <span className="text-zinc-500 block text-xs uppercase">Género</span>
                                                    {order.genre}
                                                </div>
                                                <div>
                                                    <span className="text-zinc-500 block text-xs uppercase">Logline</span>
                                                    <p className="line-clamp-3 text-zinc-400 italic">"{order.logline || order.surpriseData?.word || 'Sin logline'}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="generator">
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Input Form (Left Column) */}
                            <div className="lg:col-span-1">
                                <Card className="bg-zinc-900 border-zinc-800 text-white h-fit sticky top-8">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-2 mb-4">
                                            <Wand2 className="w-5 h-5 text-primary" /> Configuración
                                        </CardTitle>

                                        {/* Order Selector */}
                                        <div className="space-y-2">
                                            <Label className="text-xs text-zinc-400 uppercase">Cargar datos de Pedido</Label>
                                            <Select value={selectedOrderId || "custom"} onValueChange={loadOrderIntoGenerator}>
                                                <SelectTrigger className="bg-black/50 border-zinc-700">
                                                    <SelectValue placeholder="Seleccionar pedido..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                    <SelectItem value="custom">Pedido personalizado</SelectItem>
                                                    {orders.map((o: any) => (
                                                        <SelectItem key={o.id} value={o.id}>
                                                            #{o.id.slice(0, 4)} - {o.contact?.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label>Género Principal</Label>
                                                <Select value={genre} onValueChange={setGenre}>
                                                    <SelectTrigger className="bg-black/50 border-zinc-700">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[300px]">
                                                        {GENRES.map((g: any) => (
                                                            <SelectItem key={g.id} value={g.label}>{g.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Secundario (Opc)</Label>
                                                <Select value={secondaryGenre} onValueChange={setSecondaryGenre}>
                                                    <SelectTrigger className="bg-black/50 border-zinc-700">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[300px]">
                                                        <SelectItem value="-">-</SelectItem>
                                                        {TONES.map((t: any) => (
                                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Nº Actores</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={numActors}
                                                onChange={(e) => updateNumActors(e.target.value)}
                                                className="bg-black/50 border-zinc-700"
                                                placeholder="2"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Sexo Actores</Label>
                                            <div className="space-y-2">
                                                {genderActors.map((gender, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <span className="text-xs text-zinc-500 w-12">Actor {i + 1}</span>
                                                        <Select value={gender} onValueChange={(val) => updateActorGender(i, val)}>
                                                            <SelectTrigger className="bg-black/50 border-zinc-700 h-8 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                                <SelectItem value="Masculino">Masculino</SelectItem>
                                                                <SelectItem value="Femenino">Femenino</SelectItem>
                                                                <SelectItem value="Trans">Trans</SelectItem>
                                                                <SelectItem value="No binario">No binario</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Duración</Label>
                                            <Select value={durationMode} onValueChange={(v: any) => setDurationMode(v)}>
                                                <SelectTrigger className="bg-black/50 border-zinc-700">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                    <SelectItem value="fixed">30 Segundos (Reel)</SelectItem>
                                                    <SelectItem value="range">Rango de Minutos</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {durationMode === "range" && (
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-zinc-400">Desde (min)</Label>
                                                        <Select value={durationMin} onValueChange={setDurationMin}>
                                                            <SelectTrigger className="bg-black/50 border-zinc-700 h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                                {[1, 2, 3, 4].map(n => (
                                                                    <SelectItem key={n} value={n.toString()}>{n} min</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-zinc-400">Hasta (min)</Label>
                                                        <Select value={durationMax} onValueChange={setDurationMax}>
                                                            <SelectTrigger className="bg-black/50 border-zinc-700 h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                                {[2, 3, 4, 5].map(n => (
                                                                    <SelectItem key={n} value={n.toString()}>{n} min</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Lugar</Label>
                                            <div className="flex gap-2">
                                                <Select value={location} onValueChange={setLocation}>
                                                    <SelectTrigger className="bg-black/50 border-zinc-700 flex-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[300px]">
                                                        <SelectItem value="Sin preferencia">Sin preferencia</SelectItem>
                                                        {LOCATIONS.map((l: any) => (
                                                            <SelectItem key={l} value={l}>{l}</SelectItem>
                                                        ))}
                                                        <SelectItem value="Otro">Otro (Personalizado)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {location === "Otro" && (
                                                <Input
                                                    value={customLocation}
                                                    onChange={(e) => setCustomLocation(e.target.value)}
                                                    className="bg-black/50 border-zinc-700 mt-2"
                                                    placeholder="Describe el lugar..."
                                                />
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Desenlace</Label>
                                            <Select value={endingType} onValueChange={setEndingType}>
                                                <SelectTrigger className="bg-black/50 border-zinc-700">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                    <SelectItem value="Sorpréndeme">Sorpréndeme</SelectItem>
                                                    <SelectItem value="Giro inesperado">Giro inesperado</SelectItem>
                                                    <SelectItem value="Final esperanzador">Final esperanzador</SelectItem>
                                                    <SelectItem value="Final agridulce">Final agridulce</SelectItem>
                                                    <SelectItem value="Final dramático">Final dramático</SelectItem>
                                                    <SelectItem value="Final con moraleja">Final con moraleja</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label>Logline / Premisa</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleMicClick}
                                                    className={`h-6 px-2 text-xs ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-zinc-400 hover:text-white'}`}
                                                >
                                                    {isListening ? <MicOff className="w-3 h-3 mr-1" /> : <Mic className="w-3 h-3 mr-1" />}
                                                    {isListening ? "Escuchando..." : "Dictar"}
                                                </Button>
                                            </div>
                                            <Textarea
                                                value={logline}
                                                onChange={(e) => setLogline(e.target.value)}
                                                className="bg-black/50 border-zinc-700 min-h-[100px]"
                                                placeholder="Describe la idea del video..."
                                            />
                                        </div>



                                        <div className="space-y-2">
                                            <Label>Idioma del Guion</Label>
                                            <Select value={language} onValueChange={setLanguage}>
                                                <SelectTrigger className="bg-black/50 border-zinc-700">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                    <SelectItem value="Español">Español 🇪🇸</SelectItem>
                                                    <SelectItem value="Inglés">Inglés 🇬🇧</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Props</Label>
                                            <Input
                                                value={props}
                                                onChange={(e) => setProps(e.target.value)}
                                                className="bg-black/50 border-zinc-700"
                                            />
                                        </div>

                                        {/* Mass Generation Button Removed as per user request */}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Output (Right Column - 3 Options) */}
                            <div className="lg:col-span-2 space-y-6">
                                {[0, 1, 2].map((index) => (
                                    <Card key={index} className="bg-zinc-900 border-zinc-800 text-white">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-lg font-medium text-zinc-300">
                                                Opción {index + 1}
                                            </CardTitle>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => generateSingleScript(index)}
                                                    disabled={isGenerating[index]}
                                                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                >
                                                    {isGenerating[index] ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {scripts[index] ? (
                                                <div className="space-y-4">
                                                    <div className="relative group">
                                                        <Textarea
                                                            value={scripts[index]}
                                                            onChange={(e) => {
                                                                const newScripts = [...scripts];
                                                                newScripts[index] = e.target.value;
                                                                setScripts(newScripts);
                                                            }}
                                                            className="min-h-[400px] bg-black border-zinc-800 font-mono text-sm leading-relaxed text-zinc-300 focus:border-primary transition-colors p-6"
                                                        />
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded pointer-events-none">
                                                            <Edit className="w-4 h-4 text-zinc-400" />
                                                        </div>
                                                    </div>

                                                    {/* Export Tools */}
                                                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-black/30 p-4 rounded-lg border border-zinc-800">
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => downloadScript(scripts[index], index)} className="bg-zinc-200 text-black hover:bg-white border-none font-bold">
                                                                <Save className="w-4 h-4 mr-2" /> Descargar .txt
                                                            </Button>
                                                        </div>
                                                        <div className="flex gap-2 w-full md:w-auto">
                                                            <Input
                                                                placeholder="Email del cliente"
                                                                value={emailToSend}
                                                                onChange={(e) => setEmailToSend(e.target.value)}
                                                                className="bg-black/50 border-zinc-700 h-9 text-sm w-full md:w-64"
                                                            />
                                                            <Button size="sm" onClick={() => sendEmail(scripts[index])} className="bg-zinc-800 hover:bg-zinc-700 text-white">
                                                                Enviar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-[300px] flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-lg bg-black/20">
                                                    {isGenerating[index] ? (
                                                        <div className="text-center">
                                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                                                            <p className="text-xs animate-pulse">Escribiendo guion...</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm">Esperando generación...</p>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
