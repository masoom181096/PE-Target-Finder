import { randomUUID } from "crypto";
import type {
  Phase,
  ConversationState,
  ThinkingStep,
  AssistantMessage,
  NextResponse,
  FundMandate,
  ScoringWeights,
  Thresholds,
} from "@shared/schema";
import { initialConversationState, defaultScoringWeights, defaultThresholds } from "@shared/schema";
import { scoreAndRankCompanies } from "./scoring";

const sessions = new Map<string, ConversationState>();

export function getOrCreateSession(sessionId: string): ConversationState {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { ...initialConversationState });
  }
  return sessions.get(sessionId)!;
}

export function updateSession(sessionId: string, state: ConversationState): void {
  sessions.set(sessionId, state);
}

function createThinkingStep(phase: Phase, text: string): ThinkingStep {
  return { id: randomUUID(), phase, text };
}

function createAssistantMessage(text: string): AssistantMessage {
  return { role: "assistant", text };
}

export function processWelcome(sessionId: string): NextResponse {
  const state = getOrCreateSession(sessionId);
  state.phase = "fundMandate";
  updateSession(sessionId, state);

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        "Hi, I'm your PE Target Finder Agent. I'll guide you through a structured screening process to identify and evaluate potential investment targets.\n\nLet's start by capturing your fund mandate. Please fill out the form below with your fund parameters."
      ),
    ],
    thinkingSteps: [
      createThinkingStep("welcome", "Initializing PE screening session..."),
      createThinkingStep("welcome", "Loading target company database from Pitchbook, Crunchbase, and Refinitiv..."),
      createThinkingStep("fundMandate", "Preparing to capture fund mandate parameters..."),
    ],
  };
}

function getOptionLabel(sel?: { value: string; otherText?: string }): string {
  if (!sel) return "";
  return sel.value === "Other" && sel.otherText ? sel.otherText : sel.value;
}

export function processFundMandate(sessionId: string, mandate: FundMandate): NextResponse {
  const state = getOrCreateSession(sessionId);
  state.fundMandate = mandate;
  state.phase = "countryScreening";
  updateSession(sessionId, state);

  // Handle both legacy string fields and new OptionSelection fields
  const fundTypeLabel = typeof mandate.fundType === 'string' 
    ? mandate.fundType 
    : getOptionLabel(mandate.fundType) || "Growth";
  
  const sectors = mandate.sectorsFocus?.join(", ") 
    || mandate.sectorFocus?.map(s => getOptionLabel(s)).join(", ") 
    || "Technology";
  
  const geos = mandate.geosFocus?.join(", ") 
    || mandate.geographicFocus?.map(g => getOptionLabel(g)).join(", ") 
    || "India, Singapore";
  
  const dealMin = mandate.dealSizeMin ?? mandate.dealSizeRange?.min ?? 10;
  const dealMax = mandate.dealSizeMax ?? mandate.dealSizeRange?.max ?? 50;
  const dealSize = `$${dealMin}M - $${dealMax}M`;
  
  const riskLabel = typeof mandate.riskAppetite === 'string' 
    ? mandate.riskAppetite 
    : getOptionLabel(mandate.riskAppetite) || "Medium";

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        `Got it. You're a ${fundTypeLabel.replace("-", " ")} fund focused on ${sectors} in ${geos}, with ticket size ${dealSize} and ${riskLabel} risk appetite.\n\nI'll now screen countries based on macro and regulatory factors. Based on your mandate, I'm focusing on India and Singapore as the primary target markets.`
      ),
      createAssistantMessage(
        "I've completed the country screening. Both India and Singapore meet your criteria:\n\n- India: Strong market size ($3.2T GDP), mature tech ecosystem, 25%+ growth in target sectors\n- Singapore: Excellent regulatory environment, regional hub status, strong capital markets access\n\nReply 'continue' to proceed to the scoring framework configuration."
      ),
    ],
    thinkingSteps: [
      createThinkingStep("fundMandate", "Capturing core fund mandate parameters..."),
      createThinkingStep("fundMandate", `Mapping deal size ${dealSize} to fund size to estimate feasible targets...`),
      createThinkingStep("countryScreening", "Querying macro indicators from Refinitiv and Capital IQ..."),
      createThinkingStep("countryScreening", "Evaluating India: market size, tech ecosystem depth, regulatory risk, FX volatility..."),
      createThinkingStep("countryScreening", "Evaluating Singapore: legal system strength, capital markets depth, ease of doing business..."),
      createThinkingStep("countryScreening", "Both markets pass initial screening criteria. Proceeding to weights configuration..."),
    ],
  };
}

export function processCountryScreening(sessionId: string): NextResponse {
  const state = getOrCreateSession(sessionId);
  state.phase = "weights";
  state.scoringWeights = defaultScoringWeights;
  updateSession(sessionId, state);

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        "Now let's configure your scoring framework. I'll use these 10 parameters to evaluate and rank target companies:\n\n1. Quality of Earnings\n2. Financial Performance\n3. Industry Attractiveness\n4. Competitive Positioning\n5. Management & Governance\n6. Operational Efficiency\n7. Customer & Market Dynamics\n8. Product Strength\n9. Exit Feasibility\n10. Scalability Potential\n\nAdjust the weights below to reflect what matters most to your fund. The total must equal 100."
      ),
    ],
    thinkingSteps: [
      createThinkingStep("weights", "Initializing scoring framework for target companies..."),
      createThinkingStep("weights", "Loading default weight distribution (10 points each)..."),
      createThinkingStep("weights", "Balancing weights across earnings quality, growth, competitive positioning, and exit feasibility..."),
    ],
  };
}

