'use client';

interface PriceCalcProps {
    packType: "one-scene" | "two-scenes";
    addEditing: boolean;
    crewSize: number; // Legacy, kept for interface compatibility but ignored
    dynamic: string;
    shootingType?: "standard" | "premium";
    discount?: number;
    length?: string;
}

export function PriceCalc({
    packType,
    addEditing,
    crewSize,
    dynamic,
    shootingType = "standard",
    discount = 0,
    length = "90"
}: PriceCalcProps) {
    let basePrice = 0;
    let packName = "";

    if (packType === "one-scene") {
        basePrice = 499;
        packName = "Pack 1 Escena";
    } else {
        basePrice = 699;
        packName = "Pack 2 Escenas";
    }

    // Premium Cost
    const premiumCost = shootingType === 'premium' ? 350 : 0;

    // Extra Actors Cost
    let numberOfActors = 0;
    switch (dynamic) {
        case "m-f": numberOfActors = 2; break;
        case "f-f": numberOfActors = 2; break;
        case "m-m": numberOfActors = 2; break;
        case "solo": numberOfActors = 1; break;
        case "triad": numberOfActors = 3; break;
        case "ensemble": numberOfActors = 4; break;
        default: numberOfActors = 0;
    }

    const includedActors = 2;
    const extraActors = Math.max(0, numberOfActors - includedActors);
    const costPerExtraActor = 150;
    const extraActorsCost = extraActors * costPerExtraActor;

    // Duration Supplement
    let durationCost = 0;
    const durationMinutes = parseInt(length);

    if (durationMinutes === 120) durationCost = Math.round(basePrice * 0.08);
    else if (durationMinutes === 180) durationCost = Math.round(basePrice * 0.10);
    else if (durationMinutes === 240) durationCost = Math.round(basePrice * 0.15);

    let subtotal = basePrice + premiumCost + extraActorsCost + durationCost;

    // Discount
    const discountAmount = discount > 0 ? Math.round(subtotal * (discount / 100)) : 0;

    // Apply discount to subtotal before editing? Usually yes.
    let discountedSubtotal = subtotal - discountAmount;

    // Editing Cost (calculated on discounted subtotal)
    const editingCost = addEditing ? Math.round(discountedSubtotal * 0.10) : 0;

    const total = discountedSubtotal + editingCost;

    const formatCurrency = (amount: number) => `€${amount.toFixed(0)}`;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-xl">Total Estimado</h3>
                <div className="text-right">
                    {discount > 0 && (
                        <span className="block text-sm text-muted-foreground line-through decoration-red-500 decoration-2">
                            {formatCurrency(subtotal + (addEditing ? Math.round(subtotal * 0.10) : 0))}
                        </span>
                    )}
                    <span className="font-bold text-3xl text-primary">{formatCurrency(total)}</span>
                </div>
            </div>

            <div className="text-sm space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                    <span>{packName} (Base)</span>
                    <span>{formatCurrency(basePrice)}</span>
                </div>

                {premiumCost > 0 && (
                    <div className="flex justify-between text-yellow-500 font-bold">
                        <span>+ Opción Premium</span>
                        <span>{formatCurrency(premiumCost)}</span>
                    </div>
                )}

                {extraActors > 0 && (
                    <div className="flex justify-between text-amber-500">
                        <span>+ {extraActors} Actor(es) Extra</span>
                        <span>{formatCurrency(extraActorsCost)}</span>
                    </div>
                )}

                {durationCost > 0 && (
                    <div className="flex justify-between text-blue-400">
                        <span>+ Suplemento Duración ({length} min)</span>
                        <span>{formatCurrency(durationCost)}</span>
                    </div>
                )}

                {discount > 0 && (
                    <div className="flex justify-between text-green-500 font-bold">
                        <span>- Descuento Antelación ({discount}%)</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                )}

                {addEditing && (
                    <div className="flex justify-between text-primary font-semibold">
                        <span>+ Edición y Etalonaje (10%)</span>
                        <span>{formatCurrency(editingCost)}</span>
                    </div>
                )}

                <div className="pt-2 mt-2 border-t border-dashed">
                    <p className="font-semibold text-foreground mb-1">Incluye:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Cámara Blackmagic 6K Pro</li>
                        <li>Sonido e Iluminación Profesional</li>
                        <li>2 Opciones de Guion Personalizado</li>
                        <li>Asesoramiento y Dirección</li>
                        <li>Equipo Técnico Completo</li>
                        <li>Hasta 2 Actores</li>
                        {shootingType === 'premium' && (
                            <li className="text-yellow-500 font-bold">Maquillaje, Peluquería y Catering</li>
                        )}
                    </ul>
                </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center pt-2">
                *Precio sin IVA. Sujeto a disponibilidad de fechas.
            </p>
        </div>
    );
}
