import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StepCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
    footerContent: React.ReactNode;
    className?: string;
    /** Título legible (sin cursiva, fuente headline) para pasos con mucha info. */
    plainTitle?: boolean;
}

export function StepCard({ title, description, children, footerContent, className, plainTitle }: StepCardProps) {
    return (
        <Card
            style={{ backgroundColor: 'hsla(220, 30%, 10%, 0.85)', borderColor: 'hsla(220, 18%, 30%, 0.5)' }}
            className={cn(
                "animate-in fade-in duration-700 backdrop-blur-xl border shadow-2xl overflow-hidden rounded-[2rem]",
                className
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <CardHeader className="pb-3 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-1 md:gap-6">
                    <CardTitle className={cn(
                        "text-foreground shrink-0",
                        plainTitle
                            ? "text-xl font-headline uppercase tracking-wide"
                            : "text-2xl font-display font-black tracking-tight italic"
                    )}>
                        {title}
                    </CardTitle>
                    <CardDescription className="text-sm font-body text-muted-foreground md:text-right md:max-w-md leading-snug">
                        {description}
                    </CardDescription>
                </div>
                <div className="w-20 h-1 bg-primary mt-2 opacity-70 rounded-full" />
            </CardHeader>

            <CardContent className="space-y-4 relative z-10">
                {children}
            </CardContent>

            <CardFooter
                style={{ borderColor: 'hsla(220, 18%, 30%, 0.5)' }}
                className="pt-4 border-t bg-black/30 relative z-10 [&_button]:h-10 [&_button]:px-5 [&_button]:text-sm"
            >
                {footerContent}
            </CardFooter>
        </Card>
    );
}

