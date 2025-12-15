'use client';

import { StepCard } from "@/components/step-card";
import { type FormData } from "@/lib/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { PriceCalc } from "../price-calc";
import { ArrowLeft, ArrowRight, Check, Star, Info, CalendarDays, Trash2 } from "lucide-react";
import { Calendar } from "../ui/calendar";
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    isSameDay,
    isWeekend,
    startOfMonth,
    startOfToday
} from "date-fns";
import { es } from "date-fns/locale";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

interface Step5BudgetProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
}

export default function Step5Budget({ formData, updateForm, setStep }: Step5BudgetProps) {
    const [lastClickedDate, setLastClickedDate] = useState<Date | null>(null);
    const [busyDates, setBusyDates] = useState<Date[]>([]);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const res = await fetch('/api/calendar/availability');
                const data = await res.json();
                if (data.success && Array.isArray(data.busySlots)) {
                    const dates: Date[] = [];
                    data.busySlots.forEach((slot: any) => {
                        const start = new Date(slot.start);
                        const end = new Date(slot.end);

                        // Si es el mismo día (evento simple)
                        // isSameDay compara año, mes y día
                        if (isSameDay(start, end)) {
                            dates.push(start);
                        } else {
                            // Evento multiparte o todo el dia
                            // Ajustar end para eventos "all day" donde google pone el dia siguiente a las 00:00
                            let intervalEnd = end;
                            // Si parece un "all day" event (usualmente termina a las 00:00:00 del dia siguiente)
                            // Restamos un segundo para caer en el día correcto
                            if (end.getHours() === 0 && end.getMinutes() === 0) {
                                intervalEnd = new Date(end.getTime() - 1000);
                            }

                            if (intervalEnd > start) {
                                try {
                                    const range = eachDayOfInterval({ start, end: intervalEnd });
                                    dates.push(...range);
                                } catch (e) {
                                    dates.push(start);
                                }
                            } else {
                                dates.push(start);
                            }
                        }
                    });
                    setBusyDates(dates);
                }
            } catch (e) {
                console.error("Failed to load availability", e);
            }
        };

        fetchAvailability();
    }, []);

    const footer = (
        <div className="w-full flex justify-between">
            <Button size="lg" variant="outline" onClick={() => setStep(5)}>
                <ArrowLeft className="mr-2" /> Atrás
            </Button>
            <Button size="lg" onClick={() => setStep(7)} disabled={formData.shootDates.length === 0}>
                Continuar <ArrowRight className="ml-2" />
            </Button>
        </div>
    );

    // --- Calendar Logic ---

    const updateDates = (newDates: Date[]) => {
        // Calculate discount based on earliest date
        if (newDates.length === 0) {
            updateForm({ shootDates: [], discount: 0, preferredMonths: [] });
            return;
        }

        // Sort dates to find earliest
        const sorted = [...newDates].sort((a, b) => a.getTime() - b.getTime());
        const earliest = sorted[0];

        const today = startOfToday();
        const diffTime = earliest.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let discount = 0;
        if (diffDays > 21) discount = 13; // > 3 weeks
        else if (diffDays > 14) discount = 8; // > 2 weeks

        updateForm({ shootDates: newDates, discount });
    };

    const handleDayClick = (day: Date, modifiers: any, e: React.MouseEvent) => {
        // e.shiftKey detection might depend on how DayPicker fires the event.
        // We use the event passed by DayPicker.
        const selected = formData.shootDates;
        const isSelected = selected.some(d => isSameDay(d, day));

        // Range Selection (Shift + Click)
        if (e.shiftKey && lastClickedDate && !isSelected) {
            const start = lastClickedDate < day ? lastClickedDate : day;
            const end = lastClickedDate < day ? day : lastClickedDate;

            const range = eachDayOfInterval({ start, end });
            // Merge with existing selected, avoiding duplicates
            const newDates = [...selected];
            range.forEach(d => {
                if (!newDates.some(existing => isSameDay(existing, d))) {
                    newDates.push(d);
                }
            });
            updateDates(newDates);
            setLastClickedDate(day);
            return;
        }

        // Normal Toggle
        let newDates: Date[];
        if (isSelected) {
            newDates = selected.filter(d => !isSameDay(d, day));
        } else {
            newDates = [...selected, day];
        }

        updateDates(newDates);
        setLastClickedDate(day);
    };

    // --- Bulk Tools ---

    const next12Months = Array.from({ length: 12 }, (_, i) => addMonths(startOfToday(), i));

    const toggleMonth = (monthDate: Date) => {
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const daysInMonth = eachDayOfInterval({ start, end }).filter(d => d >= startOfToday()); // Only future

        // Check if all are already selected to determine toggle state (Add/Remove)
        const allSelected = daysInMonth.every(d => formData.shootDates.some(s => isSameDay(s, d)));

        let newDates = [...formData.shootDates];
        if (allSelected) {
            // Remove
            newDates = newDates.filter(d => !daysInMonth.some(m => isSameDay(m, d)));
        } else {
            // Add missing
            daysInMonth.forEach(d => {
                if (!newDates.some(s => isSameDay(s, d))) {
                    newDates.push(d);
                }
            });
        }
        updateDates(newDates);
    };

    const filterWeekends = () => {
        const onlyWeekends = formData.shootDates.filter(d => isWeekend(d));
        updateDates(onlyWeekends);
    };

    const filterWeekdays = () => {
        const onlyWeekdays = formData.shootDates.filter(d => !isWeekend(d));
        updateDates(onlyWeekdays);
    };

    const clearSelection = () => {
        updateDates([]);
    };


    return (
        <StepCard
            title="Presupuesto y Calendario"
            description="Elige tu experiencia de rodaje y reserva tus fechas."
            footerContent={footer}
        >
            <div className="space-y-10">
                {/* 1. Opciones de Rodaje */}
                <div className="space-y-4">
                    <Label className="font-subheadline text-2xl text-white">Opciones de Rodaje</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Standard */}
                        <div
                            className={`border-2 rounded-xl p-6 cursor-pointer transition-all relative ${formData.shootingType === 'standard' ? 'border-white bg-zinc-800' : 'border-zinc-700 hover:border-zinc-500 bg-black'}`}
                            onClick={() => updateForm({ shootingType: 'standard' })}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className={`font-bold text-xl ${formData.shootingType === 'standard' ? 'text-white' : 'text-zinc-300'}`}>Rodaje Standard</h3>
                                {formData.shootingType === 'standard' && <div className="bg-white text-black rounded-full p-1"><Check className="w-4 h-4" /></div>}
                            </div>
                            <p className="text-sm text-zinc-300 mb-6 leading-relaxed font-medium">
                                Rueda tu escena rodead@ de nuestro equipo "Scene Me", compuesto por profesionales del sector que cuentan con una gran trayectoria delante y detrás de cámaras.
                            </p>
                            <div className="font-bold text-lg text-white">Incluido en el precio</div>
                        </div>

                        {/* Premium */}
                        <div
                            className={`border-2 rounded-xl p-6 cursor-pointer transition-all relative overflow-hidden ${formData.shootingType === 'premium' ? 'border-yellow-400 bg-yellow-950/30' : 'border-zinc-700 hover:border-zinc-500 bg-black'}`}
                            onClick={() => updateForm({ shootingType: 'premium' })}
                        >
                            <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] uppercase font-black px-3 py-1 rounded-bl-lg tracking-wider">Recomendado</div>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-xl text-yellow-400 flex items-center gap-2"><Star className="w-5 h-5 fill-yellow-400" /> Premium</h3>
                                {formData.shootingType === 'premium' && <div className="bg-yellow-400 text-black rounded-full p-1"><Check className="w-4 h-4" /></div>}
                            </div>
                            <p className="text-sm text-zinc-300 mb-6 leading-relaxed font-medium">
                                Siéntete como una verdadera estrella. Maquillaje, peluquería, vestuario y catering incluidos. Una experiencia inolvidable.
                            </p>
                            <div className="font-bold text-lg text-yellow-400">+350€</div>
                        </div>
                    </div>
                </div>

                {/* 2. Calendario */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <Label className="font-subheadline text-2xl text-white">Fecha(s) de Rodaje</Label>
                        <a href="mailto:admin@scenemeapp.com?subject=Duda%20sobre%20fechas" className="text-xs text-primary underline hover:text-white transition-colors">
                            ¿Tienes dudas? Contáctanos
                        </a>
                    </div>

                    <div className="bg-blue-600 border border-blue-400 p-5 rounded-lg flex gap-4 items-start shadow-lg shadow-blue-900/20">
                        <Info className="w-6 h-6 text-white shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-white text-lg">Selección Flexible</h4>
                            <p className="text-sm text-blue-50 mt-1 font-medium">
                                Selecciona días sueltos, arrastra o usa las herramientas para marcar meses completos.
                                <br />
                                <strong>Tip:</strong> Usa <code>Shift + Click</code> para seleccionar rangos (primer y último día).
                            </p>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-2 items-center bg-zinc-900/50 p-2 rounded-lg border border-white/10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white">
                                    <CalendarDays className="w-4 h-4 mr-2" />
                                    Añadir Meses Completos
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="max-h-[300px] overflow-y-auto bg-zinc-900 border-zinc-800 text-white">
                                <DropdownMenuLabel>Seleccionar mes entero</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-zinc-800" />
                                {next12Months.map(month => {
                                    const monthLabel = format(month, 'MMMM yyyy', { locale: es });
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={month.toString()}
                                            checked={false} // Always actionable
                                            onCheckedChange={() => toggleMonth(month)}
                                            className="capitalize cursor-pointer hover:bg-zinc-800"
                                        >
                                            {monthLabel}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-6 w-px bg-white/20 mx-2 hidden sm:block"></div>

                        <Button variant="ghost" size="sm" onClick={filterWeekends} className="text-zinc-300 hover:text-white hover:bg-zinc-700/50">
                            Solo Fines de Semana
                        </Button>
                        <Button variant="ghost" size="sm" onClick={filterWeekdays} className="text-zinc-300 hover:text-white hover:bg-zinc-700/50">
                            Solo Laborables
                        </Button>

                        <div className="ml-auto">
                            <Button variant="ghost" size="sm" onClick={clearSelection} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Vaciar
                            </Button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[1fr,300px] gap-8 items-start">
                        <div className="border-2 border-zinc-700 rounded-lg p-4 bg-black shadow-2xl overflow-hidden">
                            <Calendar
                                mode="multiple"
                                selected={formData.shootDates}
                                onDayClick={handleDayClick}
                                disabled={(date) =>
                                    date < startOfToday() ||
                                    busyDates.some(busy => isSameDay(busy, date))
                                }
                                initialFocus
                                className="w-full pointer-events-auto invert-0 text-white flex justify-center"
                                classNames={{
                                    month: "space-y-4 w-full",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex w-full justify-between",
                                    row: "flex w-full mt-2 justify-between",
                                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-zinc-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                }}
                            />
                            <div className="flex flex-wrap justify-center gap-4 mt-6 text-[10px] uppercase tracking-wider font-bold text-zinc-400 border-t border-zinc-800 pt-4">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> {'>'} 2 semanas antelación (-8%)</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {'>'} 3 semanas antelación (-13%)</span>
                            </div>
                        </div>

                        <div className="space-y-4 h-full">
                            {formData.shootDates.length > 0 ? (
                                <div className="h-full flex flex-col justify-start items-center text-center p-6 border-2 border-primary rounded-lg bg-zinc-900 shadow-xl relative overflow-hidden">
                                    <div className="text-4xl mb-4 mt-4">🗓️</div>
                                    <h3 className="text-4xl font-bold text-white mb-2 font-display">
                                        {formData.shootDates.length}
                                    </h3>
                                    <p className="text-zinc-400 text-sm mb-6 uppercase tracking-wider font-bold">Días Seleccionados</p>

                                    <div className="w-full bg-black/40 rounded-lg p-4 text-left max-h-[200px] overflow-y-auto space-y-1 mb-4 border border-white/5">
                                        {[...formData.shootDates].sort((a, b) => a.getTime() - b.getTime()).map((d, i) => (
                                            <div key={i} className="text-xs text-zinc-300 border-b border-white/5 pb-1 last:border-0">
                                                {format(d, "EEEE d MMMM", { locale: es })}
                                            </div>
                                        ))}
                                    </div>

                                    {formData.discount > 0 ? (
                                        <div className="bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 mt-auto">
                                            <span>🏷️</span> ¡Descuento {formData.discount}% aplicado!
                                        </div>
                                    ) : (
                                        <div className="text-xs text-zinc-500 mt-auto">Sin descuento por antelación</div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full min-h-[300px] flex flex-col justify-center items-center text-center p-6 border-2 border-dashed border-zinc-700 rounded-lg text-zinc-500 bg-black/50">
                                    <p className="font-medium max-w-[200px]">Selecciona fechas en el calendario para comprobar disponibilidad.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Price Calc */}
                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/30">
                    <PriceCalc
                        packType={formData.packType}
                        addEditing={formData.addEditing}
                        crewSize={formData.crewSize} // Legacy
                        shootingType={formData.shootingType}
                        discount={formData.discount}
                        dynamic={formData.dynamic}
                        length={formData.length}
                    />
                </div>
            </div>
        </StepCard>
    );
}
