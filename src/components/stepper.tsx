'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
    currentStep: number;
    setStep: (step: number) => void;
    steps: string[];
    dark?: boolean;
}

export function Stepper({ currentStep, setStep, steps, dark = false }: StepperProps) {
    return (
        <nav aria-label="Progress">
            <ol className="space-y-3">
                {steps.map((name, index) => (
                    <li key={name}>
                        <Button
                            onClick={() => setStep(index)}
                            variant={currentStep === index ? 'default' : 'secondary'}
                            className={cn(
                                "w-full justify-start text-left h-auto py-4 px-5 transition-all duration-300 font-tag tracking-wider text-base rounded-none border-0",
                                !dark && currentStep === index && 'bg-primary text-black ring-2 ring-primary ring-offset-2',
                                !dark && currentStep !== index && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                                dark && currentStep === index && 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.15)] z-10 border-white',
                                dark && currentStep !== index && 'bg-black text-white/50 hover:text-white hover:bg-zinc-900 border border-technical',
                                currentStep > index && !dark && 'bg-accent/20 text-accent-foreground',
                                currentStep > index && dark && 'bg-zinc-900/40 text-white/70 border-technical'
                            )}
                        >
                            <div className="flex items-center gap-3 relative w-full">
                                {dark && currentStep !== index && (
                                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                                        <div className="w-1.5 h-1.5 border-t border-r border-white" />
                                    </div>
                                )}
                                {currentStep > index ? (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
                                        <Check className="h-4 w-4" />
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded-full border-2",
                                        currentStep === index ? "border-primary-foreground/50" : "border-muted-foreground/50",
                                    )}>
                                        <span className="text-sm font-semibold">{index + 1}</span>
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="font-semibold">{name}</span>
                                </div>
                            </div>
                        </Button>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
