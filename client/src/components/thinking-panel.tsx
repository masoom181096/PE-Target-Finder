import { useEffect, useRef, useState } from "react";
import { Brain, Loader2 } from "lucide-react";
import type { ThinkingStep, Phase } from "@shared/schema";
import { phaseLabels } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DisplayedStep {
  id: string;
  phase: Phase;
  fullText: string;
  shownText: string;
}

interface ThinkingPanelProps {
  steps: ThinkingStep[];
  isProcessing?: boolean;
  className?: string;
}

export function ThinkingPanel({ steps, isProcessing = false, className }: ThinkingPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleSteps, setVisibleSteps] = useState<DisplayedStep[]>([]);
  const processedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newSteps: DisplayedStep[] = [];
    
    steps.forEach((step) => {
      if (!processedIdsRef.current.has(step.id)) {
        processedIdsRef.current.add(step.id);
        newSteps.push({
          id: step.id,
          phase: step.phase,
          fullText: step.text,
          shownText: "",
        });
      }
    });

    if (newSteps.length > 0) {
      setVisibleSteps((prev) => [...prev, ...newSteps]);
    }
  }, [steps]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleSteps((prev) => {
        let anyUpdated = false;
        const updated = prev.map((step) => {
          if (step.shownText.length < step.fullText.length) {
            anyUpdated = true;
            const nextLen = step.shownText.length + 1;
            return {
              ...step,
              shownText: step.fullText.slice(0, nextLen),
            };
          }
          return step;
        });
        return anyUpdated ? updated : prev;
      });
    }, 15);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [visibleSteps]);

  return (
    <div className={cn("flex flex-col h-full bg-card border-l border-border", className)} data-testid="thinking-panel">
      <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/30">
        <Brain className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Agent Thinking
        </h2>
        {isProcessing && (
          <Loader2 className="h-3 w-3 animate-spin text-primary ml-auto" />
        )}
      </div>
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-3">
          {visibleSteps.length === 0 ? (
            <div className="text-sm text-muted-foreground italic text-center py-8">
              Agent reasoning will appear here as the conversation progresses...
            </div>
          ) : (
            visibleSteps.map((step, index) => (
              <ThinkingStepItem
                key={step.id}
                step={step}
                isLatest={index === visibleSteps.length - 1}
              />
            ))
          )}
          {isProcessing && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border-l-4 border-primary animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="font-mono text-sm text-muted-foreground">
                Processing...
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ThinkingStepItemProps {
  step: DisplayedStep;
  isLatest: boolean;
}

function ThinkingStepItem({ step, isLatest }: ThinkingStepItemProps) {
  const isTyping = step.shownText.length < step.fullText.length;
  
  return (
    <div
      className={cn(
        "p-3 rounded-lg border-l-4 transition-all duration-200",
        isLatest
          ? "bg-primary/5 border-primary"
          : "bg-muted/30 border-muted-foreground/30"
      )}
      data-testid={`thinking-step-${step.id}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-xs font-normal">
          {phaseLabels[step.phase]}
        </Badge>
      </div>
      <p className="font-mono text-sm leading-relaxed text-foreground/80">
        {step.shownText}
        {isTyping && <span className="animate-pulse">|</span>}
      </p>
    </div>
  );
}
