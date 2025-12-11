import { Check, Circle, Loader2 } from "lucide-react";
import type { Phase } from "@shared/schema";
import { phaseLabels, phaseOrder } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PhaseProgressProps {
  currentPhase: Phase;
  className?: string;
}

export function PhaseProgress({ currentPhase, className }: PhaseProgressProps) {
  const currentIndex = phaseOrder.indexOf(currentPhase);

  return (
    <div className={cn("flex flex-col", className)} data-testid="phase-progress">
      {phaseOrder.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <div key={phase} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-primary animate-pulse",
                  isUpcoming && "border-muted bg-background text-muted-foreground"
                )}
                data-testid={`phase-indicator-${phase}`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
              {index < phaseOrder.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-8 transition-colors duration-300",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
            <div className="pt-1">
              <span
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  isCompleted && "text-foreground",
                  isCurrent && "text-primary font-semibold",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {phaseLabels[phase]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PhaseProgressHorizontal({ currentPhase, className }: PhaseProgressProps) {
  const currentIndex = phaseOrder.indexOf(currentPhase);

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto pb-2", className)} data-testid="phase-progress-horizontal">
      {phaseOrder.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={phase} className="flex items-center gap-2 flex-shrink-0">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all duration-300",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
            </div>
            {isCurrent && (
              <span className="text-xs font-medium text-primary whitespace-nowrap">
                {phaseLabels[phase]}
              </span>
            )}
            {index < phaseOrder.length - 1 && (
              <div
                className={cn(
                  "w-4 h-0.5 transition-colors duration-300",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
