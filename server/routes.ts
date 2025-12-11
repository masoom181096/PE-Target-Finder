import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { processMessage } from "./logic/stateMachine";
import { generateReport } from "./logic/reports";
import { nextRequestSchema, insertSavedSessionSchema } from "@shared/schema";
import { storage } from "./storage";
import { companies, getCompanyById } from "./data/companies";

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

  app.get("/api/report/:companyId", (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      const report = generateReport(companyId);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found for company" });
      }
      
      return res.json(report);
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

  return httpServer;
}
