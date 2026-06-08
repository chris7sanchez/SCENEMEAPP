'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TagOption } from "@/lib/types";

interface TagGridProps {
    options: TagOption[];
    value: string | string[];
    onChange: (value: any) => void;
    multi?: boolean;
}

export function TagGrid({ options, multi = false, onChange, value }: TagGridProps) {
    const isActive = (optValue: string) => (multi ? Array.isArray(value) && value.includes(optValue) : value === optValue);

    const toggle = (optValue: string) => {
        if (!multi) {
            onChange(optValue);
        } else {
            const newValue = Array.isArray(value) ? value : [];
            if (newValue.includes(optValue)) {
                onChange(newValue.filter((v: string) => v !== optValue));
            } else {
                onChange([...newValue, optValue]);
            }
        }
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {options.map((opt) => {
                const optValue = typeof opt === 'string' ? opt : opt.id;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                return (
                    <Button
                        key={optValue}
                        type="button"
                        variant="outline"
                        onClick={() => toggle(optValue)}
                        style={{
                            backgroundColor: isActive(optValue) ? undefined : 'hsla(220, 30%, 14%, 0.85)',
                            color: isActive(optValue) ? undefined : 'hsl(45, 20%, 92%)',
                            borderColor: isActive(optValue) ? undefined : 'hsla(220, 18%, 35%, 0.5)',
                        }}
                        className={cn(
                            "justify-start text-left h-auto py-2.5 px-3.5 rounded-lg border-2 transition-all duration-200",
                            "font-headline text-base whitespace-normal tracking-wide",
                            isActive(optValue)
                                ? "bg-primary text-black border-primary hover:bg-primary/90"
                                : "hover:!bg-primary/10 hover:!border-primary/60 hover:!text-primary"
                        )}
                    >
                        {optLabel}
                    </Button>
                );
            })}
        </div>
    );
}