export function processWeights(sessionId: string, weights: ScoringWeights): NextResponse {
  const state = getOrCreateSession(sessionId);
  state.scoringWeights = weights;
  state.phase = "thresholds";
  state.thresholds = defaultThresholds;
  updateSession(sessionId, state);

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        "Scoring weights configured. Now let's set your hard filters — companies that don't meet these thresholds will be excluded from the shortlist.\n\nPlease configure your minimum and maximum thresholds for key financial metrics below."
      ),
    ],
    thinkingSteps: [
      createThinkingStep("weights", "Validating scoring weights sum to 100..."),
      createThinkingStep("weights", "Weights applied successfully. Framework ready for screening."),
      createThinkingStep("thresholds", "Preparing threshold configuration for hard filters..."),
      createThinkingStep("thresholds", "Loading default thresholds based on fund mandate parameters..."),
    ],
  };
}

export function processThresholds(sessionId: string, thresholds: Thresholds): NextResponse {
  const state = getOrCreateSession(sessionId);
  state.thresholds = thresholds;
  
  const shortlist = scoreAndRankCompanies(state.scoringWeights, state.thresholds);
  state.shortlist = shortlist;
  state.phase = "shortlist";
  updateSession(sessionId, state);

  const shortlistSummary = shortlist
    .map((c) => `• Rank ${c.rank}: ${c.name} (${c.country}) — Score: ${c.score}/100`)
    .join("\n");

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        `I've applied your thresholds and screened the universe of companies. Here are the three that best match your mandate:\n\n${shortlistSummary}\n\nReview the detailed profiles below and click "Generate Report" on the company you'd like me to prepare a full investment memo for.`
      ),
    ],
    thinkingSteps: [
      createThinkingStep("thresholds", `Applying hard filters: recurring revenue ≥${thresholds.recurringRevenueMin}%, Debt/EBITDA ≤${thresholds.debtToEbitdaMax}x...`),
      createThinkingStep("thresholds", "Filtering companies in India and Singapore from Pitchbook/Refinitiv universe..."),
      createThinkingStep("shortlist", "Computing composite scores using configured weights..."),
      createThinkingStep("shortlist", `Screening complete. ${shortlist.length} companies passed all thresholds.`),
      createThinkingStep("shortlist", `Final ranking: 1) ${shortlist[0]?.name}, 2) ${shortlist[1]?.name}, 3) ${shortlist[2]?.name}`),
      createThinkingStep("shortlist", "Presenting shortlist to analyst for review..."),
    ],
    uiHints: {
      showRecommendations: true,
    },
  };
}

export function processShortlist(sessionId: string): NextResponse {
  const state = getOrCreateSession(sessionId);
  state.phase = "comparison";
  updateSession(sessionId, state);

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        "Here are the detailed profiles of each candidate. Review the highlights and key metrics, then click 'Generate Report' on the company you'd like me to prepare a comprehensive investment memo for.\n\nRemember: this is your decision. I'm providing structure, scoring, and data — but the final investment recommendation is yours to make."
      ),
    ],
    thinkingSteps: [
      createThinkingStep("comparison", "Presenting detailed company profiles for analyst review..."),
      createThinkingStep("comparison", "Awaiting analyst selection for investment memo generation..."),
    ],
    uiHints: {
      showRecommendations: true,
    },
  };
}

export function processCompanyChoice(sessionId: string, companyId: string): NextResponse {
  const state = getOrCreateSession(sessionId);
  const company = state.shortlist.find((c) => c.id === companyId);
  
  state.chosenCompanyId = companyId;
  state.phase = "reportChosen";
  updateSession(sessionId, state);

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        `Excellent choice. Generating comprehensive investment memo for ${company?.name}...\n\nThe report includes:\n• Executive Summary\n• Country Analysis\n• Financial Analysis (Quality of Earnings, Growth & Positioning)\n• Operational Strength & Value Creation\n• Exit Feasibility Assessment`
      ),
    ],
    thinkingSteps: [
      createThinkingStep("reportChosen", `Analyst selected ${company?.name} for detailed analysis.`),
      createThinkingStep("reportChosen", "Pulling detailed financial data from Capital IQ and Refinitiv..."),
      createThinkingStep("reportChosen", "Analyzing competitive positioning from CB Insights and Crunchbase..."),
      createThinkingStep("reportChosen", "Compiling exit comparables from Pitchbook transaction database..."),
      createThinkingStep("reportChosen", "Generating investment memo with executive summary and key findings..."),
      createThinkingStep("reportChosen", "Report generation complete. Presenting to analyst."),
    ],
    uiHints: {
      showReportForCompanyId: companyId,
    },
  };
}

export function processMessage(
  sessionId: string,
  userMessage?: string,
  formData?: {
    type: "fundMandate" | "weights" | "thresholds" | "chooseCompany";
    data: FundMandate | ScoringWeights | Thresholds | { companyId: string };
  }
): NextResponse {
  const state = getOrCreateSession(sessionId);

  if (state.phase === "welcome") {
    return processWelcome(sessionId);
  }

  if (formData) {
    switch (formData.type) {
      case "fundMandate":
        return processFundMandate(sessionId, formData.data as FundMandate);
      case "weights":
        return processWeights(sessionId, formData.data as ScoringWeights);
      case "thresholds":
        return processThresholds(sessionId, formData.data as Thresholds);
      case "chooseCompany":
        return processCompanyChoice(sessionId, (formData.data as { companyId: string }).companyId);
    }
  }

  if (state.phase === "countryScreening" && userMessage?.toLowerCase().includes("continue")) {
    return processCountryScreening(sessionId);
  }

  if (state.phase === "shortlist" && userMessage?.toLowerCase().includes("review")) {
    return processShortlist(sessionId);
  }

  return {
    state,
    assistantMessages: [],
    thinkingSteps: [],
  };
}
