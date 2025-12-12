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
  RestrictionsPayload,
  SubParameterUserInput,
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

export function getSession(sessionId: string): ConversationState | null {
  return sessions.get(sessionId) ?? null;
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
      createThinkingStep("welcome", "gathering process flow from Capability Compass"),
      createThinkingStep("welcome", "Analyzing required information and fields"),
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
  state.phase = "restrictions";
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
        `Got it. You're a ${fundTypeLabel.replace("-", " ")} fund focused on ${sectors} in ${geos}, with ticket size ${dealSize} and ${riskLabel} risk appetite.\n\nBefore moving ahead, do you want to add any Macro / Micro / Fund restrictions, or I can assess macro conditions, micro and fund restrictions along with the provided fund mandate?`
      ),
    ],
    thinkingSteps: [
      createThinkingStep("fundMandate", "Capturing core fund mandate parameters..."),
      createThinkingStep("fundMandate", `Mapping deal size ${dealSize} to fund size to estimate feasible targets...`),
      createThinkingStep("restrictions", "Preparing to assess macro/micro conditions and fund restrictions..."),
    ],
  };
}

export function processRestrictions(sessionId: string, payload?: RestrictionsPayload, userMessage?: string): NextResponse {
  const state = getOrCreateSession(sessionId);
  
  // Handle structured payload from form
  if (payload) {
    if (payload.mode === "auto") {
      state.restrictions = { mode: "auto" };
    } else {
      const notes = payload.notes || "";
      state.restrictions = {
        mode: "manual",
        notes,
        avoidSanctionedCountries: notes.toLowerCase().includes("sanction"),
      };
    }
  } else if (userMessage) {
    // Legacy: Parse user input for restrictions - skip storing "no", "continue", or very short responses
    const lowerMsg = userMessage.toLowerCase().trim();
    const skipKeywords = ["no", "continue", "proceed", "ok", "okay", "yes", "next", "skip"];
    const shouldSkip = skipKeywords.includes(lowerMsg) || lowerMsg.length < 3;
    
    if (!shouldSkip) {
      if (lowerMsg.includes("sanctioned")) {
        state.restrictions = {
          mode: "manual",
          avoidSanctionedCountries: true,
          notes: userMessage,
        };
      } else {
        state.restrictions = {
          mode: "manual",
          notes: userMessage,
        };
      }
    } else {
      state.restrictions = { mode: "auto" };
    }
  }
  
  state.phase = "countryScreening";
  updateSession(sessionId, state);

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        `**Macro Analysis**
- India: Strong technology growth, robust GDP, favourable regulation
- Singapore: Best for high-quality, governance-heavy deals, fastest-growing technology base
- Vietnam: Fastest-growing technology base.

These markets demonstrate strong tech demand.

**Micro Analysis**
- India & Singapore show better growth economics than Vietnam.

**Mandate Compatibility Check**
- All three markets have companies with ticket size above USD 50M.
- ESG environment: strongest in India & Singapore.
- Government revenue dependency risk highest in Vietnam (but controllable).

Overall, macro, micro and mandate alignment is strongest in India and Singapore.

Reply 'continue' to proceed to the scoring framework configuration.`
      ),
    ],
    thinkingSteps: [
      createThinkingStep("restrictions", "Assessing macro conditions across India, Singapore, Vietnam based on demo Refinitiv / CIQ data..."),
      createThinkingStep("restrictions", "Comparing unit economics and growth profiles to your mandate..."),
      createThinkingStep("restrictions", "Identifying India and Singapore as strongest fits given your ticket size and ESG preferences..."),
      createThinkingStep("countryScreening", "Querying macro indicators from Refinitiv and Capital IQ..."),
      createThinkingStep("countryScreening", "Evaluating India: market size, tech ecosystem depth, regulatory risk, FX volatility..."),
      createThinkingStep("countryScreening", "Evaluating Singapore: legal system strength, capital markets depth, ease of doing business..."),
      createThinkingStep("countryScreening", "Both markets pass initial screening criteria. Ready for weights configuration..."),
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

export function processThresholds(
  sessionId: string, 
  payload: Thresholds | { subParamInputs?: SubParameterUserInput[] }
): NextResponse {
  const state = getOrCreateSession(sessionId);
  
  // Handle new sub-parameter inputs format
  if ("subParamInputs" in payload && payload.subParamInputs) {
    state.subParamInputs = payload.subParamInputs;
  } else {
    // Backward compatibility: handle old Thresholds format
    state.thresholds = payload as Thresholds;
  }
  
  const shortlist = scoreAndRankCompanies(state.scoringWeights, state.thresholds || {});
  state.shortlist = shortlist;
  state.phase = "shortlist";
  updateSession(sessionId, state);

  const shortlistSummary = shortlist
    .map((c) => `• Rank ${c.rank}: ${c.name} (${c.country}) — Score: ${c.score}/100`)
    .join("\n");

  const filledCount = state.subParamInputs?.length || 0;
  const thresholdDescription = filledCount > 0
    ? `Applying ${filledCount} user-defined sub-parameter thresholds...`
    : `Applying default thresholds based on fund mandate...`;

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        `I've applied your thresholds and screened the universe of companies. Here are the three that best match your mandate:\n\n${shortlistSummary}\n\nReview the detailed profiles below and click "Generate Report" on the company you'd like me to prepare a full investment memo for.`
      ),
    ],
    thinkingSteps: [
      createThinkingStep("thresholds", thresholdDescription),
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
  
  state.chosenCompanyIds = [companyId];
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

export function processMultiCompanySelection(sessionId: string, selectedCompanies: string[]): NextResponse {
  const state = getOrCreateSession(sessionId);
  
  if (!selectedCompanies || selectedCompanies.length < 2) {
    return {
      state,
      assistantMessages: [
        createAssistantMessage(
          "Please select at least two companies to move into the due diligence stage."
        ),
      ],
      thinkingSteps: [
        createThinkingStep("comparison", "Awaiting selection of at least 2 companies for due diligence..."),
      ],
      uiHints: {
        showRecommendations: true,
      },
    };
  }
  
  const selectedNames = selectedCompanies
    .map((id) => state.shortlist.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join(" and ");
  
  state.chosenCompanyIds = selectedCompanies;
  state.phase = "infoRequest";
  updateSession(sessionId, state);

  const emailDrafts = selectedCompanies.map((id) => {
    const company = state.shortlist.find((c) => c.id === id);
    return `**To: ${company?.name} Management Team**\n\nDear ${company?.name} team,\n\nWe are a Growth & Buyout fund interested in initiating due diligence on your company. We would like to request additional financial, operational, and legal documentation to support our evaluation process.\n\nPlease provide the following at your earliest convenience:\n• Audited financial statements (last 3 years)\n• Monthly management accounts (last 12 months)\n• Customer contracts and key commercial agreements\n• Organizational chart and key personnel details\n• Technology stack and IP documentation\n\nWe appreciate your cooperation and look forward to engaging further.\n\nBest regards,\nPE Target Finder Team`;
  }).join("\n\n---\n\n");

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        `I will now send interest mails to the shortlisted companies requesting additional information and documentation for due diligence.`
      ),
      createAssistantMessage(
        `Review the draft emails below and confirm when I can proceed.\n\n${emailDrafts}`
      ),
    ],
    thinkingSteps: [
      createThinkingStep("comparison", `Locking in ${selectedNames} for detailed due diligence...`),
      createThinkingStep("infoRequest", "Drafting interest mails for shortlisted companies..."),
    ],
    uiHints: {
      showInfoRequest: true,
      emailDrafts: selectedCompanies.map((id) => ({
        companyId: id,
        companyName: state.shortlist.find((c) => c.id === id)?.name || id,
      })),
    },
  };
}

