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

// Phase types for the state machine
export type Phase =
  | "welcome"
  | "fundMandate"
  | "countryScreening"
  | "weights"
  | "thresholds"
  | "shortlist"
  | "comparison"
  | "reportChosen";

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

// Fund mandate configuration
export interface FundMandate {
  fundType?: string;
  fundSize?: string;
  sectorsFocus?: string[];
  sectorsExcluded?: string[];
  geosFocus?: string[];
  geosExcluded?: string[];
  dealSizeMin?: number;
  dealSizeMax?: number;
  stage?: string;
  holdingPeriodYears?: number;
  riskAppetite?: "Low" | "Medium" | "High";
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
  scoringWeights: ScoringWeights;
  thresholds: Thresholds;
  shortlist: ShortlistedCompanyScore[];
  chosenCompanyId?: string;
  reportTemplate: ReportTemplate;
}

// Initial conversation state
export const initialConversationState: ConversationState = {
  phase: "welcome",
  fundMandate: {},
  scoringWeights: defaultScoringWeights,
  thresholds: defaultThresholds,
  shortlist: [],
  reportTemplate: "growth",
};

// API Request/Response types
export interface ThinkingStep {
  id: string;
  phase: Phase;
  text: string;
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
    type: "fundMandate" | "weights" | "thresholds" | "chooseCompany";
    data: FundMandate | ScoringWeights | Thresholds | { companyId: string };
  };
}

export interface NextResponse {
  state: ConversationState;
  assistantMessages: AssistantMessage[];
  thinkingSteps: ThinkingStep[];
  uiHints?: {
    showRecommendations?: boolean;
    showReportForCompanyId?: string;
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
}

// Zod schemas for validation
export const fundMandateSchema = z.object({
  fundType: z.string().optional(),
  fundSize: z.string().optional(),
  sectorsFocus: z.array(z.string()).optional(),
  sectorsExcluded: z.array(z.string()).optional(),
  geosFocus: z.array(z.string()).optional(),
  geosExcluded: z.array(z.string()).optional(),
  dealSizeMin: z.number().optional(),
  dealSizeMax: z.number().optional(),
  stage: z.string().optional(),
  holdingPeriodYears: z.number().optional(),
  riskAppetite: z.enum(["Low", "Medium", "High"]).optional(),
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
    type: z.enum(["fundMandate", "weights", "thresholds", "chooseCompany"]),
    data: z.any(),
  }).optional(),
});

// Phase labels for UI
export const phaseLabels: Record<Phase, string> = {
  welcome: "Welcome",
  fundMandate: "Fund Mandate",
  countryScreening: "Country Screening",
  weights: "Scoring Weights",
  thresholds: "Thresholds",
  shortlist: "Shortlist",
  comparison: "Review & Select",
  reportChosen: "Report",
};

// Phase order for progress display
export const phaseOrder: Phase[] = [
  "welcome",
  "fundMandate",
  "countryScreening",
  "weights",
  "thresholds",
  "shortlist",
  "comparison",
  "reportChosen",
];
