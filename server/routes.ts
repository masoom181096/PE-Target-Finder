import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { processMessage, getSession } from "./logic/stateMachine";
import { generateReport, TemplatedReport } from "./logic/reports";
import { nextRequestSchema, insertSavedSessionSchema } from "@shared/schema";
import type { ReportTemplate, CompanyRiskScores } from "@shared/schema";
import { storage } from "./storage";
import { companies, getCompanyById } from "./data/companies";
import { RISK_BUCKETS } from "./data/riskModel";

function buildReportText(report: TemplatedReport): string {
  const lines: string[] = [];
  const divider = "=".repeat(70);
  const subDivider = "-".repeat(70);
  
  lines.push(divider);
  lines.push(`${report.header.companyName} - PE Investment Diligence Report`);
  lines.push(report.templateSubtitle);
  lines.push(divider);
  lines.push("");
  lines.push(`Date: ${report.header.date}`);
  lines.push(`Sector: ${report.header.sector}`);
  lines.push(`Headquarters: ${report.header.headquarters}`);
  lines.push(`Source Databases: ${report.header.sourceDatabases.join(", ")}`);
  lines.push("");

  lines.push(subDivider);
  lines.push("EXECUTIVE SUMMARY");
  lines.push(subDivider);
  report.executiveSummary.forEach((item, idx) => {
    lines.push(`  ${idx + 1}. ${item}`);
  });
  lines.push("");

  lines.push(subDivider);
  lines.push("COUNTRY ANALYSIS");
  lines.push(subDivider);
  lines.push("");
  lines.push("Key Points:");
  report.countryAnalysis.keyPoints.forEach((item, idx) => {
    lines.push(`  ${idx + 1}. ${item}`);
  });
  lines.push("");
  lines.push("Country Comparison Table:");
  report.countryAnalysis.table.forEach((row) => {
    lines.push(`  ${row.parameter}:`);
    lines.push(`    India: ${row.india}`);
    lines.push(`    Singapore: ${row.singapore}`);
  });
  lines.push("");

  lines.push(subDivider);
  lines.push("FINANCIAL ANALYSIS");
  lines.push(subDivider);
  lines.push("");
  lines.push("Quality of Earnings:");
  report.financialAnalysis.qualityOfEarnings.forEach((item) => {
    lines.push(`  - ${item.label}: ${item.detail}`);
  });
  lines.push("");
  lines.push("Growth & Positioning:");
  report.financialAnalysis.growthAndPositioning.forEach((item) => {
    lines.push(`  - ${item.label}: ${item.detail}`);
  });
  lines.push("");

  lines.push(subDivider);
  lines.push("OPERATIONAL STRENGTH & VALUE CREATION");
  lines.push(subDivider);
  report.operationalAndValueCreation.forEach((item, idx) => {
    lines.push(`  ${idx + 1}. ${item}`);
  });
  lines.push("");

  lines.push(subDivider);
  lines.push("EXIT FEASIBILITY");
  lines.push(subDivider);
  report.exitFeasibility.forEach((item, idx) => {
    lines.push(`  ${idx + 1}. ${item}`);
  });
  lines.push("");

  if (report.riskAssessment) {
    lines.push(subDivider);
    lines.push("CONTRACT RISK ASSESSMENT");
    lines.push(subDivider);
    lines.push("");
    
    lines.push("Risk Buckets:");
    for (const bucket of RISK_BUCKETS) {
      const score = report.riskAssessment.bucketTotals[bucket.id];
      lines.push(`  - ${bucket.label} (${bucket.weightPercent}% weight): ${score}/${bucket.maxScore}`);
    }
    lines.push("");
    
    const MAX_TOTAL = 72;
    lines.push(`Total Risk Score: ${report.riskAssessment.rawTotal} / ${MAX_TOTAL}`);
    lines.push(`Normalized: ${report.riskAssessment.normalizedPercent.toFixed(1)}%`);
    lines.push(`Grade: ${report.riskAssessment.grade}`);
    lines.push("");
    
    lines.push("Key Risk Contributors:");
    report.riskAssessment.keyContributors.forEach((contributor, idx) => {
      lines.push(`  ${idx + 1}. ${contributor}`);
    });
    lines.push("");
  }

  lines.push(divider);
  lines.push("END OF REPORT");
  lines.push(divider);

  return lines.join("\n");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/chat/next", (req: Request, res: Response) => {
    try {
      const parsed = nextRequestSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: parsed.error.format() 
        });
      }

      const { sessionId, userMessage, formData } = parsed.data;
      const response = processMessage(sessionId, userMessage, formData);
      
      return res.json(response);
    } catch (error) {
      console.error("Chat API error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/report/download", (req: Request, res: Response) => {
    try {
      const sessionId = req.query.sessionId as string | undefined;
      const companyIdQuery = req.query.companyId as string | undefined;

      if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
      }

      const state = getSession(sessionId);
      if (!state) {
        return res.status(404).json({ error: "Session not found" });
      }

      const companyId = companyIdQuery || state.finalSelectedCompanyId;
      if (!companyId) {
        return res.status(400).json({ error: "No company selected for report" });
      }

      const templateType = (state.reportTemplate as ReportTemplate) || "growth";
      const report = generateReport(companyId, templateType);

      if (!report) {
        return res.status(404).json({ error: "Report not found for company" });
      }

      const reportText = buildReportText(report);
      const filename = `${report.header.companyName.replace(/\s+/g, "_")}_PE_Report.txt`;

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(reportText);
    } catch (error) {
      console.error("Report download error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/report/:companyId", (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const templateType = (req.query.templateType as ReportTemplate) || "growth";
      
      const validTemplates: ReportTemplate[] = ["growth", "buyout", "venture"];
      const template = validTemplates.includes(templateType) ? templateType : "growth";
      
      const report = generateReport(companyId, template);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found for company" });
      }
      
      const serializedReport = {
        ...report,
        emphasisItems: Object.fromEntries(report.emphasisItems),
      };
      
      return res.json(serializedReport);
    } catch (error) {
      console.error("Report API error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/sessions", async (req: Request, res: Response) => {
    try {
      const sessions = await storage.listSessions();
      return res.json(sessions);
    } catch (error) {
      console.error("List sessions error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sessions", async (req: Request, res: Response) => {
    try {
      const parsed = insertSavedSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.format() });
      }
      const session = await storage.saveSession(parsed.data);
      return res.json(session);
    } catch (error) {
      console.error("Save session error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/sessions/:sessionId", async (req: Request, res: Response) => {
    try {
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      return res.json(session);
    } catch (error) {
      console.error("Get session error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/sessions/:sessionId", async (req: Request, res: Response) => {
    try {
      await storage.deleteSession(req.params.sessionId);
      return res.json({ success: true });
    } catch (error) {
      console.error("Delete session error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/companies/scores", (req: Request, res: Response) => {
    try {
      const ids = req.query.ids as string | undefined;
      let companyList = companies;
      
      if (ids) {
        const idArray = ids.split(",");
        companyList = companies.filter((c) => idArray.includes(c.id));
      }
      
      const scoreDetails = companyList.map((company) => ({
        id: company.id,
        qualityOfEarningsScore: company.qualityOfEarningsScore,
        financialPerformanceScore: company.financialPerformanceScore,
        industryAttractivenessScore: company.industryAttractivenessScore,
        competitivePositioningScore: company.competitivePositioningScore,
        managementGovernanceScore: company.managementGovernanceScore,
        operationalEfficiencyScore: company.operationalEfficiencyScore,
        customerMarketDynamicsScore: company.customerMarketDynamicsScore,
        productStrengthScore: company.productStrengthScore,
        exitFeasibilityScore: company.exitFeasibilityScore,
        scalabilityPotentialScore: company.scalabilityPotentialScore,
      }));
      
      return res.json(scoreDetails);
    } catch (error) {
      console.error("Company scores API error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/companies/:companyId/details", (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const company = getCompanyById(companyId);
      
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      return res.json({
        id: company.id,
        name: company.name,
        recurringRevenuePct: company.recurringRevenuePct,
        revenueGrowthPct: company.revenueGrowthPct,
        fcfConversionPct: company.fcfConversionPct,
        debtToEbitda: company.debtToEbitda,
        industryGrowthPct: company.industryGrowthPct,
        customerConcentrationPct: company.customerConcentrationPct,
        qualityOfEarningsScore: company.qualityOfEarningsScore,
        financialPerformanceScore: company.financialPerformanceScore,
        industryAttractivenessScore: company.industryAttractivenessScore,
        competitivePositioningScore: company.competitivePositioningScore,
        managementGovernanceScore: company.managementGovernanceScore,
        operationalEfficiencyScore: company.operationalEfficiencyScore,
        customerMarketDynamicsScore: company.customerMarketDynamicsScore,
        productStrengthScore: company.productStrengthScore,
        exitFeasibilityScore: company.exitFeasibilityScore,
        scalabilityPotentialScore: company.scalabilityPotentialScore,
      });
    } catch (error) {
      console.error("Company details API error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