export function processInfoRequestConfirm(sessionId: string): NextResponse {
  const state = getOrCreateSession(sessionId);
  
  const selectedNames = state.chosenCompanyIds
    .map((id) => state.shortlist.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join(" and ");
  
  state.phase = "dueDiligence";
  state.infoRequestConfirmed = true;
  updateSession(sessionId, state);

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        `I've generated detailed reports for the companies you selected: ${selectedNames}. Use the tabs below to review them side by side.\n\nEach report includes:\n• Executive Summary\n• Country Analysis\n• Financial Analysis\n• Operational & Value Creation\n• Exit Feasibility`
      ),
    ],
    thinkingSteps: [
      createThinkingStep("infoRequest", "Sending interest mails to shortlisted companies..."),
      createThinkingStep("infoRequest", "Receiving required documentation and data packs..."),
      createThinkingStep("infoRequest", "Validating completeness of received information for due diligence..."),
      createThinkingStep("dueDiligence", "Pulling detailed financial data from Capital IQ and Refinitiv..."),
      createThinkingStep("dueDiligence", "Analyzing competitive positioning from CB Insights and Crunchbase..."),
      createThinkingStep("dueDiligence", "Compiling exit comparables from Pitchbook transaction database..."),
      createThinkingStep("dueDiligence", "Generating investment memos for all selected companies..."),
      createThinkingStep("dueDiligence", "Reports generated. Presenting tabbed view to analyst."),
    ],
    uiHints: {
      showReportsForCompanyIds: state.chosenCompanyIds,
    },
  };
}

