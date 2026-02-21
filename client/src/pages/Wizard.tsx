import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useLiveQuery } from "dexie-react-hooks";
import { 
  useCurrentSession, 
  useReadingPlan, 
  useChecklist, 
  useResponse, 
  usePrompts,
  useMood 
} from "@/hooks/use-eremos";
import { useAuth } from "@/hooks/use-auth";
import { WizardLayout } from "@/components/WizardLayout";
import { AutoTextArea } from "@/components/AutoTextArea";
import { MoodSlider } from "@/components/MoodSlider";
import { ChapterReader } from "@/components/ChapterReader";
import { Card } from "@/components/ui/card";
import { Loader2, Download, ChevronLeft, ChevronRight, BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportSessionToMarkdown } from "@/hooks/use-eremos";
import { parseAllReferences, type ChapterRef } from "@/lib/bible";
import { getBenedictionForDay } from "@/lib/benedictions";
import { db } from "@/lib/db";

const STEPS = [
  { id: 'prayer-open', title: 'Morning Consecration' },
  { id: 'reading', title: 'Lectio Divina' },
  { id: 'meditation-1', title: 'Meditation I' },
  { id: 'meditation-2', title: 'Meditation II' },
  { id: 'meditation-3', title: 'Meditation III' },
  { id: 'examination-1', title: 'Examination I' },
  { id: 'examination-2', title: 'Examination II' },
  { id: 'examination-3', title: 'Examination III' },
  { id: 'mood', title: 'Affective State' },
  { id: 'prayer-free', title: 'Free Prayer' },
  { id: 'prayer-close', title: 'Benediction' }
];

export default function Wizard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { session, updateStep, completeSession } = useCurrentSession(user?.id);
  const [stepIndex, setStepIndex] = useState<number | null>(null);

  useEffect(() => {
    if (session && stepIndex === null) {
      setStepIndex(session.currentStep || 0);
    }
  }, [session, stepIndex]);

  useEffect(() => {
    if (!user || session === null) {
      setLocation('/');
    }
  }, [user, session, setLocation]);

  if (!session || !user || stepIndex === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentStepDef = STEPS[stepIndex];
  
  const handleNext = async () => {
    if (stepIndex < STEPS.length - 1) {
      const next = stepIndex + 1;
      setStepIndex(next);
      await updateStep(session.id!, next);
    } else {
      if (session.status !== 'completed') {
        await completeSession(session.id!);
      }
      setLocation('/');
    }
  };

  const handleBack = async () => {
    if (stepIndex > 0) {
      const prev = stepIndex - 1;
      setStepIndex(prev);
      await updateStep(session.id!, prev);
    }
  };

  return (
    <WizardLayout
      currentStep={stepIndex}
      totalSteps={STEPS.length}
      onNext={handleNext}
      onBack={stepIndex > 0 ? handleBack : undefined}
      title={currentStepDef.title}
      isLastStep={stepIndex === STEPS.length - 1}
      onClose={() => setLocation('/')}
    >
      <StepContent 
        stepId={currentStepDef.id} 
        sessionId={session.id!} 
        planDay={session.planDay} 
      />
    </WizardLayout>
  );
}

function StepContent({ stepId, sessionId, planDay }: { stepId: string, sessionId: number, planDay: number }) {
  const prompts = usePrompts(planDay);

  switch (stepId) {
    case 'prayer-open':
      return <MorningPrayer />;

    case 'reading':
      return <ReadingStep sessionId={sessionId} planDay={planDay} />;

    case 'meditation-1':
      return <MeditationStep sessionId={sessionId} stepId={stepId} question={prompts.meditation[0].question} label="Revelation" />;
    
    case 'meditation-2':
      return <MeditationStep sessionId={sessionId} stepId={stepId} question={prompts.meditation[1].question} label="Exposure" />;

    case 'meditation-3':
      return <MeditationStep sessionId={sessionId} stepId={stepId} question={prompts.meditation[2].question} label="Response" />;

    case 'examination-1':
    case 'examination-2':
    case 'examination-3': {
      const examIndex = parseInt(stepId.split('-')[1]) - 1;
      const question = prompts.examination[examIndex]?.question || "Reflect on this moment.";
      return (
        <PromptStep 
          sessionId={sessionId} 
          stepId={stepId} 
          question={question} 
          label={`Examination: ${prompts.category}`} 
        />
      );
    }

    case 'mood':
      return <MoodStep sessionId={sessionId} />;

    case 'prayer-free':
      return <PromptStep sessionId={sessionId} stepId={stepId} question="Speak freely to your Father." label="Prayer" placeholder="Write your prayer here..." />;

    case 'prayer-close':
      return <ClosingPrayer sessionId={sessionId} planDay={planDay} />;

    default:
      return null;
  }
}

