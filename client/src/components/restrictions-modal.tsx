import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldCheck, Edit3, Loader2 } from "lucide-react";
import type { RestrictionsPayload } from "@shared/schema";

interface RestrictionsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: RestrictionsPayload) => void;
  isLoading?: boolean;
}

export function RestrictionsModal({ open, onClose, onSave, isLoading }: RestrictionsModalProps) {
  const [mode, setMode] = useState<"choice" | "manual">("choice");
  const [notes, setNotes] = useState("");

  const handleAutoAssess = () => {
    onSave({ mode: "auto" });
  };

  const handleManualSubmit = () => {
    onSave({ mode: "manual", notes: notes.trim() || undefined });
  };

  const handleClose = () => {
    if (!isLoading) {
      setMode("choice");
      setNotes("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]" data-testid="restrictions-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Investment Restrictions
          </DialogTitle>
          <DialogDescription>
            Specify any macro, micro, or fund-level restrictions before proceeding to country screening.
          </DialogDescription>
        </DialogHeader>

        {mode === "choice" ? (
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              You can let the agent automatically assess restrictions based on your fund mandate, 
              or manually specify constraints such as sanctioned countries, ESG exclusions, or sector limitations.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={handleAutoAssess}
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
                className="justify-start"
                onClick={() => setMode("manual")}
                disabled={isLoading}
                data-testid="button-add-restrictions"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                I want to add restrictions
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restrictions-notes">Restriction Notes</Label>
              <Textarea
                id="restrictions-notes"
                placeholder="e.g. Avoid US-sanctioned countries, no investments in Russia/Iran, ESG: no tobacco/alcohol/gambling/defence/fossil fuels..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
                data-testid="textarea-restrictions"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            data-testid="button-cancel-restrictions"
          >
            Cancel
          </Button>
          
          {mode === "manual" && (
            <Button
              onClick={handleManualSubmit}
              disabled={isLoading}
              data-testid="button-save-restrictions"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save & Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
