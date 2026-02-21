import Dexie, { type Table } from 'dexie';

export interface BiblePlanEntry {
  id?: number;
  day: number;
  references: string;
  category?: string;
}

export interface ExaminationQuestion {
  id?: number;
  category: string;
  question: string;
}

export interface Session {
  id?: number;
  userId: string;
  date: string;
  planDay: number;
  status: 'in-progress' | 'completed';
  startedAt: number;
  completedAt?: number;
  currentStep: number;
}

export interface Response {
  id?: number;
  sessionId: number;
  stepId: string;
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
  value: number;
  note: string;
}

export class EremosDB extends Dexie {
  biblePlan!: Table<BiblePlanEntry>;
  examinationQuestions!: Table<ExaminationQuestion>;
  sessions!: Table<Session>;
  responses!: Table<Response>;
  checklistItems!: Table<ChecklistItem>;
  moodEntries!: Table<MoodEntry>;

  constructor() {
    super('EremosDB');
    this.version(4).stores({
      biblePlan: '++id, day',
      examinationQuestions: '++id, category',
      sessions: '++id, date, status, userId, [userId+date], [userId+status]',
      responses: '++id, [sessionId+stepId]',
      checklistItems: '++id, sessionId',
      moodEntries: '++id, sessionId'
    });
  }
}

export const db = new EremosDB();
