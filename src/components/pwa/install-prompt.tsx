'use client';

import { useState, useEffect } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if already installed/standalone
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);
        if (isStandaloneMode) return;

        // Detect OS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        const isAndroidDevice = /android/.test(userAgent);

        setIsIOS(isIosDevice);
        setIsAndroid(isAndroidDevice);

        // Android: Listen for beforeinstallprompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsAndroid(true); // Confirm it supports install prompt
            // Delay showing to not be annoying immediately? Or show immediately as per user request.
            // Let's show it after a small delay to look responsive
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // iOS: Logic to show prompt (maybe check if visited before?)
        if (isIosDevice) {
            // For iOS, maybe specifically trigger if they haven't dismissed it recently
            // For now, simple delay
            setTimeout(() => setShowPrompt(true), 3000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleAndroidInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    if (isStandalone || !showPrompt) return null;

    if (isIOS) {
        return (
            <div className="fixed bottom-0 left-0 w-full z-[10050] p-4 animate-in slide-in-from-bottom-5 duration-500">
                <div className="bg-zinc-900/95 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl relative max-w-sm mx-auto">
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="absolute top-2 right-2 text-zinc-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex gap-4">
                        <div className="shrink-0 bg-black border border-zinc-800 rounded-xl w-12 h-12 flex items-center justify-center overflow-hidden">
                            <img src="/android-chrome-192x192.png" alt="App Icon" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="font-bold text-white text-sm">Instalar Scene Me</h3>
                            <p className="text-zinc-400 text-xs">Añade la app a tu inicio para una mejor experiencia.</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                        <div className="flex items-center gap-3 text-zinc-300 text-sm">
                            <span className="flex items-center justify-center w-6 h-6 bg-zinc-800 rounded-md">1</span>
                            <span>Pulsa en <span className="font-bold text-white">Compartir</span> <Share className="w-4 h-4 inline mx-1" /></span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-300 text-sm">
                            <span className="flex items-center justify-center w-6 h-6 bg-zinc-800 rounded-md">2</span>
                            <span>Selecciona <span className="font-bold text-white">Añadir a inicio</span> <PlusSquare className="w-4 h-4 inline mx-1" /></span>
                        </div>
                    </div>

                    {/* Triangle pointer to bottom center (approximate for Safari bar) */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 rotate-45 border-r border-b border-white/10" />
                </div>
            </div>
        );
    }

    if (isAndroid) {
        return (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10050] w-[90%] max-w-sm animate-in slide-in-from-bottom-5 duration-500">
                <div className="bg-white p-4 rounded-xl shadow-2xl border border-zinc-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 bg-black border border-zinc-200 rounded-lg w-10 h-10 overflow-hidden">
                            <img src="/android-chrome-192x192.png" alt="App Icon" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 text-sm">Instalar App</h3>
                            <p className="text-zinc-500 text-[10px]">Acceso rápido y sin conexión</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="text-zinc-400 hover:text-zinc-600 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <Button
                            onClick={handleAndroidInstall}
                            className="bg-primary text-black font-bold h-8 text-xs"
                        >
                            INSTALAR
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
