import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import {
  prayerSessions,
  prayerResponses,
  checklistItems,
  moodEntries,
  highlights,
  type PrayerSession,
  type InsertPrayerSession,
  type PrayerResponse,
  type InsertPrayerResponse,
  type ChecklistItem,
  type InsertChecklistItem,
  type MoodEntry,
  type InsertMoodEntry,
  type Highlight,
  type InsertHighlight,
} from "@shared/schema";

export interface IStorage {
  getSessionsByUser(userId: string): Promise<PrayerSession[]>;
  getSessionsByUserAndDate(userId: string, date: string): Promise<PrayerSession[]>;
  getSession(id: number): Promise<PrayerSession | undefined>;
  getLastCompletedSession(userId: string): Promise<PrayerSession | undefined>;
  getInProgressSession(userId: string): Promise<PrayerSession | undefined>;
  createSession(data: InsertPrayerSession): Promise<PrayerSession>;
  updateSession(id: number, data: Partial<PrayerSession>): Promise<void>;
  deleteSession(id: number): Promise<void>;

  getResponsesBySession(sessionId: number): Promise<PrayerResponse[]>;
  getResponse(sessionId: number, stepId: string): Promise<PrayerResponse | undefined>;
  upsertResponse(data: InsertPrayerResponse): Promise<PrayerResponse>;

  getChecklistBySession(sessionId: number): Promise<ChecklistItem[]>;
  bulkCreateChecklist(items: InsertChecklistItem[]): Promise<void>;
  getChecklistItem(id: number): Promise<ChecklistItem | undefined>;
  toggleChecklistItem(id: number, completed: boolean): Promise<void>;
  deleteChecklistBySession(sessionId: number): Promise<void>;
  deleteResponsesBySession(sessionId: number): Promise<void>;

  getMoodBySession(sessionId: number): Promise<MoodEntry | undefined>;
  upsertMood(data: InsertMoodEntry): Promise<MoodEntry>;
  deleteMoodBySession(sessionId: number): Promise<void>;

  getHighlightsBySession(sessionId: number): Promise<Highlight[]>;
  createHighlight(data: InsertHighlight): Promise<Highlight>;
  deleteHighlightsBySession(sessionId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getSessionsByUser(userId: string): Promise<PrayerSession[]> {
    return db.select().from(prayerSessions).where(eq(prayerSessions.userId, userId)).orderBy(desc(prayerSessions.id));
  }

  async getSessionsByUserAndDate(userId: string, date: string): Promise<PrayerSession[]> {
    return db.select().from(prayerSessions).where(and(eq(prayerSessions.userId, userId), eq(prayerSessions.date, date)));
  }

  async getSession(id: number): Promise<PrayerSession | undefined> {
    const [session] = await db.select().from(prayerSessions).where(eq(prayerSessions.id, id));
    return session;
  }

  async getLastCompletedSession(userId: string): Promise<PrayerSession | undefined> {
    const [session] = await db.select().from(prayerSessions)
      .where(and(eq(prayerSessions.userId, userId), eq(prayerSessions.status, "completed")))
      .orderBy(desc(prayerSessions.id)).limit(1);
    return session;
  }

  async getInProgressSession(userId: string): Promise<PrayerSession | undefined> {
    const [session] = await db.select().from(prayerSessions)
      .where(and(eq(prayerSessions.userId, userId), eq(prayerSessions.status, "in-progress")))
      .orderBy(desc(prayerSessions.id)).limit(1);
    return session;
  }

  async createSession(data: InsertPrayerSession): Promise<PrayerSession> {
    const [session] = await db.insert(prayerSessions).values(data).returning();
    return session;
  }

  async updateSession(id: number, data: Partial<PrayerSession>): Promise<void> {
    await db.update(prayerSessions).set(data).where(eq(prayerSessions.id, id));
  }

  async deleteSession(id: number): Promise<void> {
    await db.delete(prayerResponses).where(eq(prayerResponses.sessionId, id));
    await db.delete(checklistItems).where(eq(checklistItems.sessionId, id));
    await db.delete(moodEntries).where(eq(moodEntries.sessionId, id));
    await db.delete(highlights).where(eq(highlights.sessionId, id));
    await db.delete(prayerSessions).where(eq(prayerSessions.id, id));
  }

  async getResponsesBySession(sessionId: number): Promise<PrayerResponse[]> {
    return db.select().from(prayerResponses).where(eq(prayerResponses.sessionId, sessionId));
  }

  async getResponse(sessionId: number, stepId: string): Promise<PrayerResponse | undefined> {
    const [resp] = await db.select().from(prayerResponses)
      .where(and(eq(prayerResponses.sessionId, sessionId), eq(prayerResponses.stepId, stepId)));
    return resp;
  }

  async upsertResponse(data: InsertPrayerResponse): Promise<PrayerResponse> {
    const existing = await this.getResponse(data.sessionId, data.stepId);
    if (existing) {
      await db.update(prayerResponses)
        .set({ answerText: data.answerText, questionTextSnapshot: data.questionTextSnapshot, updatedAt: new Date() })
        .where(eq(prayerResponses.id, existing.id));
      return { ...existing, answerText: data.answerText || "", questionTextSnapshot: data.questionTextSnapshot || "" };
    }
    const [resp] = await db.insert(prayerResponses).values(data).returning();
    return resp;
  }

  async getChecklistBySession(sessionId: number): Promise<ChecklistItem[]> {
    return db.select().from(checklistItems).where(eq(checklistItems.sessionId, sessionId));
  }

  async bulkCreateChecklist(items: InsertChecklistItem[]): Promise<void> {
    if (items.length > 0) {
      await db.insert(checklistItems).values(items);
    }
  }

  async getChecklistItem(id: number): Promise<ChecklistItem | undefined> {
    const [item] = await db.select().from(checklistItems).where(eq(checklistItems.id, id));
    return item;
  }

  async toggleChecklistItem(id: number, completed: boolean): Promise<void> {
    await db.update(checklistItems).set({ completed }).where(eq(checklistItems.id, id));
  }

  async deleteResponsesBySession(sessionId: number): Promise<void> {
    await db.delete(prayerResponses).where(eq(prayerResponses.sessionId, sessionId));
  }

  async deleteChecklistBySession(sessionId: number): Promise<void> {
    await db.delete(checklistItems).where(eq(checklistItems.sessionId, sessionId));
  }

  async getMoodBySession(sessionId: number): Promise<MoodEntry | undefined> {
    const [mood] = await db.select().from(moodEntries).where(eq(moodEntries.sessionId, sessionId));
    return mood;
  }

  async upsertMood(data: InsertMoodEntry): Promise<MoodEntry> {
    const existing = await this.getMoodBySession(data.sessionId);
    if (existing) {
      await db.update(moodEntries).set({ value: data.value, note: data.note }).where(eq(moodEntries.id, existing.id));
      return { ...existing, value: data.value, note: data.note || "" };
    }
    const [mood] = await db.insert(moodEntries).values(data).returning();
    return mood;
  }

  async deleteMoodBySession(sessionId: number): Promise<void> {
    await db.delete(moodEntries).where(eq(moodEntries.sessionId, sessionId));
  }

  async getHighlightsBySession(sessionId: number): Promise<Highlight[]> {
    return db.select().from(highlights).where(eq(highlights.sessionId, sessionId));
  }

  async createHighlight(data: InsertHighlight): Promise<Highlight> {
    const [highlight] = await db.insert(highlights).values(data).returning();
    return highlight;
  }

  async deleteHighlightsBySession(sessionId: number): Promise<void> {
    await db.delete(highlights).where(eq(highlights.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();
