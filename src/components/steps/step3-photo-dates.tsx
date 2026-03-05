'use client';

import { type FormData } from "@/lib/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { ArrowLeft, ArrowRight, Info, CalendarDays, Trash2, Aperture, Focus } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface Step3PhotoDatesProps {
    formData: FormData;
    updateForm: (data: Partial<FormData>) => void;
    setStep: (step: number) => void;
}

export default function Step3PhotoDates({ formData, updateForm, setStep }: Step3PhotoDatesProps) {
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

                        if (isSameDay(start, end)) {
                            dates.push(start);
                        } else {
                            let intervalEnd = end;
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

    const updateDates = (newDates: Date[]) => {
        if (newDates.length === 0) {
            updateForm({ shootDates: [], discount: 0, preferredMonths: [] });
            return;
        }

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
        const selected = formData.shootDates;
        const isSelected = selected.some(d => isSameDay(d, day));

        if (e.shiftKey && lastClickedDate && !isSelected) {
            const start = lastClickedDate < day ? lastClickedDate : day;
            const end = lastClickedDate < day ? day : lastClickedDate;

            const range = eachDayOfInterval({ start, end });
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

        let newDates: Date[];
        if (isSelected) {
            newDates = selected.filter(d => !isSameDay(d, day));
        } else {
            newDates = [...selected, day];
        }

        updateDates(newDates);
        setLastClickedDate(day);
    };

    const next12Months = Array.from({ length: 12 }, (_, i) => addMonths(startOfToday(), i));

    const toggleMonth = (monthDate: Date) => {
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const daysInMonth = eachDayOfInterval({ start, end }).filter(d => d >= startOfToday());

        const allSelected = daysInMonth.every(d => formData.shootDates.some(s => isSameDay(s, d)));

        let newDates = [...formData.shootDates];
        if (allSelected) {
            newDates = newDates.filter(d => !daysInMonth.some(m => isSameDay(m, d)));
        } else {
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
        <div className="flex flex-col animate-in fade-in duration-700 h-full">

            {/* LAB HEADER */}
            <div className="mb-8 space-y-2">
                <div className="flex items-center gap-3">
                    <span className="bg-white text-black text-[10px] font-black px-3 py-1 uppercase tracking-[0.3em]">Agenda / Reserva</span>
                    <div className="h-px flex-1 bg-white/10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
                    Calendario de <span className="text-zinc-600">Sesión</span>
                </h1>
            </div>

            {/* Main Application Window */}
            <div className="flex flex-col border border-technical bg-studio-matte w-full flex-1 overflow-hidden rounded-sm shadow-2xl relative studio-rim-light">

                {/* Atmospheric Layer: Light Leak */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none animate-light-leak z-0 opacity-40" />

                {/* Background Texture Elements */}
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none z-0">
                    <Aperture className="w-64 h-64 text-white" />
                </div>

                <div className="p-8 md:p-12 lg:p-14 z-10">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* CALENDAR SECTION */}
                        <div className="flex-1 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mr-4">Selección de Fechas</h3>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Elige tus jornadas preferidas para el shooting</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Focus className="w-4 h-4 text-zinc-800" />
                                    <span className="text-[9px] font-mono text-zinc-800">SCAN_AVAILABILITY_ON</span>
                                </div>
                            </div>

                            {/* Toolbar */}
                            <div className="flex flex-wrap gap-2 items-center bg-zinc-950/50 p-3 border border-zinc-900">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white rounded-none font-black text-[10px] tracking-widest uppercase h-10 px-6">
                                            <CalendarDays className="w-4 h-4 mr-3" />
                                            Añadir Mes Completo
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="max-h-[300px] overflow-y-auto bg-black border-zinc-900 text-white rounded-none">
                                        <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest opacity-40">Seleccionar Mes</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                        {next12Months.map(month => {
                                            const monthLabel = format(month, 'MMMM yyyy', { locale: es });
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={month.toString()}
                                                    checked={false}
                                                    onCheckedChange={() => toggleMonth(month)}
                                                    className="capitalize cursor-pointer hover:bg-zinc-900 font-bold text-xs p-3 rounded-none"
                                                >
                                                    {monthLabel}
                                                </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>

                                <Button variant="ghost" size="sm" onClick={filterWeekends} className="text-zinc-500 hover:text-white hover:bg-white/5 font-black text-[10px] tracking-widest uppercase">
                                    Solo Semanas
                                </Button>
                                <Button variant="ghost" size="sm" onClick={filterWeekdays} className="text-zinc-500 hover:text-white hover:bg-white/5 font-black text-[10px] tracking-widest uppercase">
                                    Laborables
                                </Button>

                                <div className="ml-auto">
                                    <Button variant="ghost" size="sm" onClick={clearSelection} className="text-red-900 hover:text-red-500 hover:bg-red-950/20 font-black text-[10px] tracking-widest uppercase">
                                        <Trash2 className="w-3 h-3 mr-2" />
                                        Vaciar
                                    </Button>
                                </div>
                            </div>

                            <div className="border border-zinc-900 p-8 bg-black/40 shadow-inner">
                                <Calendar
                                    mode="multiple"
                                    selected={formData.shootDates}
                                    onDayClick={handleDayClick}
                                    disabled={(date) =>
                                        date < startOfToday() ||
                                        busyDates.some(busy => isSameDay(busy, date))
                                    }
                                    initialFocus
                                    className="w-full flex justify-center"
                                    classNames={{
                                        month: "space-y-6 w-full max-w-2xl mx-auto",
                                        table: "w-full border-collapse space-y-1",
                                        head_row: "flex w-full justify-between items-center mb-4",
                                        head_cell: "text-zinc-800 font-black text-[10px] uppercase tracking-widest w-10 text-center",
                                        row: "flex w-full mt-2 justify-between",
                                        cell: "text-center text-sm p-0 relative w-10 h-10 flex items-center justify-center transition-all",
                                        day: "h-9 w-9 p-0 font-bold aria-selected:opacity-100 hover:bg-white/10 transition-all rounded-none border border-transparent",
                                        day_selected: "bg-white text-black hover:bg-zinc-200 hover:text-black focus:bg-white focus:text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]",
                                        day_today: "bg-zinc-900 text-white",
                                        day_disabled: "text-zinc-800 opacity-20",
                                        nav_button: "hover:bg-white/10 text-zinc-600 hover:text-white transition-colors",
                                        caption: "flex justify-center pt-1 relative items-center mb-8",
                                        caption_label: "text-sm font-black uppercase tracking-[0.3em] text-white italic",
                                    }}
                                />
                                <div className="flex flex-wrap justify-center gap-8 mt-10 text-[9px] uppercase tracking-[0.2em] font-black text-zinc-700 border-t border-zinc-900 pt-6">
                                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-900/40" /> Antelación 2 sem (-8%)</span>
                                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-700/60" /> Antelación 3 sem (-13%)</span>
                                </div>
                            </div>
                        </div>

                        {/* SIDE INFO SECTION */}
                        <div className="w-full lg:w-[320px] shrink-0">
                            {formData.shootDates.length > 0 ? (
                                <div className="h-full flex flex-col p-10 border border-zinc-900 bg-zinc-950 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Info className="w-12 h-12 text-white" />
                                    </div>

                                    <div className="mb-10">
                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-4">Draft Summary</h4>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-7xl font-black text-white italic tracking-tighter leading-none">{formData.shootDates.length}</span>
                                            <span className="text-xl font-black text-zinc-700 uppercase tracking-tighter">Días</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4 mb-10">
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900 pb-2">Selección Temporal</p>
                                        <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-hide">
                                            {[...formData.shootDates].sort((a, b) => a.getTime() - b.getTime()).map((d, i) => (
                                                <div key={i} className="flex justify-between items-center text-[10px] font-bold text-zinc-400 py-1 uppercase tracking-tight">
                                                    <span>{format(d, "EEEE", { locale: es })}</span>
                                                    <span className="text-white">{format(d, "dd/MM", { locale: es })}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        {formData.discount > 0 && (
                                            <div className="bg-white text-black p-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-between shadow-xl">
                                                <span>Ahorro Antelación</span>
                                                <span className="text-sm italic">-{formData.discount}%</span>
                                            </div>
                                        )}
                                        <div className="p-4 bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase leading-relaxed text-center italic">
                                            Confirmación final pendiente de revisión técnica.
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col justify-center items-center text-center p-12 border border-zinc-950 bg-black/50 text-zinc-700">
                                    <div className="w-16 h-16 border-2 border-zinc-900 rounded-full flex items-center justify-center mb-6 opacity-20">
                                        <CalendarDays className="w-6 h-6" />
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed max-w-[200px]">
                                        Selecciona los días para tu sesión en el negativo principal.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER BAR */}
            <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 px-4">
                <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="text-zinc-600 hover:text-white transition-all uppercase font-black text-xs tracking-[0.4em] group"
                >
                    <ArrowLeft className="mr-3 w-4 h-4 transition-transform group-hover:-translate-x-1" /> Volver a Selección
                </Button>

                <div className="flex items-center gap-10">
                    <Button
                        size="lg"
                        onClick={() => setStep(3)}
                        disabled={formData.shootDates.length === 0}
                        className="bg-white text-black hover:bg-zinc-100 font-black tracking-[0.4em] px-14 h-16 rounded-none text-base border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-20 disabled:grayscale group"
                    >
                        CONTINUAR <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
