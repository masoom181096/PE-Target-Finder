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
  onStreamingComplete?: () => void;
}

export function ThinkingPanel({ steps, isProcessing = false, className, onStreamingComplete }: ThinkingPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayedSteps, setDisplayedSteps] = useState<DisplayedStep[]>([]);
  
  // Queue of steps waiting to be streamed
  const [thinkingQueue, setThinkingQueue] = useState<ThinkingStep[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Refs for streaming state to avoid stale closures
  const activeStepIndexRef = useRef(0);
  const activeCharIndexRef = useRef(0);
  const thinkingQueueRef = useRef<ThinkingStep[]>([]);
  const onStreamingCompleteRef = useRef(onStreamingComplete);
  
  // Keep refs in sync
  useEffect(() => {
    thinkingQueueRef.current = thinkingQueue;
  }, [thinkingQueue]);
  
  useEffect(() => {
    onStreamingCompleteRef.current = onStreamingComplete;
  }, [onStreamingComplete]);

  // When new steps come in, add them to the queue
  const processedIdsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const newSteps: ThinkingStep[] = [];
    
    steps.forEach((step) => {
      if (!processedIdsRef.current.has(step.id)) {
        processedIdsRef.current.add(step.id);
        newSteps.push(step);
      }
    });

    if (newSteps.length > 0) {
      setThinkingQueue((prev) => [...prev, ...newSteps]);
      
      // Start streaming if not already
      if (!isStreaming) {
        setIsStreaming(true);
        activeStepIndexRef.current = 0;
        activeCharIndexRef.current = 0;
      }
    }
  }, [steps, isStreaming]);

  // Sequential streaming effect - one character at a time, one step at a time
  useEffect(() => {
    if (!isStreaming) return;
    if (thinkingQueue.length === 0) return;

    const interval = setInterval(() => {
      const queue = thinkingQueueRef.current;
      const stepIndex = activeStepIndexRef.current;
      
      // Check if all steps are done
      if (stepIndex >= queue.length) {
        clearInterval(interval);
        setIsStreaming(false);
        // Notify parent that streaming is complete
        if (onStreamingCompleteRef.current) {
          onStreamingCompleteRef.current();
        }
        return;
      }

      const currentStep = queue[stepIndex];
      const charIndex = activeCharIndexRef.current;

      setDisplayedSteps((prevDisplayed) => {
        let displayed = [...prevDisplayed];
        let displayIndex = displayed.findIndex((d) => d.id === currentStep.id);
        
        // If this step doesn't exist in displayed, add it
        if (displayIndex === -1) {
          displayed.push({
            id: currentStep.id,
            phase: currentStep.phase,
            fullText: currentStep.text,
            shownText: "",
          });
          displayIndex = displayed.length - 1;
        }

        const d = displayed[displayIndex];
        const nextCharIndex = charIndex + 1;
        const nextShown = currentStep.text.slice(0, nextCharIndex);

        displayed[displayIndex] = {
          ...d,
          shownText: nextShown,
        };

        // Check if current step is complete
        if (nextCharIndex >= currentStep.text.length) {
          // Move to next step
          activeStepIndexRef.current += 1;
          activeCharIndexRef.current = 0;
        } else {
          activeCharIndexRef.current = nextCharIndex;
        }

        return displayed;
      });
    }, 50); // Slower speed: 50ms per character

    return () => clearInterval(interval);
  }, [isStreaming, thinkingQueue.length]);

  // Auto-scroll as content updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [displayedSteps]);

  return (
    <div className={cn("flex flex-col h-full bg-card border-l border-border", className)} data-testid="thinking-panel">
      <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/30">
        <Brain className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Agent Thinking
        </h2>
        {(isProcessing || isStreaming) && (
          <Loader2 className="h-3 w-3 animate-spin text-primary ml-auto" />
        )}
      </div>
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-3">
          {displayedSteps.length === 0 ? (
            <div className="text-sm text-muted-foreground italic text-center py-8">
              Agent reasoning will appear here as the conversation progresses...
            </div>
          ) : (
            displayedSteps.map((step, index) => (
              <ThinkingStepItem
                key={step.id}
                step={step}
                isLatest={index === displayedSteps.length - 1}
              />
            ))
          )}
          {isProcessing && !isStreaming && (
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
