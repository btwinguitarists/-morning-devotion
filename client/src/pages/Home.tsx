import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentSession, useEremosData, exportSessionToMarkdown } from "@/hooks/use-eremos";
import { Loader2, ArrowRight, BookOpen, Clock, Calendar, History, Download, Settings2 } from "lucide-react";
import { format } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Home() {
  const { isLoading } = useEremosData();
  const { session, startNewSession } = useCurrentSession();
  const [dayOverride, setDayOverride] = useState<string>("");

  const history = useLiveQuery(
    () => db.sessions.where('status').equals('completed').reverse().limit(5).toArray()
  );

  const handleStart = async () => {
    if (!session) {
      const day = dayOverride ? parseInt(dayOverride) : undefined;
      await startNewSession(day);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const today = format(new Date(), "EEEE, MMMM do");
  const currentPlanDay = session?.planDay || (history?.[0]?.planDay ? history[0].planDay + 1 : 1);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 py-12">
      <div className="max-w-md w-full space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-serif tracking-tight text-primary">Eremos</h1>
          <p className="text-muted-foreground font-serif italic text-lg">
            "Be still and know that I am God."
          </p>
        </div>

        {/* Date Display */}
        <div className="flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {today}
        </div>

        {/* Main Action Card */}
        <Card className="p-8 border-border shadow-2xl shadow-black/5 flex flex-col gap-6 items-center text-center hover:border-primary/20 transition-all duration-500 relative">
          {!session && (
            <div className="absolute top-4 right-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start on Day</label>
                    <Input 
                      type="number" 
                      placeholder={String(currentPlanDay)}
                      value={dayOverride}
                      onChange={(e) => setDayOverride(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Override the default progression if you missed days or want to jump ahead.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-medium">
              {session ? "Continue Session" : "Begin Morning Prayer"}
            </h2>
            <p className="text-muted-foreground">
              {session 
                ? `You are on step ${(session.currentStep || 0) + 1} of your daily rhythm.`
                : `Enter into silence. Prepare for Day ${dayOverride || currentPlanDay}.`}
            </p>
          </div>

          <Link href="/wizard">
            <Button 
              size="lg" 
              className="w-full text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              onClick={handleStart}
            >
              {session ? "Resume" : "Start"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </Card>

        {/* History Section */}
        {history && history.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">
              <History className="w-3 h-3" />
              Recent History
            </div>
            <div className="grid gap-2">
              {history.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-transparent hover:border-primary/10 transition-colors group">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{format(new Date(s.date), "MMM d, yyyy")}</span>
                    <span className="text-xs text-muted-foreground font-serif italic">Day {s.planDay}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => exportSessionToMarkdown(s.id!)}
                  >
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats / Footer */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-secondary/50 flex flex-col items-center gap-2 text-center">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Plan</span>
            <span className="font-serif text-lg">Day {currentPlanDay}</span>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 flex flex-col items-center gap-2 text-center">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</span>
            <span className="font-serif text-lg">{session ? "In Progress" : "Ready"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
