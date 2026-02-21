import { useEffect } from "react";
import { useLocation } from "wouter";
import { useCurrentSession, useResponse, useMood, exportSessionToMarkdown } from "@/hooks/use-eremos";
import { useAuth } from "@/hooks/use-auth";
import { AutoTextArea } from "@/components/AutoTextArea";
import { MoodSlider } from "@/components/MoodSlider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Download, Sun, Moon, PenLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Journal() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { session } = useCurrentSession(user?.id);

  useEffect(() => {
    if (!user || session === null) {
      setLocation('/');
    }
  }, [user, session, setLocation]);

  if (!session || !user || session.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6 flex items-center justify-between border-b border-border/50">
        <Button variant="ghost" onClick={() => setLocation('/')} className="gap-2" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Button>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Day {session.planDay} Reflections
        </span>
        <Button variant="ghost" onClick={() => exportSessionToMarkdown(session.id!)} className="gap-2" data-testid="button-export-journal">
          <Download className="w-4 h-4" />
        </Button>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-primary" data-testid="text-journal-title">Continue Reflecting</h1>
          <p className="text-muted-foreground text-sm">
            Add thoughts as they arise throughout the day.
          </p>
        </div>

        <Tabs defaultValue="midday" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="midday" className="gap-1.5" data-testid="tab-midday">
              <Sun className="w-4 h-4" />
              Mid-Day
            </TabsTrigger>
            <TabsTrigger value="evening" className="gap-1.5" data-testid="tab-evening">
              <Moon className="w-4 h-4" />
              Evening
            </TabsTrigger>
          </TabsList>

          <TabsContent value="midday" className="space-y-6 mt-6">
            <JournalEntry 
              sessionId={session.id!} 
              stepId="journal-midday"
              question="What has the Spirit been saying since this morning?"
              placeholder="Mid-day reflections, noticing, gratitude..."
            />
          </TabsContent>

          <TabsContent value="evening" className="space-y-6 mt-6">
            <JournalEntry 
              sessionId={session.id!} 
              stepId="journal-evening"
              question="How did the day unfold? Where was God present?"
              placeholder="Evening review, consolations, desolations..."
            />
          </TabsContent>
        </Tabs>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <PenLine className="w-3.5 h-3.5" />
            Update Mood
          </div>
          <MoodUpdate sessionId={session.id!} />
        </Card>
      </div>
    </div>
  );
}

function JournalEntry({ sessionId, stepId, question, placeholder }: { 
  sessionId: number; stepId: string; question: string; placeholder: string 
}) {
  const { response, saveResponse } = useResponse(sessionId, stepId);

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-serif text-primary">{question}</h3>
      <AutoTextArea
        value={response?.answerText || ""}
        onChange={(val) => saveResponse(val, question)}
        placeholder={placeholder}
        className="min-h-[120px] text-base font-serif"
      />
      {response?.updatedAt && (
        <p className="text-[10px] text-muted-foreground">
          Last saved {new Date(response.updatedAt).toLocaleTimeString()}
        </p>
      )}
    </Card>
  );
}

function MoodUpdate({ sessionId }: { sessionId: number }) {
  const { mood, saveMood } = useMood(sessionId);
  
  return (
    <MoodSlider
      value={mood?.value || 5}
      note={mood?.note || ""}
      onChange={saveMood}
    />
  );
}