function MorningPrayer() {
  return (
    <div className="space-y-8 animate-in" data-testid="morning-prayer">
      <h1 className="text-3xl md:text-4xl font-serif text-primary">Morning Consecration</h1>
      <div className="space-y-6 text-lg md:text-xl font-serif leading-relaxed text-muted-foreground">
        <p className="text-foreground">Jesus, I give everyone and everything to You.</p>
        
        <div className="pl-4 border-l-2 border-primary/20 space-y-2 text-base md:text-lg">
          <p>I release my agenda.</p>
          <p>I release my need to control outcomes.</p>
          <p>I release the approval of others.</p>
          <p>I release my fears about what may happen.</p>
          <p>I release the burdens that are not mine to carry.</p>
          <p>I release the people I am trying to fix.</p>
          <p>I release the situations I am trying to manage.</p>
        </div>

        <p>I now bring the authority, rule, and dominion of the Lord Jesus Christ and the full work of Christ over my life today: over my home, my household, my work, over all my kingdom and domain.</p>

        <div className="space-y-1">
          <p className="text-foreground font-medium">Reign in me.</p>
          <p className="text-foreground font-medium">Rule through me.</p>
          <p className="text-foreground font-medium">Establish Your Kingdom in my life today.</p>
        </div>

        <p>I consecrate my spirit, soul, body, heart, mind, and will to you.</p>

        <div className="pl-4 border-l-2 border-primary/20 space-y-1 text-base md:text-lg">
          <p>I choose trust over control.</p>
          <p>Dependence over striving.</p>
          <p>Union with You over self-effort.</p>
        </div>

        <p>Restore my union with you, Father.</p>
        <p>Restore our union.</p>

        <div className="mt-4 space-y-1">
          <p className="text-primary font-medium">Lead me as my Shepherd.</p>
          <p className="text-primary font-medium">Be my strength for this day.</p>
        </div>
      </div>
    </div>
  );
}

function ClosingPrayer({ sessionId, planDay }: { sessionId: number, planDay: number }) {
  const benediction = getBenedictionForDay(planDay);

  return (
    <div className="flex flex-col items-center text-center space-y-10 animate-in" data-testid="closing-prayer">
      <div className="space-y-6 max-w-lg text-lg font-serif leading-relaxed text-muted-foreground">
        <h1 className="text-3xl md:text-4xl font-serif text-primary mb-8">Closing Prayer</h1>

        <p className="text-foreground">Lord Jesus Christ,</p>
        <p>You are my righteousness,</p>
        <p>my life,</p>
        <p>and my victory.</p>

        <p className="mt-4 text-foreground font-medium">I receive Your grace for this day.</p>

        <p className="mt-4">The grace of the Lord Jesus Christ,</p>
        <p>the love of God,</p>
        <p>and the fellowship of the Holy Spirit</p>
        <p>be with me and remain with me.</p>

        <p className="text-primary font-medium text-xl mt-6">Amen.</p>
      </div>

      <div className="w-full max-w-lg border-t border-primary/10 pt-8 mt-4">
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Today's Benediction</span>
        <p className="text-sm text-primary/70 font-medium mt-1 mb-4">{benediction.reference}</p>
        <blockquote className="font-serif text-base md:text-lg leading-relaxed text-foreground italic pl-4 border-l-2 border-primary/30">
          {benediction.text}
        </blockquote>
      </div>

      <div className="pt-4">
        <Button 
          variant="outline" 
          onClick={() => exportSessionToMarkdown(sessionId)}
          className="gap-2"
          data-testid="button-export-session"
        >
          <Download className="w-4 h-4" />
          Export Session
        </Button>
      </div>
    </div>
  );
}

