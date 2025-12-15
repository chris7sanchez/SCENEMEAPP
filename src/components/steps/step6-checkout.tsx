import { useState } from "react";
import { StepCard } from "@/components/step-card";
import { type FormData } from "@/lib/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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

    // Calculate Total Price
    const calculateTotal = () => {
        let basePrice = formData.packType === "one-scene" ? 499 : 699;

        // Premium Cost
        const premiumCost = formData.shootingType === 'premium' ? 350 : 0;

        // Extra Actors Cost
        let numberOfActors = 0;
        switch (formData.dynamic) {
            case "m-f": case "f-f": case "m-m": numberOfActors = 2; break;
            case "solo": numberOfActors = 1; break;
            case "triad": numberOfActors = 3; break;
            case "ensemble": numberOfActors = 4; break;
            default: numberOfActors = 0;
        }
        const extraActors = Math.max(0, numberOfActors - 2);
        const extraActorsCost = extraActors * 150;

        // Duration Supplement
        let durationCost = 0;
        const durationMinutes = parseInt(formData.length || "90");
        if (durationMinutes === 120) durationCost = Math.round(basePrice * 0.08);
        else if (durationMinutes === 180) durationCost = Math.round(basePrice * 0.10);
        else if (durationMinutes === 240) durationCost = Math.round(basePrice * 0.15);

        let subtotal = basePrice + premiumCost + extraActorsCost + durationCost;

        // Discount
        const discountAmount = formData.discount > 0 ? Math.round(subtotal * (formData.discount / 100)) : 0;
        let discountedSubtotal = subtotal - discountAmount;

        // Editing Cost
        const editingCost = formData.addEditing ? Math.round(discountedSubtotal * 0.10) : 0;

        return discountedSubtotal + editingCost;
    };

    const total = calculateTotal();

    const handleBookingRequest = async () => {
        setIsProcessing(true);
        try {
            // Dynamic import to avoid SSR issues
            const { createOrder } = await import('@/lib/db');

            // Simulate Network Delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Create Order in Firestore (Status: pending_contact)
            // We pass 0 as deposit since no payment is taken yet
            await createOrder(formData, total, 0, "pending_contact");

            setIsSuccess(true);
        } catch (error) {
            console.error("Order Error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const footer = (
        <div className="w-full flex justify-between">
            {!isSuccess && (
                <Button size="lg" variant="outline" onClick={() => setStep(6)} disabled={isProcessing}>
                    <ArrowLeft className="mr-2" /> Atrás
                </Button>
            )}
            {!isSuccess && (
                <div className="flex flex-col gap-4 items-end w-full ml-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)} />
                        <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-400"
                        >
                            Acepto la <a href="/privacy" target="_blank" className="underline hover:text-white">Política de Privacidad</a> y los <a href="/terms" target="_blank" className="underline hover:text-white">Términos</a>.
                        </label>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleBookingRequest}
                        disabled={isProcessing || !formData.contact.name || !formData.contact.email || !acceptedTerms}
                        className="bg-primary text-black hover:bg-primary/90 font-bold"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                            </>
                        ) : (
                            <>
                                Solicitar Reserva <Send className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );

    if (isSuccess) {
        return (
            <StepCard
                title="¡Solicitud Recibida!"
                description="Nos pondremos en contacto contigo enseguida."
                footerContent={
                    <div className="w-full flex justify-center">
                        <Button size="lg" onClick={() => window.location.href = '/'} className="bg-primary text-black font-bold">
                            Volver al Inicio
                        </Button>
                    </div>
                }
            >
                <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-white">¡Gracias, {formData.contact.name}!</h3>
                        <p className="text-zinc-400 max-w-md mx-auto text-lg">
                            Hemos recibido tu solicitud de reserva para el día:
                        </p>
                        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl inline-block">
                            <span className="text-2xl font-bold text-white block">
                                {formData.shootDates.length > 0
                                    ? formData.shootDates.map(d => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })).join(", ")
                                    : "Fechas pendientes"}
                            </span>
                        </div>
                        <p className="text-zinc-400 max-w-md mx-auto">
                            Un miembro de nuestro equipo te contactará en breve al email <strong>{formData.contact.email}</strong> o por teléfono para confirmar los detalles y formalizar la reserva.
                        </p>
                    </div>
                </div>
            </StepCard>
        );
    }

    return (
        <StepCard
            title="Finalizar Solicitud"
            description="Revisa tus datos y envía tu solicitud de reserva."
            footerContent={footer}
        >
            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column: Contact */}
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            Datos de Contacto
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre completo</Label>
                                <Input
                                    value={formData.contact.name}
                                    onChange={e => updateForm({ contact: { ...formData.contact, name: e.target.value } })}
                                    placeholder="Tu nombre"
                                    className="bg-muted/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.contact.email}
                                    onChange={e => updateForm({ contact: { ...formData.contact, email: e.target.value } })}
                                    placeholder="tu@email.com"
                                    className="bg-muted/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input
                                    value={formData.contact.phone}
                                    onChange={e => updateForm({ contact: { ...formData.contact, phone: e.target.value } })}
                                    placeholder="+34 600 000 000"
                                    className="bg-muted/30"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                            Resumen del Pedido
                        </h3>
                        <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                                <span className="font-bold text-lg">{formData.packType === "one-scene" ? "Pack 1 Escena" : "Pack 2 Escenas"}</span>
                                <span className="font-bold text-lg">{formData.packType === "one-scene" ? "499€" : "699€"}</span>
                            </div>

                            <div className="space-y-2 text-sm text-zinc-400">
                                {formData.shootingType === 'premium' && (
                                    <div className="flex justify-between text-yellow-500 font-bold">
                                        <span>Opción Premium</span>
                                        <span>+350€</span>
                                    </div>
                                )}

                                {formData.discount > 0 && (
                                    <div className="flex justify-between text-green-500 font-bold">
                                        <span>Descuento Antelación ({formData.discount}%)</span>
                                        <span>-{Math.round((total / (1 - formData.discount / 100)) - total)}€</span>
                                    </div>
                                )}

                                {formData.addEditing && (
                                    <div className="flex justify-between text-primary">
                                        <span>Edición y Etalonaje</span>
                                        <span>Incluido (+10%)</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-zinc-800 flex justify-between items-end">
                                <span className="text-muted-foreground">Total Estimado</span>
                                <span className="text-3xl font-bold text-primary">{total}€</span>
                            </div>

                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20 text-xs text-blue-200">
                                <p>ℹ️ No se realizará ningún cargo ahora. Te contactaremos para confirmar disponibilidad y método de pago.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StepCard>
    );
}
