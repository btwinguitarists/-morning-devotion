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
            // Using a more robust parser configuration for Bible plan
            const plan = Papa.parse(text, { 
              header: true, 
              skipEmptyLines: true,
              transformHeader: (h) => h.trim() 
            }).data.map((row: any) => ({
              day: parseInt(row.Day),
              references: [
                row['Torah / History'],
                row['Wisdom'],
                row['Prophets'],
                row['New Testament']
              ].filter(Boolean).join('; ')
            }));
            await db.biblePlan.bulkAdd(plan as any);
          }
          
          const examRes = await fetch('/data/desert_examination_framework.csv');
          if (examRes.ok) {
            const text = await examRes.text();
            const lines = text.split('\n').filter(l => l.trim());
            const headers = lines[0].split(',').map(h => h.trim().replace(/ \(.+\)/, ''));
            const categoryQuestions: any[] = [];
            
            // Start from line 1 (first row of questions)
            for (let i = 1; i < lines.length; i++) {
              const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma but respect quotes
              row.forEach((q, colIndex) => {
                if (q && headers[colIndex]) {
                  categoryQuestions.push({
                    category: headers[colIndex],
                    question: q.replace(/^"|"$/g, '').trim()
                  });
                }
              });
            }
            await db.examinationQuestions.bulkAdd(categoryQuestions);
          }
        } catch (err) {
          console.error("Failed to load CSVs", err);
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

  const startNewSession = async (dayOverride?: number) => {
    // Calculate the next plan day based on history unless overridden
    let nextDay = dayOverride;
    if (nextDay === undefined) {
      const lastCompleted = await db.sessions.where('status').equals('completed').last();
      nextDay = (lastCompleted?.planDay || 0) + 1;
    }

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
  const weekIndex = Math.floor((planDay - 1) / 7);
  const processIndex = (planDay - 1) % 7;
  
  const categoryNames = [
    "Logismoi", "Humility", "Prayer Examination", 
    "Speech", "Detachment", "Acedia", "Daily Rhythm"
  ];
  const currentCategory = categoryNames[processIndex];

  const examQuestions = useLiveQuery(
    () => db.examinationQuestions.where('category').startsWith(currentCategory).toArray(),
    [currentCategory]
  );

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
    category: currentCategory,
    meditation: [
      { id: 'med-1', question: getMeditationPrompt(0), type: 'Revelation' },
      { id: 'med-2', question: getMeditationPrompt(1), type: 'Exposure' },
      { id: 'med-3', question: getMeditationPrompt(2), type: 'Response' }
    ],
    examination: examQuestions || []
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

// --- Export Helper ---
export async function exportSessionToMarkdown(sessionId: number) {
  const session = await db.sessions.get(sessionId);
  if (!session) return;

  const responses = await db.responses.where('sessionId').equals(sessionId).toArray();
  const mood = await db.moodEntries.where('sessionId').equals(sessionId).first();
  const checklist = await db.checklistItems.where('sessionId').equals(sessionId).toArray();
  const plan = await db.biblePlan.where('day').equals(session.planDay).first();

  let md = `# ${session.date} - Eremos Session\n\n`;
  md += `**Day:** ${session.planDay}\n`;
  if (mood) {
    md += `**Mood:** ${mood.value}/10\n`;
    if (mood.note) md += `**Mood Note:** ${mood.note}\n`;
  }
  md += `\n---\n\n`;

  md += `## Scripture Readings\n`;
  if (plan && plan.references) {
    const refs = plan.references.split(/[,;]/).map(r => r.trim()).filter(Boolean);
    refs.forEach(ref => {
      const isCompleted = checklist.find(c => c.reference === ref)?.completed;
      md += `- [${isCompleted ? 'x' : ' '}] ${ref}\n`;
    });
  } else {
    checklist.forEach(item => {
      md += `- [${item.completed ? 'x' : ' '}] ${item.reference}\n`;
    });
  }
  md += `\n`;

  const stepOrder = [
    'meditation-1', 'meditation-2', 'meditation-3',
    'examination-1', 'examination-2', 'examination-3',
    'prayer-free'
  ];

  const labels: Record<string, string> = {
    'meditation-1': 'Meditation I (Revelation)',
    'meditation-2': 'Meditation II (Exposure)',
    'meditation-3': 'Meditation III (Response)',
    'examination-1': 'Examination I',
    'examination-2': 'Examination II',
    'examination-3': 'Examination III',
    'prayer-free': 'Free Prayer'
  };

  stepOrder.forEach(stepId => {
    const resp = responses.find(r => r.stepId === stepId);
    if (resp && resp.answerText) {
      md += `### ${labels[stepId] || stepId}\n`;
      md += `*${resp.questionTextSnapshot}*\n\n`;
      md += `${resp.answerText}\n\n`;
    }
  });

  md += `\n---\n*Amen.*`;

  // Download logic
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.date}-eremos-day-${session.planDay}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