function ReadingStep({ sessionId, planDay }: { sessionId: number, planDay: number }) {
  const plan = useReadingPlan(planDay);
  const { items, toggleItem } = useChecklist(sessionId, plan?.references);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const chapters = useMemo(() => {
    if (!plan?.references) return [];
    return parseAllReferences(plan.references);
  }, [plan?.references]);

  if (!plan) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
      <p className="text-muted-foreground animate-pulse">Preparing your readings...</p>
    </div>
  );

  if (chapters.length === 0) return (
    <div className="p-12 text-center border-2 border-dashed rounded-xl border-primary/10">
      <p className="text-muted-foreground italic">No readings found for today.</p>
    </div>
  );

  const activeChapter = chapters[activeChapterIndex];
  const isCurrentChapterRead = items.some(i => i.reference === activeChapter?.label && i.completed);

  const handleMarkRead = () => {
    const item = items.find(i => i.reference === activeChapter?.label);
    if (item) {
      toggleItem(item.id!, true);
    }
  };

  const allRead = items.length > 0 && items.every(i => i.completed);

  return (
    <div className="space-y-6 animate-in" data-testid="reading-step">
      <div className="space-y-2">
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Day {planDay}</span>
        <h1 className="text-3xl font-serif text-primary">Scripture Reading</h1>
      </div>

      {chapters.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2" data-testid="chapter-nav">
          {chapters.map((ch, idx) => {
            const isRead = items.some(i => i.reference === ch.label && i.completed);
            return (
              <Button
                key={`${ch.bookId}-${ch.chapter}`}
                variant={idx === activeChapterIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveChapterIndex(idx)}
                className={`gap-1 shrink-0 ${isRead && idx !== activeChapterIndex ? 'opacity-60' : ''}`}
                data-testid={`button-chapter-${idx}`}
              >
                {isRead && <Check className="h-3 w-3" />}
                {ch.bookName} {ch.chapter}
              </Button>
            );
          })}
        </div>
      )}

      {activeChapter && (
        <ChapterReader
          bookId={activeChapter.bookId}
          bookName={activeChapter.bookName}
          chapter={activeChapter.chapter}
          sessionId={sessionId}
          onMarkRead={handleMarkRead}
          isRead={isCurrentChapterRead}
        />
      )}

      {chapters.length > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            disabled={activeChapterIndex === 0}
            onClick={() => setActiveChapterIndex(i => i - 1)}
            className="gap-1"
            data-testid="button-prev-chapter"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {activeChapterIndex + 1} of {chapters.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={activeChapterIndex === chapters.length - 1}
            onClick={() => setActiveChapterIndex(i => i + 1)}
            className="gap-1"
            data-testid="button-next-chapter"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {allRead && (
        <div className="text-center text-sm text-primary font-medium pt-2" data-testid="text-all-read">
          All chapters read — continue when ready.
        </div>
      )}
    </div>
  );
}

function HighlightBanner({ sessionId }: { sessionId: number }) {
  const highlights = useLiveQuery(
    () => db.highlights.where('sessionId').equals(sessionId).toArray(),
    [sessionId],
    []
  );

  if (!highlights || highlights.length === 0) return null;

  const latest = highlights[highlights.length - 1];

  return (
    <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-lg px-4 py-3 mb-4" data-testid="highlight-banner">
      <span className="text-xs font-bold tracking-widest uppercase text-amber-700/70 dark:text-amber-400/70">Your Highlight</span>
      <p className="font-serif text-sm italic text-amber-900/80 dark:text-amber-200/80 mt-1 leading-relaxed">
        "{latest.text}"
      </p>
    </div>
  );
}

function MeditationStep({ sessionId, stepId, question, label }: { sessionId: number, stepId: string, question: string, label: string }) {
  const { response, saveResponse } = useResponse(sessionId, stepId);

  return (
    <div className="flex flex-col h-full animate-in">
      <HighlightBanner sessionId={sessionId} />
      <div className="mb-8 space-y-4">
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">{label}</span>
        <h2 className="text-2xl md:text-3xl font-serif text-primary leading-tight">{question}</h2>
      </div>
      
      <div className="flex-1">
        <AutoTextArea
          value={response?.answerText || ""}
          onChange={(val) => saveResponse(val, question)}
          placeholder="Type your reflection here..."
          className="h-full text-lg md:text-xl font-serif"
        />
      </div>
    </div>
  );
}

function PromptStep({ sessionId, stepId, question, label, placeholder }: { sessionId: number, stepId: string, question: string, label: string, placeholder?: string }) {
  const { response, saveResponse } = useResponse(sessionId, stepId);

  return (
    <div className="flex flex-col h-full animate-in">
      <div className="mb-8 space-y-4">
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">{label}</span>
        <h2 className="text-2xl md:text-3xl font-serif text-primary leading-tight">{question}</h2>
      </div>
      
      <div className="flex-1">
        <AutoTextArea
          value={response?.answerText || ""}
          onChange={(val) => saveResponse(val, question)}
          placeholder={placeholder || "Type your reflection here..."}
          className="h-full text-lg md:text-xl font-serif"
        />
      </div>
    </div>
  );
}

function MoodStep({ sessionId }: { sessionId: number }) {
  const { mood, saveMood } = useMood(sessionId);

  return (
    <div className="space-y-8 animate-in max-w-md mx-auto w-full">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-3xl font-serif text-primary">Name Your State</h1>
        <p className="text-muted-foreground">Where is your heart right now?</p>
      </div>
      
      <MoodSlider
        value={mood?.value || 5}
        note={mood?.note || ""}
        onChange={saveMood}
      />
    </div>
  );
}
