'use client';

import { useState } from "react";
import { type FormData } from "@/lib/types";
import { PHOTO_PACKS_ACTOR, PHOTO_PACKS_EDITORIAL, PHOTO_PACKS_CONCEPTUAL } from "@/lib/data";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ArrowLeft, CheckCircle2, Loader2, Send, Aperture, Focus, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Step6CheckoutProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
    summary: React.ReactNode;
}

export default function Step6Checkout({ formData, updateForm, setStep, summary }: Step6CheckoutProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const isPhoto = formData.serviceType === 'photo';

    const calculateTotal = () => {
        if (isPhoto) {
            const getPacks = () => {
                switch (formData.photoType) {
                    case 'editorial': return PHOTO_PACKS_EDITORIAL;
                    case 'conceptual': return PHOTO_PACKS_CONCEPTUAL;
                    default: return PHOTO_PACKS_ACTOR;
                }
            };
            const packs = getPacks();
            const pack = packs.find(p => p.id === formData.photoPack);
            return pack ? parseInt(pack.price.replace(/\D/g, '')) : 0;
        }

        let basePrice = formData.packType === "one-scene" ? 499 : 699;
        const premiumCost = formData.shootingType === 'premium' ? 350 : 0;

        // Mocking the same logic from before for consistency
        let numberOfActors = 2; // Default
        const extraActors = Math.max(0, numberOfActors - 2);
        const extraActorsCost = extraActors * 150;

        let subtotal = basePrice + premiumCost + extraActorsCost;
        const discountAmount = formData.discount > 0 ? Math.round(subtotal * (formData.discount / 100)) : 0;
        let discountedSubtotal = subtotal - discountAmount;
        const editingCost = formData.addEditing ? Math.round(discountedSubtotal * 0.10) : 0;

        return discountedSubtotal + editingCost;
    };

    const total = calculateTotal();

    const handleBookingRequest = async () => {
        setIsProcessing(true);
        try {
            const { createOrder } = await import('@/lib/db');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await createOrder(formData, total, 0, "pending_contact");
            setIsSuccess(true);
        } catch (error) {
            console.error("Order Error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col animate-in zoom-in duration-1000 h-full py-10 md:py-20 px-6 text-center items-center justify-center">
                <div className="relative mb-12">
                    <div className="w-32 h-32 bg-white flex items-center justify-center rounded-none shadow-[0_10px_40px_rgba(255,255,255,0.2)]">
                        <CheckCircle2 className="w-16 h-16 text-black" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 border border-white/20 flex items-center justify-center text-[10px] font-mono opacity-40">DONE</div>
                </div>

                <div className="space-y-8 max-w-2xl relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black text-phosphor italic uppercase tracking-tighter leading-none">
                        ¡Negativo <span className="text-white/20">Recibido!</span>
                    </h1>
                    <p className="text-zinc-500 text-lg md:text-xl font-medium uppercase tracking-tight leading-relaxed">
                        Gracias, <span className="text-white font-black">{formData.contact.name}</span>. Hemos procesado tu solicitud de reserva en el sistema de Scene Me.
                    </p>

                    <div className="flex flex-col items-center gap-4 py-8">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 inline-block w-full md:w-auto">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Timeline_Confirmation</span>
                            <span className="text-2xl font-black text-white uppercase italic">
                                {formData.shootDates.length > 0
                                    ? formData.shootDates.map(d => format(new Date(d), 'dd MMM', { locale: es })).join(" / ")
                                    : "Próximamente"}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em]">Ready for development</p>
                    </div>

                    <p className="text-zinc-500 text-sm italic">
                        Un director de Scene Me se pondrá en contacto contigo en las próximas 24h para finalizar la reserva técnica.
                    </p>

                    <Button
                        size="lg"
                        onClick={() => window.location.href = '/'}
                        className="bg-white text-black hover:bg-zinc-200 font-black tracking-[0.4em] px-14 h-16 rounded-none mt-10"
                    >
                        VOLVER AL INICIO
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col animate-in fade-in duration-700 h-full">

            {/* CHECKOUT HEADER */}
            <div className="mb-8 space-y-2">
                <div className="flex items-center gap-3">
                    <span className="bg-white text-black text-[10px] font-black px-3 py-1 uppercase tracking-[0.3em]">Finalizar Pedido</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                    Confirmar <span className="text-zinc-600">Sesión</span>
                </h1>
            </div>

            {/* Main Application Window */}
            <div className="flex flex-col border border-technical bg-studio-matte w-full flex-1 overflow-hidden rounded-sm shadow-2xl relative studio-rim-light">
                {/* Atmospheric Layer: Light Leak */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none animate-light-leak z-0" />

                <div className="grid md:grid-cols-[1fr,400px]">

                    {/* LEFT PANEL: CONTACT INFO */}
                    <div className="p-8 md:p-14 space-y-12 bg-black/40">
                        <section className="space-y-10">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 flex items-center justify-center border border-white/20 text-[10px] font-black text-white italic">01</span>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Identidad Visual</h3>
                            </div>

                            <div className="space-y-8 max-w-md">
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Nombre Completo</Label>
                                    <Input
                                        value={formData.contact.name}
                                        onChange={e => updateForm({ contact: { ...formData.contact, name: e.target.value } })}
                                        placeholder="James Dean"
                                        className="bg-transparent border-0 border-b border-zinc-800 rounded-none text-white text-xl p-0 focus-visible:ring-0 focus-visible:border-white transition-all h-12"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">E-mail Laboratorio</Label>
                                    <Input
                                        type="email"
                                        value={formData.contact.email}
                                        onChange={e => updateForm({ contact: { ...formData.contact, email: e.target.value } })}
                                        placeholder="user@sceneme.com"
                                        className="bg-transparent border-0 border-b border-zinc-800 rounded-none text-white text-xl p-0 focus-visible:ring-0 focus-visible:border-white transition-all h-12"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Teléfono Contacto</Label>
                                    <Input
                                        value={formData.contact.phone}
                                        onChange={e => updateForm({ contact: { ...formData.contact, phone: e.target.value } })}
                                        placeholder="+34"
                                        className="bg-transparent border-0 border-b border-zinc-800 rounded-none text-white text-xl p-0 focus-visible:ring-0 focus-visible:border-white transition-all h-12"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6 pt-10 border-t border-zinc-900">
                            <div className="flex items-center space-x-4 group cursor-pointer">
                                <Checkbox
                                    id="terms"
                                    checked={acceptedTerms}
                                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                    className="w-6 h-6 rounded-none border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-[11px] font-bold text-zinc-600 uppercase tracking-tight leading-snug group-hover:text-zinc-400 transition-colors"
                                >
                                    Acepto el procesado de mis datos según la <a href="/privacy" target="_blank" className="text-white underline italic">política de privacidad</a>.
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT PANEL: ORDER SUMMARY (Darkroom Style) */}
                    <aside className="border-l border-zinc-900 bg-[#080808] p-10 flex flex-col relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Focus className="w-32 h-32" />
                        </div>

                        <div className="relative z-10 space-y-12 h-full flex flex-col">
                            <div>
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-10 italic">Receipt Summary</h3>

                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Selected Concept</p>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                                {isPhoto ? (
                                                    (() => {
                                                        const packs = formData.photoType === 'editorial' ? PHOTO_PACKS_EDITORIAL :
                                                            formData.photoType === 'conceptual' ? PHOTO_PACKS_CONCEPTUAL :
                                                                PHOTO_PACKS_ACTOR;
                                                        return packs.find(p => p.id === formData.photoPack)?.label || 'Book Selection';
                                                    })()
                                                ) : (
                                                    formData.packType === "one-scene" ? "Pack 1 Escena" : "Pack 2 Escenas"
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-8 border-t border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                        <div className="flex justify-between">
                                            <span>Base Investment</span>
                                            <span className="text-white">€{total}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Service Tax (IVA)</span>
                                            <span className="text-white">Inc.</span>
                                        </div>
                                        {formData.discount > 0 && (
                                            <div className="flex justify-between text-white bg-zinc-900 p-2 -mx-2">
                                                <span>Adv_Booking Discount</span>
                                                <span className="italic">-{formData.discount}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-10">
                                <div className="border-t-2 border-white pt-8 flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Final Balance</p>
                                        <p className="text-6xl font-black text-white italic tracking-tighter">€{total}</p>
                                    </div>
                                    <ShieldCheck className="w-10 h-10 text-primary opacity-20" />
                                </div>

                                <Button
                                    size="lg"
                                    onClick={handleBookingRequest}
                                    disabled={isProcessing || !formData.contact.name || !formData.contact.email || !acceptedTerms}
                                    className="w-full bg-white text-black hover:bg-zinc-200 font-black tracking-[0.4em] h-20 rounded-none text-lg shadow-2xl transition-all transform hover:-translate-y-1 disabled:opacity-20"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    ) : (
                                        "ENVIAR SOLICITUD"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* FOOTER BAR */}
            {!isSuccess && (
                <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 px-4">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(formData.serviceType === 'photo' ? 2 : 6)}
                        className="text-zinc-600 hover:text-white transition-all uppercase font-black text-xs tracking-[0.4em] group"
                    >
                        <ArrowLeft className="mr-3 w-4 h-4 transition-transform group-hover:-translate-x-1" /> Volver a Agenda
                    </Button>
                </div>
            )}
        </div>
    );
}
