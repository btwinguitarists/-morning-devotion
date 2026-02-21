import Dexie, { type Table } from 'dexie';

// --- Types ---
export interface BiblePlanEntry {
  id?: number;
  day: number;
  references: string; // e.g., "Gen 1-3, Psalm 1"
  category?: string;
}

export interface ExaminationQuestion {
  id?: number;
  category: string;
  question: string;
}

export interface Session {
  id?: number;
  date: string; // ISO date string YYYY-MM-DD
  planDay: number;
  status: 'in-progress' | 'completed';
  startedAt: number; // timestamp
  completedAt?: number; // timestamp
  currentStep: number;
}

export interface Response {
  id?: number;
  sessionId: number;
  stepId: string; // 'meditation-1', 'meditation-2', 'exam-1', 'prayer', etc.
  questionTextSnapshot: string;
  answerText: string;
  updatedAt: number;
}

export interface ChecklistItem {
  id?: number;
  sessionId: number;
  reference: string;
  completed: boolean;
}

export interface MoodEntry {
  id?: number;
  sessionId: number;
  value: number; // 1-10
  note: string;
}

// --- Database Class ---
export class EremosDB extends Dexie {
  biblePlan!: Table<BiblePlanEntry>;
  examinationQuestions!: Table<ExaminationQuestion>;
  sessions!: Table<Session>;
  responses!: Table<Response>;
  checklistItems!: Table<ChecklistItem>;
  moodEntries!: Table<MoodEntry>;

  constructor() {
    super('EremosDB');
    this.version(1).stores({
      biblePlan: '++id, day',
      examinationQuestions: '++id, category',
      sessions: '++id, date, status',
      responses: '++id, sessionId, stepId',
      checklistItems: '++id, sessionId',
      moodEntries: '++id, sessionId'
    });
  }
}

export const db = new EremosDB();
