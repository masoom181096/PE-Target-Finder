import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChatWindow } from "@/components/chat-window";
import { ThinkingPanel } from "@/components/thinking-panel";
import { PhaseProgress, PhaseProgressHorizontal } from "@/components/phase-progress";
import { FundMandateForm } from "@/components/fund-mandate-form";
import { RestrictionsForm } from "@/components/restrictions-form";
import { WeightsForm } from "@/components/weights-form";
import { ThresholdsForm } from "@/components/thresholds-form";
import { CountryScreeningCard } from "@/components/country-screening-card";
import { ShortlistCard } from "@/components/shortlist-card";
import { RecommendationsTable } from "@/components/recommendations-table";
import { CompanyComparison } from "@/components/company-comparison";
import { ReportView } from "@/components/report-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { SessionManager } from "@/components/session-manager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, MessageSquare, Brain, RotateCcw, BarChart3 } from "lucide-react";
import type {
  ChatMessage,
  ThinkingStep,
  ConversationState,
  NextRequest,
  NextResponse,
  FundMandate,
  ScoringWeights,
  Thresholds,
  SavedSession,
  ReportTemplate,
  RestrictionsPayload,
} from "@shared/schema";
import { initialConversationState, phaseLabels } from "@shared/schema";
import type { TemplatedReportData } from "@/components/report-view";

function getSessionId(): string {
  let sessionId = localStorage.getItem("pe-finder-session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("pe-finder-session", sessionId);
  }
  return sessionId;
}

