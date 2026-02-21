import { useLiveQuery } from "dexie-react-hooks";
import { db, type Session, type Response, type ChecklistItem } from "@/lib/db";
import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import { format } from "date-fns";

// --- Seed Data Helper ---
// In a real app, this would load from CSVs in /public/data
// For this generation, we'll embed some sample data to ensure it works immediately
const SAMPLE_PLAN = `day,references
1,Genesis 1-3; Psalm 1
2,Genesis 4-7; Psalm 2
3,Genesis 8-11; Psalm 3`;

const SAMPLE_EXAM = `category,question
Logismoi,What thoughts have I been entertaining today?
Humility,Where have I sought to be noticed?
Prayer,Has my prayer been distracted or attentive?
Speech,Have I spoken words that were better left unsaid?`;

export function useEremosData() {
  const [isLoading, setIsLoading] = useState(true);

  // Initialize DB with CSV data if empty
  useEffect(() => {
    const initData = async () => {
      const planCount = await db.biblePlan.count();
      if (planCount === 0) {
        try {
          const res = await fetch('/data/bible_plan.csv');
          if (res.ok) {
            const text = await res.text();
            const plan = Papa.parse(text, { header: true, skipEmptyLines: true }).data;
            await db.biblePlan.bulkAdd(plan as any);
          } else {
            // Fallback if fetch fails
            const plan = Papa.parse(SAMPLE_PLAN, { header: true, skipEmptyLines: true }).data;
            await db.biblePlan.bulkAdd(plan as any);
          }
          
          const examRes = await fetch('/data/desert_examination_framework.csv');
          if (examRes.ok) {
            const text = await examRes.text();
            const exam = Papa.parse(text, { header: true, skipEmptyLines: true }).data;
            await db.examinationQuestions.bulkAdd(exam as any);
          } else {
            const exam = Papa.parse(SAMPLE_EXAM, { header: true, skipEmptyLines: true }).data;
            await db.examinationQuestions.bulkAdd(exam as any);
          }
        } catch (err) {
          console.error("Failed to load CSVs, using samples", err);
          const plan = Papa.parse(SAMPLE_PLAN, { header: true, skipEmptyLines: true }).data;
          await db.biblePlan.bulkAdd(plan as any);
          const exam = Papa.parse(SAMPLE_EXAM, { header: true, skipEmptyLines: true }).data;
          await db.examinationQuestions.bulkAdd(exam as any);
        }
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  return { isLoading };
}

// --- Session Management ---
export function useCurrentSession() {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const session = useLiveQuery(async () => {
    // Try to find today's session first
    let s = await db.sessions.where('date').equals(today).first();
    
    // If not, find the most recent in-progress one (maybe from yesterday)
    if (!s) {
      s = await db.sessions.where('status').equals('in-progress').last();
    }
    return s;
  });

  const startNewSession = async () => {
    // Calculate the next plan day based on history
    const lastCompleted = await db.sessions.where('status').equals('completed').last();
    const nextDay = (lastCompleted?.planDay || 0) + 1;

    const id = await db.sessions.add({
      date: today,
      planDay: nextDay,
      status: 'in-progress',
      startedAt: Date.now(),
      currentStep: 0
    });
    return id;
  };

  const updateStep = async (sessionId: number, step: number) => {
    await db.sessions.update(sessionId, { currentStep: step });
  };

  const completeSession = async (sessionId: number) => {
    await db.sessions.update(sessionId, { 
      status: 'completed',
      completedAt: Date.now()
    });
  };

  return { session, startNewSession, updateStep, completeSession };
}

// --- Reading Plan ---
export function useReadingPlan(planDay: number) {
  const plan = useLiveQuery(() => db.biblePlan.where('day').equals(planDay).first(), [planDay]);
  
  // Return a stable object even if loading
  return plan || null;
}

// --- Checklist ---
export function useChecklist(sessionId: number, referencesStr?: string) {
  const items = useLiveQuery(() => db.checklistItems.where('sessionId').equals(sessionId).toArray(), [sessionId]);

  // Initialize checklist items if they don't exist yet for this session
  useEffect(() => {
    if (referencesStr && items && items.length === 0) {
      const refs = referencesStr.split(/[,;]/).map(r => r.trim()).filter(Boolean);
      const newItems = refs.map(ref => ({
        sessionId,
        reference: ref,
        completed: false
      }));
      db.checklistItems.bulkAdd(newItems);
    }
  }, [sessionId, referencesStr, items]);

  const toggleItem = async (id: number, completed: boolean) => {
    await db.checklistItems.update(id, { completed });
  };

  return { items: items || [], toggleItem };
}

// --- Responses (Autosave) ---
export function useResponse(sessionId: number, stepId: string) {
  const response = useLiveQuery(
    () => db.responses.where({ sessionId, stepId }).first(),
    [sessionId, stepId]
  );

  const saveResponse = useCallback(async (text: string, question: string) => {
    const existing = await db.responses.where({ sessionId, stepId }).first();
    if (existing) {
      await db.responses.update(existing.id!, { 
        answerText: text,
        updatedAt: Date.now() 
      });
    } else {
      await db.responses.add({
        sessionId,
        stepId,
        questionTextSnapshot: question,
        answerText: text,
        updatedAt: Date.now()
      });
    }
  }, [sessionId, stepId]);

  return { response, saveResponse };
}

// --- Prompts Logic ---
export function usePrompts(planDay: number) {
  // Logic from requirements:
  // Week Index = floor((planDay - 1) / 7)
  // Pools cycle based on weekIndex
  
  const weekIndex = Math.floor((planDay - 1) / 7);

  const meditationPools = [
    [
      "What does this reveal about God's character?",
      "What does this show about how God acts?",
      "What aspect of God do I resist here?",
      "What would change if I believed this about God?"
    ],
    [
      "What does this expose in me?",
      "Where do I resist this truth?",
      "What part of me is unsettled by this passage?",
      "What fear in me does this address?"
    ],
    [
      "What must be surrendered?",
      "What obedience is implied here?",
      "What would trust look like in response?",
      "Where is repentance needed?"
    ]
  ];

  const getMeditationPrompt = (poolIndex: number) => {
    const pool = meditationPools[poolIndex];
    return pool[weekIndex % pool.length];
  };

  return {
    meditation: [
      { id: 'med-1', question: getMeditationPrompt(0), type: 'Revelation' },
      { id: 'med-2', question: getMeditationPrompt(1), type: 'Exposure' },
      { id: 'med-3', question: getMeditationPrompt(2), type: 'Response' }
    ]
  };
}

// --- Mood ---
export function useMood(sessionId: number) {
  const mood = useLiveQuery(() => db.moodEntries.where('sessionId').equals(sessionId).first(), [sessionId]);

  const saveMood = async (value: number, note: string) => {
    const existing = await db.moodEntries.where('sessionId').equals(sessionId).first();
    if (existing) {
      await db.moodEntries.update(existing.id!, { value, note });
    } else {
      await db.moodEntries.add({ sessionId, value, note });
    }
  };

  return { mood, saveMood };
}
