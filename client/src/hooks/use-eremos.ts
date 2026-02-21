import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Papa from "papaparse";
import { format } from "date-fns";
import { parseAllReferences } from "@/lib/bible";

interface BiblePlanEntry {
  day: number;
  references: string;
}

interface ExaminationQuestion {
  category: string;
  question: string;
}

export function useEremosData() {
  const [isLoading, setIsLoading] = useState(true);
  const [biblePlan, setBiblePlan] = useState<BiblePlanEntry[]>([]);
  const [examQuestions, setExamQuestions] = useState<ExaminationQuestion[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [planRes, examRes] = await Promise.all([
          fetch('/data/bible_plan.csv'),
          fetch('/data/desert_examination_framework.csv'),
        ]);

        if (planRes.ok) {
          const text = await planRes.text();
          const plan = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
          }).data.map((row: any) => ({
            day: parseInt(row.Day),
            references: [
              row['Torah / History'],
              row['Wisdom'],
              row['Prophets'],
              row['New Testament'],
            ].filter(Boolean).join('; '),
          }));
          setBiblePlan(plan as BiblePlanEntry[]);
        }

        if (examRes.ok) {
          const text = await examRes.text();
          const lines = text.split('\n').filter((l) => l.trim());
          const headers = lines[0].split(',').map((h) => h.trim().replace(/ \(.+\)/, ''));
          const categoryQuestions: ExaminationQuestion[] = [];

          for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            row.forEach((q, colIndex) => {
              if (q && headers[colIndex]) {
                categoryQuestions.push({
                  category: headers[colIndex],
                  question: q.replace(/^"|"$/g, '').trim(),
                });
              }
            });
          }
          setExamQuestions(categoryQuestions);
        }
      } catch (err) {
        console.error("Failed to load CSVs", err);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  return { isLoading, biblePlan, examQuestions };
}

export function useCurrentSession(userId?: string) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: session, isLoading } = useQuery<any>({
    queryKey: ['/api/sessions/current', today],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/current?date=${today}`, { credentials: 'include' });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch session');
      return res.json();
    },
    enabled: !!userId,
  });

  const startNewSession = useCallback(async (dayOverride?: number) => {
    if (!userId) return;

    let nextDay = dayOverride;
    if (nextDay === undefined) {
      try {
        const res = await fetch('/api/sessions/last-completed', { credentials: 'include' });
        if (res.ok) {
          const last = await res.json();
          nextDay = (last?.planDay || 0) + 1;
        } else {
          nextDay = 1;
        }
      } catch {
        nextDay = 1;
      }
    }

    const res = await apiRequest('POST', '/api/sessions', {
      date: today,
      planDay: nextDay,
      currentStep: 0,
    });
    const newSession = await res.json();
    queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/sessions/current'] });
    return newSession.id;
  }, [userId, today]);

  const updateStep = useCallback(async (sessionId: number, step: number) => {
    await apiRequest('PATCH', `/api/sessions/${sessionId}`, { currentStep: step });
    queryClient.invalidateQueries({ queryKey: ['/api/sessions/current'] });
  }, []);

  const completeSession = useCallback(async (sessionId: number) => {
    await apiRequest('PATCH', `/api/sessions/${sessionId}`, { status: 'completed' });
    queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/sessions/current'] });
  }, []);

  const deleteSession = useCallback(async (sessionId: number) => {
    if (!userId) return;
    await apiRequest('DELETE', `/api/sessions/${sessionId}`);
    queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/sessions/current'] });
  }, [userId]);

  const restartSession = useCallback(async (sessionId: number) => {
    if (!userId) return;
    await apiRequest('POST', `/api/sessions/${sessionId}/restart`);
    queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/sessions/current'] });
  }, [userId]);

  return {
    session: isLoading ? undefined : (session ?? null),
    startNewSession,
    updateStep,
    completeSession,
    deleteSession,
    restartSession,
  };
}

export function useReadingPlan(planDay: number, biblePlan?: BiblePlanEntry[]) {
  return useMemo(() => {
    if (!biblePlan || biblePlan.length === 0) return null;
    return biblePlan.find((p) => p.day === planDay) || null;
  }, [planDay, biblePlan]);
}

export function useChecklist(sessionId: number, referencesStr?: string) {
  const { data: items } = useQuery<any[]>({
    queryKey: ['/api/sessions', String(sessionId), 'checklist'],
    enabled: !!sessionId,
  });

  const creatingRef = useRef(false);

  useEffect(() => {
    if (
      referencesStr &&
      items &&
      items.length === 0 &&
      !creatingRef.current
    ) {
      creatingRef.current = true;
      const chapters = parseAllReferences(referencesStr);
      let newItems: { reference: string; completed: boolean }[];

      if (chapters.length > 0) {
        newItems = chapters.map((ch: any) => ({
          reference: ch.label,
          completed: false,
        }));
      } else {
        const refs = referencesStr.split(/[,;]/).map((r: string) => r.trim()).filter(Boolean);
        newItems = refs.map((ref: string) => ({
          reference: ref,
          completed: false,
        }));
      }

      apiRequest('POST', `/api/sessions/${sessionId}/checklist`, { items: newItems })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/sessions', String(sessionId), 'checklist'] });
        })
        .finally(() => {
          creatingRef.current = false;
        });
    }
  }, [sessionId, referencesStr, items]);

  const toggleItem = useCallback(async (id: number, completed: boolean) => {
    await apiRequest('PATCH', `/api/checklist/${id}`, { completed });
    queryClient.invalidateQueries({ queryKey: ['/api/sessions', String(sessionId), 'checklist'] });
  }, [sessionId]);

  return { items: items || [], toggleItem };
}

export function useResponse(sessionId: number, stepId: string) {
  const { data: allResponses } = useQuery<any[]>({
    queryKey: ['/api/sessions', String(sessionId), 'responses'],
    enabled: !!sessionId,
  });

  const response = useMemo(() => {
    if (!allResponses) return undefined;
    return allResponses.find((r: any) => r.stepId === stepId);
  }, [allResponses, stepId]);

  const saveResponse = useCallback(async (text: string, question: string) => {
    await apiRequest('POST', `/api/sessions/${sessionId}/responses`, {
      stepId,
      questionTextSnapshot: question,
      answerText: text,
    });
    queryClient.invalidateQueries({ queryKey: ['/api/sessions', String(sessionId), 'responses'] });
  }, [sessionId, stepId]);

  return { response, saveResponse };
}

export function usePrompts(planDay: number, examQuestions?: ExaminationQuestion[]) {
  const weekIndex = Math.floor((planDay - 1) / 7);
  const dayIndex = (planDay - 1) % 7;

  const categoryNames = [
    "Logismoi", "Humility", "Prayer",
    "Speech", "Detachment", "Acedia", "Daily Rhythm",
  ];
  const currentCategory = categoryNames[dayIndex] || categoryNames[0];

  const filteredExam = useMemo(() => {
    if (!examQuestions) return [];
    return examQuestions.filter((q) => q.category.startsWith(currentCategory));
  }, [examQuestions, currentCategory]);

  const selectedExam = useMemo(() => {
    if (filteredExam.length === 0) return [];
    const offset = weekIndex * 3;
    return [0, 1, 2].map(i => {
      const idx = (offset + i) % filteredExam.length;
      return filteredExam[idx];
    });
  }, [filteredExam, weekIndex]);

  const meditationPools = [
    [
      "What does this reveal about God's character?",
      "What does this show about how God acts?",
      "What aspect of God do I resist here?",
      "What would change if I believed this about God?",
      "What does God promise here?",
      "How does this passage show God's faithfulness?",
    ],
    [
      "What does this expose in me?",
      "Where do I resist this truth?",
      "What part of me is unsettled by this passage?",
      "What fear in me does this address?",
      "What comfort am I clinging to that this challenges?",
      "What truth here have I been avoiding?",
    ],
    [
      "What must be surrendered?",
      "What obedience is implied here?",
      "What would trust look like in response?",
      "Where is repentance needed?",
      "What is one concrete step of obedience today?",
      "What would change if I lived this passage out?",
    ],
  ];

  const getMeditationPrompt = (poolIndex: number) => {
    const pool = meditationPools[poolIndex];
    const idx = (planDay - 1) % pool.length;
    return pool[idx];
  };

  return {
    category: currentCategory,
    meditation: [
      { id: 'med-1', question: getMeditationPrompt(0), type: 'Revelation' },
      { id: 'med-2', question: getMeditationPrompt(1), type: 'Exposure' },
      { id: 'med-3', question: getMeditationPrompt(2), type: 'Response' },
    ],
    examination: selectedExam,
  };
}

export function useMood(sessionId: number) {
  const { data: mood } = useQuery<any>({
    queryKey: ['/api/sessions', String(sessionId), 'mood'],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/mood`, { credentials: 'include' });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch mood');
      return res.json();
    },
    enabled: !!sessionId,
  });

  const saveMood = useCallback(async (value: number, note: string) => {
    await apiRequest('POST', `/api/sessions/${sessionId}/mood`, { value, note });
    queryClient.invalidateQueries({ queryKey: ['/api/sessions', String(sessionId), 'mood'] });
  }, [sessionId]);

  return { mood: mood ?? undefined, saveMood };
}

