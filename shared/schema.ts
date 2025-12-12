import { z } from "zod";
import { pgTable, text, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Database schema for saved sessions
export const savedSessions = pgTable("saved_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  name: text("name").notNull(),
  phase: text("phase").notNull(),
  fundMandate: jsonb("fund_mandate"),
  scoringWeights: jsonb("scoring_weights"),
  thresholds: jsonb("thresholds"),
  shortlist: jsonb("shortlist"),
  chosenCompanyId: text("chosen_company_id"),
  chosenCompanyIds: jsonb("chosen_company_ids").$type<string[]>().default([]),
  messages: jsonb("messages"),
  thinkingSteps: jsonb("thinking_steps"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSavedSessionSchema = createInsertSchema(savedSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSavedSession = z.infer<typeof insertSavedSessionSchema>;
export type SavedSession = typeof savedSessions.$inferSelect;

// OptionSelection types for form fields with "Other" support
export interface OptionSelection {
  value: string;
  otherText?: string;
}

export function getSelectionLabel(sel: OptionSelection): string {
  return sel.value === "Other" && sel.otherText ? sel.otherText : sel.value;
}

export interface DealSizeRange {
  min?: number;
  max?: number;
  currency?: string;
}

export interface FundSizeConfig {
  amount?: number;
  currency?: string;
}

export interface TicketSize {
  minEnterpriseValue?: number;
  maxEnterpriseValue?: number;
  equityChequeMin?: number;
  equityChequeMax?: number;
  followOnReservePct?: number;
}

// Phase types for the state machine
export type Phase =
  | "welcome"
  | "fundMandate"
  | "restrictions"
  | "countryScreening"
  | "weights"
  | "thresholds"
  | "shortlist"
  | "comparison"
  | "infoRequest"
  | "dueDiligence"
  | "reportChosen"
  | "taskCompleted";

// Risk Assessment Types
export type RiskBucketId =
  | "liability"
  | "nonSolicitation"
  | "termination"
  | "personnel"
  | "stepIn"
  | "penalty"
  | "nonCompete"
  | "confidentiality"
  | "paymentTerms"
  | "intellectualProperty"
  | "indemnities";

export interface RiskBucketDefinition {
  id: RiskBucketId;
  label: string;
  weightPercent: number;
  maxScore: number;
}

export interface RiskSubClauseOption {
  score: number;
  description: string;
}

export interface RiskSubClauseDefinition {
  id: string;
  bucketId: RiskBucketId;
  label: string;
  maxScore: number;
  options: RiskSubClauseOption[];
}

export type RiskGrade = "Low" | "Medium" | "High";

export interface CompanyRiskScores {
  companyId: string;
  clauseScores: Record<string, number>;
  bucketTotals: Record<RiskBucketId, number>;
  rawTotal: number;
  normalizedPercent: number;
  grade: RiskGrade;
  keyContributors: string[];
}

// Restrictions payload from frontend
export interface RestrictionsPayload {
  mode: "auto" | "manual";
  notes?: string;
}

// Restrictions for macro/micro/fund constraints
export interface Restrictions {
  mode?: "auto" | "manual";
  avoidSanctionedCountries?: boolean;
  notes?: string;
}

export const defaultRestrictions: Restrictions = { mode: "auto" };

// Sub-parameter types for detailed scoring
export type TopLevelParamId =
  | "qualityOfEarnings"
  | "companyFinancial"
  | "industryAttractiveness"
  | "competitivePositioning"
  | "managementGovernance"
  | "operationalEfficiency"
  | "customerMarket"
  | "productStrength"
  | "exitFeasibility"
  | "scalabilityPotential";

export type SubParamType = "numeric" | "qualitative";
export type Direction = "higherIsBetter" | "lowerIsBetter" | "none";

export interface SubParameterDefinition {
  id: string;
  label: string;
  category: TopLevelParamId;
  type: SubParamType;
  direction: Direction;
}

export const SUB_PARAMETERS: SubParameterDefinition[] = [
  // Quality of Earnings & Financial Health
  { id: "earningsQuality", label: "Earnings quality (recurring vs. one-time)", category: "qualityOfEarnings", type: "qualitative", direction: "higherIsBetter" },
  { id: "debtLeverage", label: "Debt levels & leverage ratios", category: "qualityOfEarnings", type: "numeric", direction: "lowerIsBetter" },
  { id: "profitabilityVsPeers", label: "Profitability vs. peers", category: "qualityOfEarnings", type: "numeric", direction: "higherIsBetter" },
  { id: "accountingPolicies", label: "Accounting policies and redflags", category: "qualityOfEarnings", type: "qualitative", direction: "none" },
  { id: "workingCapitalCycle", label: "Working capital cycle", category: "qualityOfEarnings", type: "numeric", direction: "lowerIsBetter" },
  { id: "capexIntensity", label: "Capital expenditure", category: "qualityOfEarnings", type: "numeric", direction: "lowerIsBetter" },
  { id: "cacLtv", label: "Customer Acquisition Cost (CAC) & Lifetime Value (LTV)", category: "qualityOfEarnings", type: "numeric", direction: "higherIsBetter" },
  // Company Financial Performance
  { id: "revenueGrowth", label: "Revenue growth (historical + forecast)", category: "companyFinancial", type: "numeric", direction: "higherIsBetter" },
  { id: "margins", label: "Margins (Gross, EBITDA, Net)", category: "companyFinancial", type: "numeric", direction: "higherIsBetter" },
  { id: "cashFlowStability", label: "Cash flow stability", category: "companyFinancial", type: "qualitative", direction: "higherIsBetter" },
  { id: "unitEconomics", label: "Unit economics", category: "companyFinancial", type: "qualitative", direction: "higherIsBetter" },
  // Industry Attractiveness
  { id: "marketSize", label: "Market size", category: "industryAttractiveness", type: "numeric", direction: "higherIsBetter" },
  { id: "industryGrowth", label: "Growth rate", category: "industryAttractiveness", type: "numeric", direction: "higherIsBetter" },
  { id: "competitiveIntensity", label: "Competitive intensity & fragmentation", category: "industryAttractiveness", type: "qualitative", direction: "lowerIsBetter" },
  { id: "regulationBarriers", label: "Regulation & entry barriers", category: "industryAttractiveness", type: "qualitative", direction: "higherIsBetter" },
  { id: "cyclicality", label: "Cyclicality and macro resilience", category: "industryAttractiveness", type: "qualitative", direction: "higherIsBetter" },
  { id: "innovationPace", label: "Innovation pace and technological disruption", category: "industryAttractiveness", type: "qualitative", direction: "higherIsBetter" },
  // Competitive Positioning
  { id: "marketShare", label: "Market share", category: "competitivePositioning", type: "numeric", direction: "higherIsBetter" },
  { id: "uvp", label: "Unique value proposition", category: "competitivePositioning", type: "qualitative", direction: "higherIsBetter" },
  { id: "pricingPower", label: "Pricing power", category: "competitivePositioning", type: "qualitative", direction: "higherIsBetter" },
  { id: "brandStrength", label: "Brand strength", category: "competitivePositioning", type: "qualitative", direction: "higherIsBetter" },
  { id: "barriersToEntry", label: "Barriers to entry", category: "competitivePositioning", type: "qualitative", direction: "higherIsBetter" },
  { id: "customerStickiness", label: "Customer stickiness", category: "competitivePositioning", type: "qualitative", direction: "higherIsBetter" },
  // Management Team & Governance
  { id: "leadershipCredibility", label: "Leadership credibility & track record", category: "managementGovernance", type: "qualitative", direction: "higherIsBetter" },
  { id: "executionCapability", label: "Execution capability", category: "managementGovernance", type: "qualitative", direction: "higherIsBetter" },
  { id: "companyCulture", label: "Company culture", category: "managementGovernance", type: "qualitative", direction: "higherIsBetter" },
  { id: "governanceQuality", label: "Governance quality & transparency", category: "managementGovernance", type: "qualitative", direction: "higherIsBetter" },
  // Operational Efficiency
  { id: "costStructure", label: "Cost structure and optimization levers", category: "operationalEfficiency", type: "qualitative", direction: "higherIsBetter" },
  { id: "processMaturity", label: "Process maturity", category: "operationalEfficiency", type: "qualitative", direction: "higherIsBetter" },
  { id: "supplyChainEfficiency", label: "Supply chain and procurement efficiency", category: "operationalEfficiency", type: "qualitative", direction: "higherIsBetter" },
  { id: "automationPotential", label: "Automation potential", category: "operationalEfficiency", type: "qualitative", direction: "higherIsBetter" },
  { id: "itReadiness", label: "IT systems and digital readiness", category: "operationalEfficiency", type: "qualitative", direction: "higherIsBetter" },
  // Customer & Market Dynamics
  { id: "customerSegmentation", label: "Customer segmentation", category: "customerMarket", type: "qualitative", direction: "higherIsBetter" },
  { id: "customerSatisfaction", label: "Customer satisfaction (NPS, CSAT)", category: "customerMarket", type: "numeric", direction: "higherIsBetter" },
  { id: "churnRate", label: "Churn rate", category: "customerMarket", type: "numeric", direction: "lowerIsBetter" },
  { id: "demandPatterns", label: "Demand patterns", category: "customerMarket", type: "qualitative", direction: "higherIsBetter" },
  { id: "marketShareShifts", label: "Market share shifts", category: "customerMarket", type: "qualitative", direction: "higherIsBetter" },
  // Product / Service Strength
  { id: "productDifferentiation", label: "Product differentiation", category: "productStrength", type: "qualitative", direction: "higherIsBetter" },
  { id: "ipProtection", label: "IP protection", category: "productStrength", type: "qualitative", direction: "higherIsBetter" },
  { id: "techStackQuality", label: "Technology stack quality", category: "productStrength", type: "qualitative", direction: "higherIsBetter" },
  { id: "rdCapabilities", label: "R&D capabilities", category: "productStrength", type: "qualitative", direction: "higherIsBetter" },
  { id: "obsolescenceRisk", label: "Obsolescence risk", category: "productStrength", type: "qualitative", direction: "lowerIsBetter" },
  // Exit Feasibility
  { id: "potentialBuyers", label: "Potential buyers (strategics, other PE funds)", category: "exitFeasibility", type: "qualitative", direction: "higherIsBetter" },
  { id: "ipoReadiness", label: "IPO readiness", category: "exitFeasibility", type: "qualitative", direction: "higherIsBetter" },
  { id: "valuationGrowthPotential", label: "Valuation growth potential", category: "exitFeasibility", type: "qualitative", direction: "higherIsBetter" },
  { id: "comparableMultiples", label: "Comparable transaction multiples", category: "exitFeasibility", type: "qualitative", direction: "higherIsBetter" },
  { id: "industryMaTrends", label: "Industry M&A trends", category: "exitFeasibility", type: "qualitative", direction: "higherIsBetter" },
  { id: "timeToExit", label: "Time to exit", category: "exitFeasibility", type: "numeric", direction: "lowerIsBetter" },
  // Scalability Potential
  { id: "businessModelScalability", label: "Business model scalability", category: "scalabilityPotential", type: "qualitative", direction: "higherIsBetter" },
  { id: "operationalScalability", label: "Operational scalability", category: "scalabilityPotential", type: "qualitative", direction: "higherIsBetter" },
  { id: "productReplicability", label: "Product replicability", category: "scalabilityPotential", type: "qualitative", direction: "higherIsBetter" },
  { id: "geoExpansionCapacity", label: "Geographic expansion capacity", category: "scalabilityPotential", type: "qualitative", direction: "higherIsBetter" },
  { id: "crossSellUpsell", label: "Cross-selling & upselling opportunities", category: "scalabilityPotential", type: "qualitative", direction: "higherIsBetter" },
];

// Sub-parameter preference levels
export type PreferenceLevel = "auto" | "hardFilter" | "high" | "medium" | "low" | "ignore";

export interface SubParameterPreference {
  subParamId: string;
  preference: PreferenceLevel;
  minValue?: number;
  maxValue?: number;
}

// Sub-parameter user input for thresholds navigator
export interface SubParameterUserInput {
  subParamId: string;
  value?: number; // Optional - if undefined, agent will infer from fund mandate
}

// Helper constants for parameter order and labels
export const TOP_LEVEL_PARAM_ORDER: TopLevelParamId[] = [
  "qualityOfEarnings",
  "companyFinancial",
  "industryAttractiveness",
  "competitivePositioning",
  "managementGovernance",
  "operationalEfficiency",
  "customerMarket",
  "productStrength",
  "exitFeasibility",
  "scalabilityPotential",
];

export const TOP_LEVEL_PARAM_LABELS: Record<TopLevelParamId, string> = {
  qualityOfEarnings: "Quality of Earnings & Financial Health",
  companyFinancial: "Company Financial Performance",
  industryAttractiveness: "Industry Attractiveness",
  competitivePositioning: "Competitive Positioning",
  managementGovernance: "Management Team & Governance",
  operationalEfficiency: "Operational Efficiency",
  customerMarket: "Customer & Market Dynamics",
  productStrength: "Product / Service Strength",
  exitFeasibility: "Exit Feasibility",
  scalabilityPotential: "Scalability Potential",
};

// Report template types
export type ReportTemplate = "growth" | "buyout" | "venture";

export const reportTemplateLabels: Record<ReportTemplate, string> = {
  growth: "PE Growth",
  buyout: "Buyout",
  venture: "Venture",
};

export const reportTemplateDescriptions: Record<ReportTemplate, string> = {
  growth: "Focus on revenue growth, market expansion, and scalability",
  buyout: "Focus on quality of earnings, operational improvements, and cash flow",
  venture: "Focus on market opportunity, competitive differentiation, and exit potential",
};

// Fund mandate configuration with OptionSelection support
export interface FundMandate {
  // Categorical fields (use checkboxes / radios + Other)
  fundType?: OptionSelection;
  sectorFocus: OptionSelection[];
  investmentStage: OptionSelection[];
  geographicFocus: OptionSelection[];
  excludedSectors: OptionSelection[];
  valueCreationApproach: OptionSelection[];
  exitPreferences: OptionSelection[];
  financialCriteria: OptionSelection[];
  riskAppetite?: OptionSelection;
  transactionTypes: OptionSelection[];
  ownershipTarget?: OptionSelection;

  // Numeric / text fields
  equityStakePreference?: string;
  dealSizeRange?: DealSizeRange;
  fundSize?: FundSizeConfig;
  targetIRR?: number;
  ticketSize?: TicketSize;
  leveragePolicy?: string;
  timeHorizonAndValueCreationPlan?: string;
  holdingPeriodYears?: number;

  // Legacy fields for backwards compatibility
  sectorsFocus?: string[];
  sectorsExcluded?: string[];
  geosFocus?: string[];
  geosExcluded?: string[];
  dealSizeMin?: number;
  dealSizeMax?: number;
  stage?: string;
}

// Scoring weights (must sum to 100)
export interface ScoringWeights {
  qualityOfEarnings: number;
  financialPerformance: number;
  industryAttractiveness: number;
  competitivePositioning: number;
  managementGovernance: number;
  operationalEfficiency: number;
  customerMarketDynamics: number;
  productStrength: number;
  exitFeasibility: number;
  scalabilityPotential: number;
}

// Default scoring weights
export const defaultScoringWeights: ScoringWeights = {
  qualityOfEarnings: 10,
  financialPerformance: 10,
  industryAttractiveness: 10,
  competitivePositioning: 10,
  managementGovernance: 10,
  operationalEfficiency: 10,
  customerMarketDynamics: 10,
  productStrength: 10,
  exitFeasibility: 10,
  scalabilityPotential: 10,
};

// Threshold configuration
export interface Thresholds {
  recurringRevenueMin?: number;
  debtToEbitdaMax?: number;
  revenueGrowthMin?: number;
  fcfConversionMin?: number;
  industryGrowthMin?: number;
  maxCustomerConcentration?: number;
}

// Default thresholds
export const defaultThresholds: Thresholds = {
  recurringRevenueMin: 50,
  debtToEbitdaMax: 3,
  revenueGrowthMin: 15,
  fcfConversionMin: 20,
  industryGrowthMin: 10,
  maxCustomerConcentration: 30,
};

// Company data structure
export interface Company {
  id: string;
  name: string;
  country: string;
  hqCity: string;
  sector: string;
  businessSummary: string;
  recurringRevenuePct: number;
  debtToEbitda: number;
  revenueGrowthPct: number;
  fcfConversionPct: number;
  industryGrowthPct: number;
  customerConcentrationPct: number;
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
}

// Shortlisted company with score
export interface ShortlistedCompanyScore {
  id: string;
  name: string;
  country: string;
  sector: string;
  score: number;
  rank: number;
  highlights: string[];
}

// Conversation state
export interface ConversationState {
  phase: Phase;
  fundMandate: FundMandate;
  restrictions: Restrictions;
  scoringWeights: ScoringWeights;
  thresholds?: Thresholds; // Optional for backward compatibility
  subParamInputs: SubParameterUserInput[]; // New comprehensive sub-parameter inputs
  subParamPreferences: SubParameterPreference[];
  shortlist: ShortlistedCompanyScore[];
  chosenCompanyIds: string[];
  reportTemplate: ReportTemplate;
  finalSelectedCompanyId?: string;
  infoRequestConfirmed?: boolean; // Tracks if email interest collection was completed
  thinkingStepCounter: number; // Global counter for continuous step numbering
}

// Default fund mandate with empty arrays
export const defaultFundMandate: FundMandate = {
  sectorFocus: [],
  investmentStage: [],
  geographicFocus: [],
  excludedSectors: [],
  valueCreationApproach: [],
  exitPreferences: [],
  financialCriteria: [],
  transactionTypes: [],
};

// Initial conversation state
export const initialConversationState: ConversationState = {
  phase: "welcome",
  fundMandate: defaultFundMandate,
  restrictions: defaultRestrictions,
  scoringWeights: defaultScoringWeights,
  thresholds: defaultThresholds,
  subParamInputs: [],
  subParamPreferences: [],
  shortlist: [],
  chosenCompanyIds: [],
  reportTemplate: "growth",
  thinkingStepCounter: 0,
};

// API Request/Response types
export interface ThinkingStep {
  id: string;
  phase: Phase;
  text: string;
  stepNumber: number;
}

export interface AssistantMessage {
  role: "assistant";
  text: string;
}

export interface UserMessage {
  role: "user";
  text: string;
}

export type ChatMessage = AssistantMessage | UserMessage;

export interface NextRequest {
  sessionId: string;
  userMessage?: string;
  formData?: {
    type: "fundMandate" | "restrictions" | "weights" | "thresholds" | "chooseCompany" | "selectCompanies" | "selectPreferred" | "confirmEmails";
    data?: FundMandate | RestrictionsPayload | ScoringWeights | Thresholds | { subParamInputs: SubParameterUserInput[] } | { companyId: string } | { selectedCompanies: string[] };
  };
}

export interface NextResponse {
  state: ConversationState;
  assistantMessages: AssistantMessage[];
  thinkingSteps: ThinkingStep[];
  reports?: CompanyReport[];
  uiHints?: {
    showRecommendations?: boolean;
    showReportForCompanyId?: string;
    showReportsForCompanyIds?: string[];
    showInfoRequest?: boolean;
    emailDrafts?: { companyId: string; companyName: string }[];
  };
}

// Report structure
export interface CompanyReport {
  header: {
    date: string;
    companyName: string;
    sector: string;
    headquarters: string;
    sourceDatabases: string[];
  };
  executiveSummary: string[];
  countryAnalysis: {
    table: { parameter: string; india: string; singapore: string }[];
    keyPoints: string[];
  };
  financialAnalysis: {
    qualityOfEarnings: { label: string; detail: string }[];
    growthAndPositioning: { label: string; detail: string }[];
  };
  operationalAndValueCreation: string[];
  exitFeasibility: string[];
  riskAssessment?: CompanyRiskScores;
}

// Zod schemas for validation
export const optionSelectionSchema = z.object({
  value: z.string(),
  otherText: z.string().optional(),
});

export const fundMandateSchema = z.object({
  // Categorical fields with OptionSelection
  fundType: optionSelectionSchema.optional(),
  sectorFocus: z.array(optionSelectionSchema).default([]),
  investmentStage: z.array(optionSelectionSchema).default([]),
  geographicFocus: z.array(optionSelectionSchema).default([]),
  excludedSectors: z.array(optionSelectionSchema).default([]),
  valueCreationApproach: z.array(optionSelectionSchema).default([]),
  exitPreferences: z.array(optionSelectionSchema).default([]),
  financialCriteria: z.array(optionSelectionSchema).default([]),
  riskAppetite: optionSelectionSchema.optional(),
  transactionTypes: z.array(optionSelectionSchema).default([]),
  ownershipTarget: optionSelectionSchema.optional(),

  // Numeric / text fields
  equityStakePreference: z.string().optional(),
  dealSizeRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().optional(),
  }).optional(),
  fundSize: z.object({
    amount: z.number().optional(),
    currency: z.string().optional(),
  }).optional(),
  targetIRR: z.number().optional(),
  ticketSize: z.object({
    minEnterpriseValue: z.number().optional(),
    maxEnterpriseValue: z.number().optional(),
    equityChequeMin: z.number().optional(),
    equityChequeMax: z.number().optional(),
    followOnReservePct: z.number().optional(),
  }).optional(),
  leveragePolicy: z.string().optional(),
  timeHorizonAndValueCreationPlan: z.string().optional(),
  holdingPeriodYears: z.number().optional(),

  // Legacy fields for backwards compatibility
  sectorsFocus: z.array(z.string()).optional(),
  sectorsExcluded: z.array(z.string()).optional(),
  geosFocus: z.array(z.string()).optional(),
  geosExcluded: z.array(z.string()).optional(),
  dealSizeMin: z.number().optional(),
  dealSizeMax: z.number().optional(),
  stage: z.string().optional(),
});

export const scoringWeightsSchema = z.object({
  qualityOfEarnings: z.number().min(0).max(100),
  financialPerformance: z.number().min(0).max(100),
  industryAttractiveness: z.number().min(0).max(100),
  competitivePositioning: z.number().min(0).max(100),
  managementGovernance: z.number().min(0).max(100),
  operationalEfficiency: z.number().min(0).max(100),
  customerMarketDynamics: z.number().min(0).max(100),
  productStrength: z.number().min(0).max(100),
  exitFeasibility: z.number().min(0).max(100),
  scalabilityPotential: z.number().min(0).max(100),
});

export const thresholdsSchema = z.object({
  recurringRevenueMin: z.number().optional(),
  debtToEbitdaMax: z.number().optional(),
  revenueGrowthMin: z.number().optional(),
  fcfConversionMin: z.number().optional(),
  industryGrowthMin: z.number().optional(),
  maxCustomerConcentration: z.number().optional(),
});

export const nextRequestSchema = z.object({
  sessionId: z.string(),
  userMessage: z.string().optional(),
  formData: z.object({
    type: z.enum(["fundMandate", "restrictions", "weights", "thresholds", "chooseCompany", "selectCompanies", "selectPreferred", "confirmEmails"]),
    data: z.any().optional(),
  }).optional(),
});

// Phase labels for UI
export const phaseLabels: Record<Phase, string> = {
  welcome: "Welcome",
  fundMandate: "Fund Mandate",
  restrictions: "Restrictions",
  countryScreening: "Country Screening",
  weights: "Scoring Weights",
  thresholds: "Thresholds",
  shortlist: "Shortlist",
  comparison: "Review & Select",
  infoRequest: "Info Request",
  dueDiligence: "Due Diligence",
  reportChosen: "Report",
  taskCompleted: "Completed",
};

// Phase order for progress display
export const phaseOrder: Phase[] = [
  "welcome",
  "fundMandate",
  "restrictions",
  "countryScreening",
  "weights",
  "thresholds",
  "shortlist",
  "comparison",
  "infoRequest",
  "dueDiligence",
  "reportChosen",
  "taskCompleted",
];
