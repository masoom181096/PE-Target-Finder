import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, Edit3, ArrowRight, Loader2, X } from "lucide-react";
import type { RestrictionsPayload } from "@shared/schema";

interface RestrictionsFormProps {
  onSubmit: (payload: RestrictionsPayload) => void;
  isLoading?: boolean;
}

export function RestrictionsForm({ onSubmit, isLoading }: RestrictionsFormProps) {
  const [showTextarea, setShowTextarea] = useState(false);
  const [notes, setNotes] = useState("");

  const handleAutoSubmit = () => {
    onSubmit({ mode: "auto" });
  };

  const handleManualSubmit = () => {
    onSubmit({ mode: "manual", notes: notes.trim() || undefined });
  };

  return (
    <div className="space-y-3" data-testid="restrictions-form">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        <span>Specify macro/micro/fund restrictions or let the agent assess automatically</span>
      </div>
      
      {!showTextarea ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoSubmit}
            disabled={isLoading}
            data-testid="button-auto-assess"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4 mr-2" />
            )}
            Let agent assess automatically
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowTextarea(true)}
            disabled={isLoading}
            data-testid="button-add-restrictions"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            I want to add restrictions
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            placeholder="e.g. Avoid US-sanctioned countries, no investments in Russia/Iran, ESG: no tobacco/alcohol/gambling/defence/fossil fuels..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
            data-testid="textarea-restrictions"
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTextarea(false)}
              disabled={isLoading}
              data-testid="button-back-to-options"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleManualSubmit}
              disabled={isLoading}
              data-testid="button-apply-restrictions"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Apply restrictions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
