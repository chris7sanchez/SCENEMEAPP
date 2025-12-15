import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type FormData } from "@/lib/types";

interface SummaryCardProps {
    formData: FormData;
    dynamicLabel: string;
}

const SummaryItem = ({ label, value }: { label: string; value: string | undefined | null }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col space-y-1 border-b border-border/50 pb-2 last:border-0 last:pb-0">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
            <span className="text-sm font-medium text-foreground break-words leading-tight">{value}</span>
        </div>
    );
};

export function SummaryCard({ formData, dynamicLabel }: SummaryCardProps) {
    const { genre, tones, locations, length, logline } = formData;
    return (
        <Card className="rounded-sm sticky top-24 shadow-sm bg-card text-card-foreground">
            <CardHeader>
                <CardTitle className="text-lg">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <SummaryItem label="Género" value={genre} />
                <SummaryItem label="Reparto" value={dynamicLabel} />
                <SummaryItem label="Tono(s)" value={tones.join(", ")} />
                <SummaryItem label="Ubicaciones" value={locations.join(", ")} />
                <SummaryItem label="Duración" value={`${parseInt(length) / 60} minutos`} />
                {logline && (
                    <>
                        <Separator />
                        <div className="text-sm space-y-1">
                            <span className="text-muted-foreground">Logline:</span>
                            <p className="font-medium text-xs leading-relaxed">{logline}</p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