export function processSelectPreferred(sessionId: string, companyId: string): NextResponse {
  const state = getOrCreateSession(sessionId);
  const company = state.shortlist.find((c) => c.id === companyId);
  
  state.finalSelectedCompanyId = companyId;
  state.phase = "taskCompleted";
  updateSession(sessionId, state);

  return {
    state,
    assistantMessages: [
      createAssistantMessage(
        `Excellent decision! You have selected **${company?.name}** as your preferred investment target.\n\nThe investment memo has been finalized and is ready for your investment committee review. Here's a summary of next steps:\n\n1. Present findings to your investment committee\n2. Schedule preliminary discussions with ${company?.name} management\n3. Engage external advisors for detailed due diligence\n4. Prepare indicative offer and term sheet\n\nCongratulations on completing the screening process!`
      ),
    ],
    thinkingSteps: [
      createThinkingStep("dueDiligence", `Analyst selected ${company?.name} as the preferred investment target.`),
      createThinkingStep("dueDiligence", "Finalizing investment memo and recommendation package..."),
      createThinkingStep("taskCompleted", "Recording final selection in screening session..."),
      createThinkingStep("taskCompleted", "Preparing next steps summary for investment committee..."),
      createThinkingStep("taskCompleted", "Screening process completed successfully."),
    ],
  };
}

export function processMessage(
  sessionId: string,
  userMessage?: string,
  formData?: {
    type: "fundMandate" | "restrictions" | "weights" | "thresholds" | "chooseCompany" | "selectCompanies" | "selectPreferred" | "confirmEmails";
    data?: FundMandate | RestrictionsPayload | ScoringWeights | Thresholds | { companyId: string } | { selectedCompanies: string[] };
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
      case "restrictions":
        return processRestrictions(sessionId, formData.data as RestrictionsPayload, userMessage);
      case "weights":
        return processWeights(sessionId, formData.data as ScoringWeights);
      case "thresholds":
        return processThresholds(sessionId, formData.data as Thresholds);
      case "chooseCompany":
        return processCompanyChoice(sessionId, (formData.data as { companyId: string }).companyId);
      case "selectCompanies":
        return processMultiCompanySelection(sessionId, (formData.data as { selectedCompanies: string[] }).selectedCompanies);
      case "selectPreferred":
        return processSelectPreferred(sessionId, (formData.data as { companyId: string }).companyId);
      case "confirmEmails":
        return processInfoRequestConfirm(sessionId);
    }
  }

  if (state.phase === "restrictions") {
    return processRestrictions(sessionId, undefined, userMessage);
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