export default function Home() {
  const [sessionId] = useState(getSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [state, setState] = useState<ConversationState>(initialConversationState);
  const [report, setReport] = useState<TemplatedReportData | null>(null);
  const [reportTemplate, setReportTemplate] = useState<ReportTemplate>("growth");
  const [mobileTab, setMobileTab] = useState<"chat" | "thinking">("chat");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
  const [companyScores, setCompanyScores] = useState<Array<{
    id: string;
    qualityOfEarningsScore: number;
    financialPerformanceScore: number;
    industryAttractivenessScore: number;
    competitivePositioningScore: number;
    managementGovernanceScore: number;
    operationalEfficiencyScore: number;
    customerMarketDynamicsScore: number;
    productStrengthScore: number;
    exitFeasibilityScore: number;
    scalabilityPotentialScore: number;
  }>>([]);
  const [comparisonView, setComparisonView] = useState<"table" | "chart">("table");
  const [isLoadingScores, setIsLoadingScores] = useState(false);

  const chatMutation = useMutation({
    mutationFn: async (request: NextRequest) => {
      const response = await apiRequest<NextResponse>("POST", "/api/chat/next", request);
      return response;
    },
    onSuccess: (data) => {
      setState(data.state);
      
      data.assistantMessages.forEach((msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      data.thinkingSteps.forEach((step, index) => {
        setTimeout(() => {
          setThinkingSteps((prev) => [...prev, step]);
        }, index * 300);
      });

      if (data.uiHints?.showReportForCompanyId) {
        setSelectedCompanyId(data.uiHints.showReportForCompanyId);
        fetchReport(data.uiHints.showReportForCompanyId, reportTemplate);
      }
    },
  });

  const reportMutation = useMutation({
    mutationFn: async ({ companyId, template }: { companyId: string; template: ReportTemplate }) => {
      const response = await apiRequest<TemplatedReportData>("GET", `/api/report/${companyId}?templateType=${template}`);
      return response;
    },
    onSuccess: (data) => {
      setReport(data);
    },
  });

  const fetchReport = (companyId: string, template: ReportTemplate = reportTemplate) => {
    reportMutation.mutate({ companyId, template });
  };

  const handleTemplateChange = (template: ReportTemplate) => {
    setReportTemplate(template);
    setState((prev) => ({ ...prev, reportTemplate: template }));
    if (selectedCompanyId) {
      fetchReport(selectedCompanyId, template);
    }
  };

  const initializeChat = useCallback(() => {
    chatMutation.mutate({ sessionId });
  }, [sessionId]);

  useEffect(() => {
    if (messages.length === 0 && state.phase === "welcome") {
      initializeChat();
    }
  }, []);

  useEffect(() => {
    if ((state.phase === "shortlist" || state.phase === "comparison") && state.shortlist.length > 0) {
      const ids = state.shortlist.map((c) => c.id).join(",");
      setIsLoadingScores(true);
      fetch(`/api/companies/scores?ids=${ids}`)
        .then((res) => res.json())
        .then((data) => {
          setCompanyScores(data);
          setIsLoadingScores(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoadingScores(false);
        });
    }
  }, [state.phase, state.shortlist]);

  const handleSendMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: "user", text }]);
    chatMutation.mutate({ sessionId, userMessage: text });
  };

  const handleFundMandateSubmit = (data: FundMandate) => {
    const summary = `Fund Type: ${data.fundType}, Size: ${data.fundSize}, Sectors: ${data.sectorsFocus?.join(", ")}, Geography: ${data.geosFocus?.join(", ")}, Deal Size: $${data.dealSizeMin}M-$${data.dealSizeMax}M, Stage: ${data.stage}, Holding: ${data.holdingPeriodYears} years, Risk: ${data.riskAppetite}`;
    setMessages((prev) => [...prev, { role: "user", text: summary }]);
    chatMutation.mutate({
      sessionId,
      userMessage: summary,
      formData: { type: "fundMandate", data },
    });
  };

  const handleRestrictionsSubmit = (payload: RestrictionsPayload) => {
    const summary = payload.mode === "auto" 
      ? "Let agent assess restrictions automatically"
      : `Restrictions: ${payload.notes || "None specified"}`;
    setMessages((prev) => [...prev, { role: "user", text: summary }]);
    chatMutation.mutate({
      sessionId,
      userMessage: summary,
      formData: { type: "restrictions", data: payload },
    });
  };

  const handleContinueToWeights = () => {
    setMessages((prev) => [...prev, { role: "user", text: "Continue to scoring framework" }]);
    chatMutation.mutate({
      sessionId,
      userMessage: "continue",
    });
  };

  const handleContinueToComparison = () => {
    setMessages((prev) => [...prev, { role: "user", text: "Continue to detailed review" }]);
    chatMutation.mutate({
      sessionId,
      userMessage: "review",
    });
  };

  const handleWeightsSubmit = (data: ScoringWeights) => {
    const summary = "Scoring weights configured and submitted.";
    setMessages((prev) => [...prev, { role: "user", text: summary }]);
    chatMutation.mutate({
      sessionId,
      userMessage: summary,
      formData: { type: "weights", data },
    });
  };

  const handleThresholdsSubmit = (data: Thresholds) => {
    const summary = `Thresholds set: Recurring Revenue ≥${data.recurringRevenueMin}%, Debt/EBITDA ≤${data.debtToEbitdaMax}x, Revenue Growth ≥${data.revenueGrowthMin}%, FCF Conversion ≥${data.fcfConversionMin}%`;
    setMessages((prev) => [...prev, { role: "user", text: summary }]);
    chatMutation.mutate({
      sessionId,
      userMessage: summary,
      formData: { type: "thresholds", data },
    });
  };

  const handleGenerateReport = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const company = state.shortlist.find((c) => c.id === companyId);
    const message = `Generate detailed investment memo for ${company?.name}`;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    chatMutation.mutate({
      sessionId,
      userMessage: message,
      formData: { type: "chooseCompany", data: { companyId } },
    });
  };

  const handleNewSession = () => {
    localStorage.removeItem("pe-finder-session");
    window.location.reload();
  };

  const handleBackFromReport = () => {
    setReport(null);
  };

  const handleLoadSession = (session: SavedSession) => {
    const loadedState: ConversationState = {
      phase: session.phase as ConversationState["phase"],
      fundMandate: (session.fundMandate as FundMandate) || {},
      restrictions: initialConversationState.restrictions,
      scoringWeights: (session.scoringWeights as ScoringWeights) || initialConversationState.scoringWeights,
      thresholds: (session.thresholds as Thresholds) || initialConversationState.thresholds,
      subParamPreferences: initialConversationState.subParamPreferences,
      shortlist: (session.shortlist as ConversationState["shortlist"]) || [],
      chosenCompanyId: session.chosenCompanyId || undefined,
      reportTemplate: initialConversationState.reportTemplate,
    };
    setState(loadedState);
    localStorage.setItem("pe-finder-session", session.sessionId);
    
    const savedMessages = (session.messages as ChatMessage[]) || [];
    const savedThinkingSteps = (session.thinkingSteps as ThinkingStep[]) || [];
    
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    } else {
      setMessages([{ role: "assistant", text: `Session "${session.name}" loaded. You're at the ${phaseLabels[loadedState.phase]} phase. Continue from where you left off.` }]);
    }
    
    if (savedThinkingSteps.length > 0) {
      setThinkingSteps(savedThinkingSteps);
    } else {
      setThinkingSteps([{ id: crypto.randomUUID(), phase: loadedState.phase, text: `Restored session: ${session.name}` }]);
    }
  };

  const isProcessing = chatMutation.isPending || reportMutation.isPending;
  const currentPhase = state?.phase ?? "welcome";

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case "fundMandate":
        return (
          <div className="py-4">
            <FundMandateForm onSubmit={handleFundMandateSubmit} isLoading={isProcessing} />
          </div>
        );
      case "countryScreening":
        return (
          <div className="py-4">
            <CountryScreeningCard onContinue={handleContinueToWeights} isLoading={isProcessing} />
          </div>
        );
      case "weights":
        return (
          <div className="py-4">
            <WeightsForm
              onSubmit={handleWeightsSubmit}
              isLoading={isProcessing}
              initialWeights={state.scoringWeights}
            />
          </div>
        );
      case "thresholds":
        return (
          <div className="py-4">
            <ThresholdsForm
              onSubmit={handleThresholdsSubmit}
              isLoading={isProcessing}
              initialThresholds={state.thresholds}
            />
          </div>
        );
      case "shortlist":
        return (
          <div className="py-4">
            <ShortlistCard
              companies={state.shortlist}
              onContinue={handleContinueToComparison}
              isLoading={isProcessing}
            />
          </div>
        );
      case "comparison":
        return (
          <div className="py-4 space-y-4">
            <div className="flex justify-center">
              <Tabs value={comparisonView} onValueChange={(v) => setComparisonView(v as "table" | "chart")} className="w-full max-w-md">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="table" data-testid="tab-table-view">
                    Table View
                  </TabsTrigger>
                  <TabsTrigger value="chart" data-testid="tab-chart-view">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Compare
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {comparisonView === "table" ? (
              <RecommendationsTable
                companies={state.shortlist}
                onGenerateReport={handleGenerateReport}
                isLoading={isProcessing}
                selectedCompanyId={selectedCompanyId}
              />
            ) : (
              <div className="space-y-6">
                <CompanyComparison
                  companies={state.shortlist}
                  companyDetails={companyScores}
                  isLoading={isLoadingScores}
                />
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setComparisonView("table")}
                    data-testid="button-back-to-table"
                  >
                    Back to Table to Select Company
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (report) {
    return (
      <div className="h-screen bg-background">
        <ReportView 
          report={report} 
          onBack={handleBackFromReport} 
          className="h-full"
          selectedTemplate={reportTemplate}
          onTemplateChange={handleTemplateChange}
          companyId={selectedCompanyId}
          thresholds={state.thresholds}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="home-page">
      <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Target className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">PE Target Finder</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Deal Sourcing</p>
          </div>
        </div>

        <div className="hidden md:block flex-1 max-w-md mx-4">
          <PhaseProgressHorizontal currentPhase={currentPhase} />
        </div>

        <div className="flex items-center gap-2">
          <SessionManager
            sessionId={sessionId}
            currentState={state}
            messages={messages}
            thinkingSteps={thinkingSteps}
            onLoadSession={handleLoadSession}
          />
          <Button variant="ghost" size="sm" onClick={handleNewSession} data-testid="button-new-session">
            <RotateCcw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New</span>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="md:hidden px-4 py-2 border-b border-border bg-muted/30">
        <PhaseProgressHorizontal currentPhase={currentPhase} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-muted/30 p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Workflow Progress
          </h2>
          <PhaseProgress currentPhase={currentPhase} className="flex-1" />
        </aside>

        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
            <ChatWindow
              messages={messages}
              isProcessing={isProcessing}
              inputDisabled={currentPhase !== "welcome" && currentPhase !== "countryScreening" && currentPhase !== "restrictions"}
              inputPlaceholder={
                currentPhase === "countryScreening"
                  ? "Type 'continue' to proceed..."
                  : currentPhase === "restrictions"
                  ? "Or type your restrictions here..."
                  : "Type a message..."
              }
              onSendMessage={
                currentPhase === "welcome" || currentPhase === "countryScreening" || currentPhase === "restrictions"
                  ? handleSendMessage
                  : undefined
              }
              aboveInputPanel={
                currentPhase === "restrictions" ? (
                  <RestrictionsForm onSubmit={handleRestrictionsSubmit} isLoading={isProcessing} />
                ) : undefined
              }
              className="flex-1"
            >
              {renderPhaseContent()}
            </ChatWindow>
          </div>

          <aside className="hidden lg:flex w-96 flex-col border-l border-border">
            <ThinkingPanel steps={thinkingSteps} isProcessing={isProcessing} className="flex-1" />
          </aside>

          <div className="flex lg:hidden flex-1 flex-col overflow-hidden">
            <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "chat" | "thinking")} className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-2 grid grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-2" data-testid="tab-chat">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="thinking" className="flex items-center gap-2" data-testid="tab-thinking">
                  <Brain className="h-4 w-4" />
                  Thinking
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="flex-1 overflow-hidden m-0">
                <ChatWindow
                  messages={messages}
                  isProcessing={isProcessing}
                  inputDisabled={currentPhase !== "welcome" && currentPhase !== "countryScreening" && currentPhase !== "restrictions"}
                  inputPlaceholder={
                    currentPhase === "countryScreening"
                      ? "Type 'continue' to proceed..."
                      : currentPhase === "restrictions"
                      ? "Or type your restrictions here..."
                      : "Type a message..."
                  }
                  onSendMessage={
                    currentPhase === "welcome" || currentPhase === "countryScreening" || currentPhase === "restrictions"
                      ? handleSendMessage
                      : undefined
                  }
                  aboveInputPanel={
                    currentPhase === "restrictions" ? (
                      <RestrictionsForm onSubmit={handleRestrictionsSubmit} isLoading={isProcessing} />
                    ) : undefined
                  }
                  className="h-full"
                >
                  {renderPhaseContent()}
                </ChatWindow>
              </TabsContent>
              <TabsContent value="thinking" className="flex-1 overflow-hidden m-0">
                <ThinkingPanel steps={thinkingSteps} isProcessing={isProcessing} className="h-full" />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
