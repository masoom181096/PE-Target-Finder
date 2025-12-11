import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { processMessage } from "./logic/stateMachine";
import { generateReport } from "./logic/reports";
import { nextRequestSchema } from "@shared/schema";

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

  return httpServer;
}
