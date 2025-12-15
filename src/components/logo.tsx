import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
    return <div className={cn("w-9 h-9 rounded-lg bg-primary", className)} />;
}
