import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { 
  useCurrentSession, 
  useReadingPlan, 
  useChecklist, 
  useResponse, 
  usePrompts,
  useMood 
} from "@/hooks/use-eremos";
import { WizardLayout } from "@/components/WizardLayout";
import { AutoTextArea } from "@/components/AutoTextArea";
import { MoodSlider } from "@/components/MoodSlider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportSessionToMarkdown } from "@/hooks/use-eremos";

// Wizard Steps Definition
const STEPS = [
  { id: 'prayer-open', title: 'Orientation' },
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
  const [location, setLocation] = useLocation();
  const { session, updateStep, completeSession } = useCurrentSession();
  const [stepIndex, setStepIndex] = useState<number | null>(null);

  // Sync step index with session
  useEffect(() => {
    if (session && stepIndex === null) {
      setStepIndex(session.currentStep || 0);
    }
  }, [session, stepIndex]);

  // If loading or no session, wait or redirect
  if (!session || stepIndex === null) {
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

// --- Step Content Switcher ---
function StepContent({ stepId, sessionId, planDay }: { stepId: string, sessionId: number, planDay: number }) {
  const { prompts } = { prompts: usePrompts(planDay) }; // Re-wrapped for consistent hook usage
  const readingPlan = useReadingPlan(planDay);

  switch (stepId) {
    case 'prayer-open':
      return (
        <div className="space-y-8 animate-in">
          <h1 className="text-3xl md:text-4xl font-serif text-primary">Morning Offering</h1>
          <div className="space-y-6 text-lg md:text-xl font-serif leading-relaxed text-muted-foreground">
            <p>Jesus, I give everyone and everything to You.</p>
            
            <div className="pl-4 border-l-2 border-primary/10 space-y-2 text-base md:text-lg">
              <p>I release my agenda.</p>
              <p>I release my need to control outcomes.</p>
              <p>I release the approval of others.</p>
              <p>I release my fears about what may happen.</p>
              <p>I release the burdens that are not mine to carry.</p>
            </div>

            <p>I now bring the authority, rule, and dominion of the Lord Jesus Christ over my life today.</p>
            <p>Reign in me. Rule through me.</p>
            <p>Restore our union.</p>
            <p className="text-primary font-medium">Be my strength for this day.</p>
          </div>
        </div>
      );

    case 'reading':
      return <ReadingStep sessionId={sessionId} planDay={planDay} />;

    case 'meditation-1':
      return <PromptStep sessionId={sessionId} stepId={stepId} question={prompts.meditation[0].question} label="Revelation" />;
    
    case 'meditation-2':
      return <PromptStep sessionId={sessionId} stepId={stepId} question={prompts.meditation[1].question} label="Exposure" />;

    case 'meditation-3':
      return <PromptStep sessionId={sessionId} stepId={stepId} question={prompts.meditation[2].question} label="Response" />;

    case 'examination-1':
    case 'examination-2':
    case 'examination-3':
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

    case 'mood':
      return <MoodStep sessionId={sessionId} />;

    case 'prayer-free':
      return <PromptStep sessionId={sessionId} stepId={stepId} question="Speak freely to your Father." label="Prayer" placeholder="Write your prayer here..." />;

    case 'prayer-close':
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in">
          <h1 className="text-5xl font-serif text-primary">Amen.</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Go in peace. The Lord is with you.
          </p>
          <div className="pt-8">
            <Button 
              variant="outline" 
              onClick={() => exportSessionToMarkdown(sessionId)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export Session (Markdown)
            </Button>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// --- Individual Step Components ---

function ReadingStep({ sessionId, planDay }: { sessionId: number, planDay: number }) {
  const plan = useReadingPlan(planDay);
  const { items, toggleItem } = useChecklist(sessionId, plan?.references);

  // Show a simpler loader or wait until items are initialized
  if (!plan) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
      <p className="text-muted-foreground animate-pulse">Preparing your readings...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in">
      <div className="space-y-2">
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Day {planDay}</span>
        <h1 className="text-3xl font-serif text-primary">Scripture Reading</h1>
      </div>

      <div className="grid gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <Card 
              key={item.id} 
              className={`
                p-6 flex items-center gap-4 cursor-pointer transition-all duration-300
                ${item.completed ? 'bg-secondary border-transparent' : 'bg-card border-border hover:shadow-md'}
              `}
              onClick={() => toggleItem(item.id!, !item.completed)}
            >
              <Checkbox checked={item.completed} className="w-6 h-6 rounded-full" />
              <span className={`text-xl font-medium ${item.completed ? 'text-muted-foreground line-through decoration-muted-foreground/50' : 'text-foreground'}`}>
                {item.reference}
              </span>
            </Card>
          ))
        ) : (
          <div className="p-12 text-center border-2 border-dashed rounded-xl border-primary/10">
            <p className="text-muted-foreground italic">No readings found for today.</p>
          </div>
        )}
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
