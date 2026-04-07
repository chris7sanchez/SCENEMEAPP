import { useState } from "react";
import { type FormData } from "@/lib/types";
import { PHOTO_PACKS_ACTOR, PHOTO_PACKS_EDITORIAL, PHOTO_PACKS_CONCEPTUAL } from "@/lib/data";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ArrowLeft, CheckCircle2, Loader2, CreditCard, ShieldCheck, ShoppingCart } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
        let subtotal = basePrice + premiumCost;
        const discountAmount = formData.discount > 0 ? Math.round(subtotal * (formData.discount / 100)) : 0;
        let discountedSubtotal = subtotal - discountAmount;
        const editingCost = formData.addEditing ? Math.round(discountedSubtotal * 0.10) : 0;

        return discountedSubtotal + editingCost;
    };

    const total = calculateTotal();

    const handlePayment = async (method: string) => {
        setIsProcessing(true);
        try {
            const { createOrder } = await import('@/lib/db');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await createOrder(formData, total, 0, "paid_via_" + method);
            setIsSuccess(true);
        } catch (error) {
            console.error("Payment Error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col animate-in zoom-in duration-700 h-full py-20 px-6 text-center items-center justify-center bg-black">
                <div className="w-24 h-24 bg-primary flex items-center justify-center rounded-full mb-8 shadow-lg shadow-primary/20">
                    <CheckCircle2 className="w-12 h-12 text-black" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 italic">PEDIDO CONFIRMADO</h1>
                <p className="text-white/60 text-lg max-w-md font-bold uppercase tracking-tight mb-12">
                    ¡Listo, <span className="text-primary">{formData.contact.name}</span>! Tu sesión ha sido reservada con éxito.
                </p>
                <Button
                    size="lg"
                    onClick={() => window.location.href = '/creator'}
                    className="bg-white text-black hover:bg-zinc-200 font-black tracking-widest px-12 h-14 rounded-xl uppercase"
                >
                    VOLVER AL DASHBOARD
                </Button>
            </div>
        );
    }

    const packLabel = isPhoto ? (
        (() => {
            const packs = formData.photoType === 'editorial' ? PHOTO_PACKS_EDITORIAL :
                formData.photoType === 'conceptual' ? PHOTO_PACKS_CONCEPTUAL :
                    PHOTO_PACKS_ACTOR;
            return packs.find(p => p.id === formData.photoPack)?.label || 'Book Selection';
        })()
    ) : (
        formData.packType === "one-scene" ? "1 ESCENA PROFESIONAL" : "PACK 2 ESCENAS"
    );

    return (
        <div className="flex flex-col animate-in fade-in duration-700 max-w-2xl mx-auto w-full">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">CHECKOUT</h1>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Finaliza tu reserva técnica</p>
            </div>

            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
                <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">PRODUCTO</span>
                            <h3 className="text-2xl font-black text-white uppercase italic">{packLabel}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                            <ShoppingCart className="w-6 h-6 text-white/40" />
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Nombre Completo</Label>
                            <Input
                                value={formData.contact.name}
                                onChange={e => updateForm({ contact: { ...formData.contact, name: e.target.value } })}
                                placeholder="Tu nombre"
                                className="bg-white/5 border-white/10 rounded-xl text-white h-12 px-4 focus:bg-white/10 transition-all font-bold"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">E-mail</Label>
                                <Input
                                    type="email"
                                    value={formData.contact.email}
                                    onChange={e => updateForm({ contact: { ...formData.contact, email: e.target.value } })}
                                    placeholder="hola@sceneme.com"
                                    className="bg-white/5 border-white/10 rounded-xl text-white h-12 px-4 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Teléfono</Label>
                                <Input
                                    value={formData.contact.phone}
                                    onChange={e => updateForm({ contact: { ...formData.contact, phone: e.target.value } })}
                                    placeholder="+34"
                                    className="bg-white/5 border-white/10 rounded-xl text-white h-12 px-4 transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="terms_checkout"
                                checked={acceptedTerms}
                                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                className="mt-1 rounded-md border-white/20 data-[state=checked]:bg-primary"
                            />
                            <label htmlFor="terms_checkout" className="text-[10px] font-bold text-white/40 uppercase tracking-tight leading-snug">
                                ACEPTO LOS TÉRMINOS Y LA <a href="/privacy" className="text-primary underline">POLÍTICA DE PRIVACIDAD</a>.
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 p-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Total a reservar</p>
                        <p className="text-5xl font-black text-white italic tracking-tighter underline decoration-primary decoration-4 underline-offset-4">€{total}</p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                size="lg"
                                disabled={!formData.contact.name || !formData.contact.email || !acceptedTerms}
                                className="h-16 px-10 bg-primary text-black hover:bg-primary/90 font-black tracking-[0.3em] rounded-2xl text-lg shadow-xl shadow-primary/20 transition-all uppercase active:scale-95"
                            >
                                <CreditCard className="mr-3 w-6 h-6" /> PAGAR
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border border-white/10 text-white max-w-md rounded-3xl">
                            <div className="space-y-8 py-4">
                                <DialogHeader className="p-0 text-center">
                                    <DialogTitle className="text-2xl font-black italic uppercase">Método de Pago</DialogTitle>
                                    <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-1">Selecciona cómo deseas realizar tu reserva</DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-3">
                                    <Button 
                                        onClick={() => handlePayment('apple')} 
                                        className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black text-lg gap-3 rounded-2xl"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.96.95-2.22 1.78-3.53 1.78-1.28 0-1.67-.83-3.15-.83-1.51 0-1.97.82-3.13.82-1.2 0-2.54-.91-3.6-2.47-1.1-1.63-1.92-4.63-1.92-7.14 0-3.97 2.35-6.07 4.54-6.07 1.04 0 1.95.6 2.76.6.77 0 1.88-.63 3.09-.63 1.3 0 2.44.57 3.25 1.57-2.61 1.44-2.18 5.17.47 6.27-.66 1.63-1.57 3.27-2.78 4.37v-.3zm-2.85-15.65c.57-.7 1-1.63 1-2.63 0-.12-.01-.25-.03-.37-.87.03-1.87.59-2.48 1.3-.5.58-.94 1.54-.94 2.53 0 .15.02.29.05.4.92-.01 1.83-.53 2.4-1.23z"/></svg>
                                                APPLE PAY
                                            </>
                                        )}
                                    </Button>
                                    <Button 
                                        onClick={() => handlePayment('google')} 
                                        className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black text-lg gap-3 rounded-2xl"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.12-1.92 4.12-1.2 1.2-3.08 2.48-6.12 2.48-4.92 0-8.96-4-8.96-8.92 0-4.92 4.04-8.92 8.96-8.92 2.68 0 4.6 1.04 6.04 2.44l2.32-2.32C18.64 1.16 15.84 0 12.48 0 5.6 0 0 5.6 0 12.48S5.6 24.96 12.48 24.96c3.68 0 6.48-1.2 8.68-3.48 2.24-2.24 2.96-5.4 2.96-8.08 0-.68-.04-1.32-.12-1.92h-11.52z"/></svg>
                                                GOOGLE PAY
                                            </>
                                        )}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => handlePayment('card')} 
                                        className="w-full h-16 border-white/10 bg-white/5 text-white hover:bg-white/10 font-black text-sm uppercase tracking-widest rounded-2xl"
                                        disabled={isProcessing}
                                    >
                                        Tarjeta de Crédito / Débito
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center gap-2 opacity-20">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Pago 100% Seguro</span>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="mt-8 mb-24">
                <Button
                    variant="ghost"
                    onClick={() => setStep(formData.serviceType === 'photo' ? 2 : 6)}
                    className="text-white/20 hover:text-white transition-all uppercase font-black text-[10px] tracking-widest group mx-auto"
                >
                    <ArrowLeft className="mr-2 w-3 h-3 group-hover:-translate-x-1 transition-transform" /> ATRÁS
                </Button>
            </div>
        </div>
    );
}
