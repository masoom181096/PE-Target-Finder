import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, FolderOpen, Trash2, ChevronDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { SavedSession, ConversationState, Phase, ChatMessage, ThinkingStep } from "@shared/schema";
import { phaseLabels } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface SessionManagerProps {
  sessionId: string;
  currentState: ConversationState;
  messages: ChatMessage[];
  thinkingSteps: ThinkingStep[];
  onLoadSession: (session: SavedSession) => void;
}

export function SessionManager({ sessionId, currentState, messages, thinkingSteps, onLoadSession }: SessionManagerProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const { toast } = useToast();

  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery<SavedSession[]>({
    queryKey: ["/api/sessions"],
  });

  const saveMutation = useMutation({
    mutationFn: async (name: string) => {
      const payload = {
        sessionId,
        name,
        phase: currentState.phase,
        fundMandate: currentState.fundMandate,
        scoringWeights: currentState.scoringWeights,
        thresholds: currentState.thresholds,
        shortlist: currentState.shortlist,
        chosenCompanyId: currentState.chosenCompanyId,
        messages,
        thinkingSteps,
      };
      return apiRequest<SavedSession>("POST", "/api/sessions", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setSaveDialogOpen(false);
      setSessionName("");
      toast({
        title: "Session saved",
        description: "Your screening session has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (sessionIdToDelete: string) => {
      return apiRequest("DELETE", `/api/sessions/${sessionIdToDelete}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session deleted",
        description: "The session has been removed.",
      });
    },
  });

  const handleSave = () => {
    if (!sessionName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this session.",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(sessionName.trim());
  };

  const handleLoad = (session: SavedSession) => {
    onLoadSession(session);
    toast({
      title: "Session loaded",
      description: `Loaded "${session.name}" session.`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-save-session">
            <Save className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Session</DialogTitle>
            <DialogDescription>
              Save your current screening configuration to continue later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="session-name">Session Name</Label>
              <Input
                id="session-name"
                placeholder="e.g., Q4 2024 India Tech Screening"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                data-testid="input-session-name"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Current phase: <span className="font-medium">{phaseLabels[currentState.phase]}</span></p>
              {currentState.fundMandate?.fundType && (
                <p>Fund type: <span className="font-medium">{currentState.fundMandate.fundType}</span></p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-confirm-save">
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-load-session">
            <FolderOpen className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Load</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Saved Sessions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoadingSessions ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No saved sessions yet
            </div>
          ) : (
            sessions.map((session) => (
              <DropdownMenuItem
                key={session.id}
                className="flex items-center justify-between p-3 cursor-pointer"
                data-testid={`session-item-${session.id}`}
              >
                <div 
                  className="flex-1 min-w-0"
                  onClick={() => handleLoad(session)}
                >
                  <p className="font-medium truncate">{session.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {phaseLabels[session.phase as Phase]} • {format(new Date(session.updatedAt), "MMM d, yyyy")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(session.sessionId);
                  }}
                  data-testid={`button-delete-session-${session.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
