import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const prayerSessions = pgTable("prayer_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: varchar("date").notNull(),
  planDay: integer("plan_day").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("in-progress"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  currentStep: integer("current_step").notNull().default(0),
});

export const prayerResponses = pgTable("prayer_responses", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  stepId: varchar("step_id").notNull(),
  questionTextSnapshot: text("question_text_snapshot").notNull().default(""),
  answerText: text("answer_text").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const checklistItems = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  reference: varchar("reference").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  value: integer("value").notNull(),
  note: text("note").notNull().default(""),
});

export const highlights = pgTable("highlights", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  bookId: varchar("book_id").notNull(),
  bookName: varchar("book_name").notNull().default(""),
  chapter: integer("chapter").notNull(),
  verseStart: integer("verse_start").notNull(),
  verseEnd: integer("verse_end").notNull(),
  highlightText: text("highlight_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrayerSessionSchema = createInsertSchema(prayerSessions).omit({ id: true, startedAt: true, completedAt: true });
export const insertPrayerResponseSchema = createInsertSchema(prayerResponses).omit({ id: true, updatedAt: true });
export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({ id: true });
export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({ id: true });
export const insertHighlightSchema = createInsertSchema(highlights).omit({ id: true, createdAt: true });

export type PrayerSession = typeof prayerSessions.$inferSelect;
export type InsertPrayerSession = z.infer<typeof insertPrayerSessionSchema>;
export type PrayerResponse = typeof prayerResponses.$inferSelect;
export type InsertPrayerResponse = z.infer<typeof insertPrayerResponseSchema>;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type Highlight = typeof highlights.$inferSelect;
export type InsertHighlight = z.infer<typeof insertHighlightSchema>;
