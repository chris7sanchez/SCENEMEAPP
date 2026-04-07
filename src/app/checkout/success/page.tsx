'use client';
import React from 'react';
import Link from 'next/link';
import { CheckCircle, Home, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900/50 border border-white/10 rounded-3xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary animate-pulse">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                </div>
                
                <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">¡PAGO CONFIRMADO!</h1>
                <p className="text-zinc-400 font-medium">Hemos recibido tu reserva correctamente. El equipo de Scene Me se pondrá en contacto contigo pronto para los siguientes pasos.</p>
                
                <div className="pt-4 space-y-3">
                    <Link href="/creator">
                        <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4" />
                            RESERVAR OTRA SESIÓN
                        </Button>
                    </Link>
                    
                    <Link href="/">
                        <Button variant="ghost" className="w-full text-zinc-500 hover:text-white font-bold flex items-center justify-center gap-2">
                            <Home className="w-4 h-4" />
                            VOLVER AL INICIO
                        </Button>
                    </Link>
                </div>
                
                <div className="pt-6 border-t border-white/5 opacity-30">
                    <p className="text-[8px] font-black text-white uppercase tracking-[0.5em]">Scene Me © 2024 — ACTOR WORLDWIDE</p>
                </div>
            </div>
        </div>
    );
}
