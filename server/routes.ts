import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, isAuthenticated } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getSessionsByUser(userId);
      res.json(sessions);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get('/api/sessions/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date as string;
      if (date) {
        const todaySessions = await storage.getSessionsByUserAndDate(userId, date);
        if (todaySessions.length > 0) return res.json(todaySessions[0]);
      }
      const inProgress = await storage.getInProgressSession(userId);
      if (inProgress) return res.json(inProgress);
      res.json(null);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.get('/api/sessions/last-completed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getLastCompletedSession(userId);
      res.json(session || null);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date, planDay, currentStep } = req.body;
      const session = await storage.createSession({
        userId,
        date,
        planDay,
        status: "in-progress",
        currentStep: currentStep || 0,
      });
      res.json(session);
    } catch (e) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.patch('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      const updates: any = {};
      if (req.body.currentStep !== undefined) updates.currentStep = req.body.currentStep;
      if (req.body.status !== undefined) {
        updates.status = req.body.status;
        if (req.body.status === "completed") updates.completedAt = new Date();
      }
      await storage.updateSession(id, updates);
      const updated = await storage.getSession(id);
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  app.delete('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      await storage.deleteSession(id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  app.post('/api/sessions/:id/restart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      await storage.deleteChecklistBySession(id);
      await storage.deleteMoodBySession(id);
      await storage.deleteHighlightsBySession(id);
      await db_deleteResponsesBySession(id);
      await storage.updateSession(id, { status: "in-progress", currentStep: 0, completedAt: null });
      const updated = await storage.getSession(id);
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: "Failed to restart session" });
    }
  });

  app.get('/api/sessions/:id/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      const responses = await storage.getResponsesBySession(id);
      res.json(responses);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.post('/api/sessions/:id/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      const response = await storage.upsertResponse({
        sessionId: id,
        stepId: req.body.stepId,
        questionTextSnapshot: req.body.questionTextSnapshot || "",
        answerText: req.body.answerText || "",
      });
      res.json(response);
    } catch (e) {
      res.status(500).json({ error: "Failed to save response" });
    }
  });

  app.get('/api/sessions/:id/checklist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      const items = await storage.getChecklistBySession(id);
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch checklist" });
    }
  });

  app.post('/api/sessions/:id/checklist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      const items = req.body.items as Array<{ reference: string; completed: boolean }>;
      await storage.bulkCreateChecklist(items.map(i => ({ sessionId: id, reference: i.reference, completed: i.completed })));
      const created = await storage.getChecklistBySession(id);
      res.json(created);
    } catch (e) {
      res.status(500).json({ error: "Failed to create checklist" });
    }
  });

  app.patch('/api/checklist/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.toggleChecklistItem(parseInt(req.params.id), req.body.completed);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to toggle checklist" });
    }
  });

  app.get('/api/sessions/:id/mood', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      const mood = await storage.getMoodBySession(id);
      res.json(mood || null);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch mood" });
    }
  });

  app.post('/api/sessions/:id/mood', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      const mood = await storage.upsertMood({
        sessionId: id,
        value: req.body.value,
        note: req.body.note || "",
      });
      res.json(mood);
    } catch (e) {
      res.status(500).json({ error: "Failed to save mood" });
    }
  });

  app.get('/api/sessions/:id/highlights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      const h = await storage.getHighlightsBySession(id);
      res.json(h);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch highlights" });
    }
  });

  app.post('/api/sessions/:id/highlights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      const highlight = await storage.createHighlight({
        sessionId: id,
        bookId: req.body.bookId,
        chapter: req.body.chapter,
        verseStart: req.body.verseStart,
        verseEnd: req.body.verseEnd,
        highlightText: req.body.highlightText,
      });
      res.json(highlight);
    } catch (e) {
      res.status(500).json({ error: "Failed to save highlight" });
    }
  });

  app.get('/api/sessions/:id/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      if (!session || session.userId !== userId) return res.status(404).json({ error: "Not found" });
      const responses = await storage.getResponsesBySession(id);
      const mood = await storage.getMoodBySession(id);
      const checklist = await storage.getChecklistBySession(id);
      res.json({ session, responses, mood, checklist });
    } catch (e) {
      res.status(500).json({ error: "Failed to export session" });
    }
  });

  return httpServer;
}

async function db_deleteResponsesBySession(sessionId: number) {
  const { db } = await import("./db");
  const { prayerResponses } = await import("@shared/schema");
  const { eq } = await import("drizzle-orm");
  await db.delete(prayerResponses).where(eq(prayerResponses.sessionId, sessionId));
}
