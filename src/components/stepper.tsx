'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
    currentStep: number;
    setStep: (step: number) => void;
    steps: string[];
}

export function Stepper({ currentStep, setStep, steps }: StepperProps) {
    return (
        <nav aria-label="Progress">
            <ol className="space-y-3">
                {steps.map((name, index) => (
                    <li key={name}>
                        <Button
                            onClick={() => setStep(index)}
                            variant={currentStep === index ? 'default' : 'secondary'}
                            className={cn(
                                "w-full justify-start text-left h-auto py-3 px-4 transition-all duration-200 font-tag tracking-wider text-base",
                                currentStep > index && 'bg-accent/20 text-accent-foreground border-accent',
                                currentStep === index && 'ring-2 ring-primary ring-offset-2',
                            )}
                        >
                            <div className="flex items-center gap-3">
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