export async function exportSessionToMarkdown(sessionId: number) {
  const res = await fetch(`/api/sessions/${sessionId}/export`, { credentials: 'include' });
  if (!res.ok) {
    console.error("Failed to export session");
    return;
  }
  const data = await res.json();
  const { session, responses, mood, checklist } = data;

  let md = `# ${session.date} - Eremos Session\n\n`;
  md += `**Day:** ${session.planDay}\n`;
  if (mood) {
    md += `**Mood:** ${mood.value}/10\n`;
    if (mood.note) md += `**Mood Note:** ${mood.note}\n`;
  }
  md += `\n---\n\n`;

  md += `## Scripture Readings\n`;
  if (checklist && checklist.length > 0) {
    checklist.forEach((item: any) => {
      md += `- [${item.completed ? 'x' : ' '}] ${item.reference}\n`;
    });
  }
  md += `\n`;

  const stepOrder = [
    'meditation-1', 'meditation-2', 'meditation-3',
    'examination-1', 'examination-2', 'examination-3',
    'prayer-free',
    'journal-midday', 'journal-evening',
  ];

  const labels: Record<string, string> = {
    'meditation-1': 'Meditation I (Revelation)',
    'meditation-2': 'Meditation II (Exposure)',
    'meditation-3': 'Meditation III (Response)',
    'examination-1': 'Examination I',
    'examination-2': 'Examination II',
    'examination-3': 'Examination III',
    'prayer-free': 'Free Prayer',
    'journal-midday': 'Mid-Day Reflections',
    'journal-evening': 'Evening Reflections',
  };

  if (responses) {
    stepOrder.forEach((stepId) => {
      const resp = responses.find((r: any) => r.stepId === stepId);
      if (resp && resp.answerText) {
        md += `### ${labels[stepId] || stepId}\n`;
        md += `*${resp.questionTextSnapshot}*\n\n`;
        md += `${resp.answerText}\n\n`;
      }
    });
  }

  md += `\n---\n*Amen.*`;

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
