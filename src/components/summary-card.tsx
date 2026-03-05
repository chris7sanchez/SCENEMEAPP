import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type FormData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Camera, Clapperboard, Calendar } from "lucide-react";

interface SummaryCardProps {
    formData: FormData;
    dynamicLabel: string;
}

const SummaryItem = ({ label, value, dark = false }: { label: string; value: string | undefined | null; dark?: boolean }) => {
    if (!value) return null;
    return (
        <div className={cn(
            "flex flex-col space-y-1 border-b pb-3 last:border-0 last:pb-0",
            dark ? "border-zinc-800" : "border-border/50"
        )}>
            <span className={cn(
                "text-[10px] uppercase tracking-[0.2em] font-black",
                dark ? "text-zinc-400" : "text-muted-foreground"
            )}>{label}</span>
            <span className={cn(
                "text-sm font-bold uppercase tracking-tight break-words leading-tight",
                dark ? "text-white" : "text-foreground"
            )}>{value}</span>
        </div>
    );
};

export function SummaryCard({ formData, dynamicLabel }: SummaryCardProps) {
    const { genre, tones, locations, length, logline, serviceType, photoType, photoPack, shootDates } = formData;
    const isPhoto = serviceType === 'photo';

    return (
        <Card className={cn(
            "rounded-none border-t-2 sticky top-24 transition-all duration-500 shadow-2xl relative overflow-hidden",
            isPhoto
                ? "bg-black border-white text-phosphor shadow-[0_20px_60px_rgba(0,0,0,0.8)] studio-rim-light"
                : "bg-card border-primary text-card-foreground"
        )}>
            {isPhoto && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl pointer-events-none" />}
            <CardHeader className="pb-4 relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter italic">Resumen</CardTitle>
                    {isPhoto ? <Camera className="w-5 h-5 text-zinc-500" /> : <Clapperboard className="w-5 h-5 text-primary/50" />}
                </div>
                {/* Subtle photography detail for photo: Viewfinder scale */}
                {isPhoto && (
                    <div className="absolute bottom-1 left-0 w-full h-[2px] flex gap-1 px-4 opacity-20">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className={cn("h-full bg-white", i % 5 === 0 ? "w-[2px]" : "w-[1px]")} />
                        ))}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {isPhoto ? (
                    <>
                        <SummaryItem
                            label="Servicio"
                            value="Photography Book"
                            dark
                        />
                        <SummaryItem
                            label="Estilo"
                            value={
                                photoType === 'actor' ? 'Book Actoral' :
                                    photoType === 'editorial' ? 'Book Editorial' :
                                        photoType === 'conceptual' ? 'Book Conceptual' : 'Personalizado'
                            }
                            dark
                        />
                        <SummaryItem
                            label="Nivel / Pack"
                            value={photoPack ? (photoPack.charAt(0).toUpperCase() + photoPack.slice(1)) : 'Pendiente'}
                            dark
                        />
                        <SummaryItem
                            label="Fechas"
                            value={shootDates && shootDates.length > 0
                                ? `${shootDates.length} jornada(s) reservada(s)`
                                : 'Sin fecha asignada'}
                            dark
                        />
                        <div className="pt-2">
                            <div className="bg-zinc-900/50 border border-zinc-800 p-3 flex flex-col items-center justify-center text-center gap-1">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Estado Reserva</span>
                                <span className="text-[10px] font-bold text-white uppercase italic">Draft / Pre-Selection</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <SummaryItem label="Género" value={genre} />
                        <SummaryItem label="Reparto" value={dynamicLabel} />
                        <SummaryItem label="Tono(s)" value={tones.join(", ")} />
                        <SummaryItem label="Ubicaciones" value={locations.join(", ")} />
                        <SummaryItem label="Duración Estimada" value={`${length} minutos`} />
                        {logline && (
                            <>
                                <Separator className="bg-primary/10" />
                                <div className="text-sm space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Sinopsis / Logline</span>
                                    <p className="font-medium text-xs leading-relaxed italic">"{logline}"</p>
                                </div>
                            </>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
