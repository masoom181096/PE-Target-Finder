import { 
  savedSessions, 
  type InsertSavedSession, 
  type SavedSession
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  saveSession(data: InsertSavedSession): Promise<SavedSession>;
  getSession(sessionId: string): Promise<SavedSession | undefined>;
  listSessions(): Promise<SavedSession[]>;
  deleteSession(sessionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async saveSession(data: InsertSavedSession): Promise<SavedSession> {
    const existing = await this.getSession(data.sessionId);
    if (existing) {
      const [updated] = await db
        .update(savedSessions)
        .set({
          name: data.name,
          phase: data.phase,
          fundMandate: data.fundMandate,
          scoringWeights: data.scoringWeights,
          thresholds: data.thresholds,
          shortlist: data.shortlist,
          chosenCompanyId: data.chosenCompanyId,
          messages: data.messages,
          thinkingSteps: data.thinkingSteps,
          updatedAt: new Date(),
        })
        .where(eq(savedSessions.sessionId, data.sessionId))
        .returning();
      return updated;
    }
    const [session] = await db.insert(savedSessions).values(data).returning();
    return session;
  }

  async getSession(sessionId: string): Promise<SavedSession | undefined> {
    const [session] = await db
      .select()
      .from(savedSessions)
      .where(eq(savedSessions.sessionId, sessionId));
    return session || undefined;
  }

  async listSessions(): Promise<SavedSession[]> {
    return db.select().from(savedSessions).orderBy(desc(savedSessions.updatedAt));
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(savedSessions).where(eq(savedSessions.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();
