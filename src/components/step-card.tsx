import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StepCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
    footerContent: React.ReactNode;
    className?: string;
}

export function StepCard({ title, description, children, footerContent, className }: StepCardProps) {
    return (
        <Card className={cn("animate-in fade-in duration-500", className)}>
            <CardHeader>
                <CardTitle className="text-xl font-headline tracking-wider">{title}</CardTitle>
                <CardDescription className="text-lg pt-1 text-muted-foreground">{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {children}
            </CardContent>
            <CardFooter>
                {footerContent}
            </CardFooter>
        </Card>
    );
}
