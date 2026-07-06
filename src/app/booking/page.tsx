'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function BookingContent() {
    const searchParams = useSearchParams();
    const defaultService = searchParams.get('service') || 'book';
    const [serviceType, setServiceType] = useState(defaultService);

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState<string | null>(null);
    const [step, setStep] = useState(1); // 1: Date/Time, 2: Details, 3: Success
    const [duration, setDuration] = useState<60 | 120>(60);

    // Huecos libres reales, leídos del calendario de Google
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);

    // Datos del cliente
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const toDateStr = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const loadSlots = useCallback(async (d: Date, dur: number) => {
        setLoadingSlots(true);
        setSlotsError(null);
        setTimeSlots([]);
        try {
            const res = await fetch(`/api/bookings/slots?date=${toDateStr(d)}&duration=${dur}`);
            const json = await res.json();
            if (!json.success) throw new Error(json.error);
            setTimeSlots(json.slots);
        } catch {
            setSlotsError('No se pudo consultar la disponibilidad. Reintenta en un momento.');
        } finally {
            setLoadingSlots(false);
        }
    }, []);

    useEffect(() => {
        if (date) loadSlots(date, duration);
    }, [date, duration, loadSlots]);

    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate);
        setTime(null); // Reset time when date changes
    };

    const handleNext = () => {
        if (date && time) setStep(2);
    };

    const formValid = firstName.trim() && email.includes('@') && phone.trim();

    const handleConfirm = async () => {
        if (!date || !time || !formValid || sending) return;
        setSending(true);
        setSendError(null);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${firstName.trim()} ${lastName.trim()}`.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    service: serviceType,
                    date: toDateStr(date),
                    time,
                    duration,
                }),
            });
            const json = await res.json();
            if (!json.success) {
                if (res.status === 409) {
                    setStep(1);
                    setTime(null);
                    loadSlots(date, duration);
                }
                throw new Error(json.error || 'Error desconocido');
            }
            setStep(3);
        } catch (err: any) {
            setSendError(err.message || 'No se pudo enviar la solicitud.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>

            <div className="max-w-4xl w-full relative z-10">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/creator" className="flex items-center text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                    </Link>
                    <div className="text-right">
                        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-wider text-white">
                            Reserva tu <span className="text-primary">Sesión</span>
                        </h1>
                        <p className="text-zinc-500 text-xs md:text-sm font-bold uppercase tracking-widest">
                            Book Actoral & Self-Tapes
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Calendar & Time */}
                    <div className="lg:col-span-2 space-y-6">
                        {step === 1 && (
                            <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Calendar Card */}
                                <Card className="bg-zinc-900/50 border-zinc-800 flex-1">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <CalendarIcon className="w-5 h-5 text-primary" />
                                            Selecciona Fecha
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 flex justify-center pb-4">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={handleDateSelect}
                                            className="rounded-md border-none text-white"
                                            classNames={{
                                                day_selected: "bg-primary text-black hover:bg-primary/90 focus:bg-primary/90",
                                                day_today: "bg-zinc-800 text-white",
                                            }}
                                            disabled={(date) => date < new Date()}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Time Slots */}
                                <Card className="bg-zinc-900/50 border-zinc-800 w-full md:w-48 shrink-0">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-primary" />
                                            Hora
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2 pb-2 border-b border-zinc-800">
                                            {[60, 120].map((d) => (
                                                <Button
                                                    key={d}
                                                    size="sm"
                                                    variant={duration === d ? "default" : "outline"}
                                                    className={duration === d
                                                        ? "bg-white text-black hover:bg-zinc-200 font-bold"
                                                        : "bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800"}
                                                    onClick={() => { setDuration(d as 60 | 120); setTime(null); }}
                                                >
                                                    {d === 60 ? '1 h' : '2 h'}
                                                </Button>
                                            ))}
                                        </div>
                                        {loadingSlots && <p className="text-zinc-500 text-xs text-center py-4">Consultando agenda…</p>}
                                        {slotsError && <p className="text-red-400 text-xs text-center py-4">{slotsError}</p>}
                                        {!loadingSlots && !slotsError && timeSlots.length === 0 && (
                                            <p className="text-zinc-500 text-xs text-center py-4">Sin huecos libres este día. Prueba otra fecha.</p>
                                        )}
                                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                                        {timeSlots.map((slot) => (
                                            <Button
                                                key={slot}
                                                variant={time === slot ? "default" : "outline"}
                                                className={`w-full justify-center font-bold ${time === slot
                                                        ? "bg-primary text-black hover:bg-primary/90 border-primary"
                                                        : "bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                                    }`}
                                                onClick={() => setTime(slot)}
                                            >
                                                {slot}
                                            </Button>
                                        ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {step === 2 && (
                            <Card className="bg-zinc-900/50 border-zinc-800 animate-in fade-in slide-in-from-right-4 duration-500">
                                <CardHeader>
                                    <CardTitle className="text-white">Tus Datos</CardTitle>
                                    <CardDescription className="text-zinc-400">Completa la información para confirmar la reserva.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-300">Nombre</Label>
                                            <Input placeholder="Tu nombre" value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-zinc-950 border-zinc-800 text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-300">Apellido</Label>
                                            <Input placeholder="Tu apellido" value={lastName} onChange={e => setLastName(e.target.value)} className="bg-zinc-950 border-zinc-800 text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Email</Label>
                                        <Input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-zinc-950 border-zinc-800 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Teléfono</Label>
                                        <Input type="tel" placeholder="+34 600 000 000" value={phone} onChange={e => setPhone(e.target.value)} className="bg-zinc-950 border-zinc-800 text-white" />
                                    </div>
                                    {sendError && <p className="text-red-400 text-sm">{sendError}</p>}
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Tipo de Sesión</Label>
                                        <Select
                                            value={serviceType}
                                            onValueChange={setServiceType}
                                        >
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                                                <SelectValue placeholder="Selecciona servicio" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                                <SelectItem value="book">Book Actoral Completo</SelectItem>
                                                <SelectItem value="selftape">Sesión Self-Tape</SelectItem>
                                                <SelectItem value="packtor">Packtor Pro (Completo)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card className="bg-zinc-900/50 border-zinc-800 animate-in zoom-in duration-500 flex flex-col items-center justify-center p-12 text-center h-full">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">¡Solicitud Enviada!</h2>
                                <p className="text-zinc-400 max-w-md mx-auto mb-8">
                                    Hemos recibido tu solicitud de reserva para el <strong>{date?.toLocaleDateString()}</strong> a las <strong>{time}</strong>.
                                    <br /><br />
                                    Está pendiente de confirmación: recibirás un email en cuanto quede confirmada.
                                </p>
                                <Button asChild className="bg-white text-black hover:bg-zinc-200 font-bold">
                                    <Link href="/creator">VOLVER AL INICIO</Link>
                                </Button>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Summary & Actions */}
                    {step < 3 && (
                        <div className="space-y-6">
                            <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-white uppercase tracking-wider text-lg">Resumen</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                        <span className="text-zinc-400 text-sm">Servicio</span>
                                        <span className="text-white font-bold uppercase text-sm">
                                            {serviceType === 'book' ? 'Book Actoral' : serviceType === 'selftape' ? 'Self-Tape' : 'Packtor'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                        <span className="text-zinc-400 text-sm">Fecha</span>
                                        <span className="text-white font-bold text-sm">
                                            {date ? date.toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                        <span className="text-zinc-400 text-sm">Hora</span>
                                        <span className="text-white font-bold text-sm">
                                            {time ? `${time} (${duration === 60 ? '1 h' : '2 h'})` : '-'}
                                        </span>
                                    </div>

                                    <div className="pt-4">
                                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                                            <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Nota Importante</p>
                                            <p className="text-zinc-400 text-[10px] leading-relaxed">
                                                Esta es una solicitud de reserva. La confirmación definitiva se realizará tras verificar disponibilidad y abonar la señal.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-6 pt-0 mt-auto">
                                    {step === 1 ? (
                                        <Button
                                            className="w-full bg-primary text-black hover:bg-primary/90 font-black tracking-widest h-12"
                                            disabled={!date || !time}
                                            onClick={handleNext}
                                        >
                                            CONTINUAR
                                        </Button>
                                    ) : (
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                                onClick={() => setStep(1)}
                                            >
                                                ATRÁS
                                            </Button>
                                            <Button
                                                className="flex-[2] bg-primary text-black hover:bg-primary/90 font-black tracking-widest"
                                                onClick={handleConfirm}
                                                disabled={!formValid || sending}
                                            >
                                                {sending ? 'ENVIANDO…' : 'CONFIRMAR'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Cargando...</div>}>
            <BookingContent />
        </Suspense>
    );
}
