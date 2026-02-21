import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentSession, useEremosData, exportSessionToMarkdown } from "@/hooks/use-eremos";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ArrowRight, BookOpen, Clock, Calendar, History, Download, Settings2, Trash2, RotateCcw, PenLine, LogOut } from "lucide-react";
import { format } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Home() {
  const { isLoading } = useEremosData();
  const { user } = useAuth();
  const userId = user?.id;
  const { session, startNewSession, deleteSession, restartSession } = useCurrentSession(userId);
  const [dayOverride, setDayOverride] = useState<string>("");

  const history = useLiveQuery(
    () => userId 
      ? db.sessions.where({ userId, status: 'completed' }).reverse().limit(5).toArray()
      : [],
    [userId]
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
  const isCompleted = session?.status === 'completed';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 py-12">
      <div className="max-w-md w-full space-y-12">
        
        {/* User Bar */}
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="" 
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                  data-testid="img-avatar"
                />
              )}
              <span className="text-sm text-muted-foreground" data-testid="text-user-name">
                {user.firstName || user.email || "Pilgrim"}
              </span>
            </div>
            <a href="/api/logout">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1.5" data-testid="button-logout">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </a>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-serif tracking-tight text-primary" data-testid="text-app-title">Eremos</h1>
          <p className="text-muted-foreground font-serif italic text-lg">
            "Be still and know that I am God."
          </p>
          <p className="text-xs text-muted-foreground/50 tracking-wide uppercase">Psalm 46:10</p>
        </div>

        {/* Date Display */}
        <div className="flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {today}
        </div>

        {/* Main Action Card */}
        <Card className="p-8 border-border shadow-2xl shadow-black/5 flex flex-col gap-6 items-center text-center hover:border-primary/20 transition-all duration-500 relative">
          {/* Settings gear - only show when no session exists */}
          {!session && (
            <div className="absolute top-4 right-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" data-testid="button-settings">
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
                      data-testid="input-day-override"
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
            <h2 className="text-2xl font-serif font-medium" data-testid="text-session-title">
              {session 
                ? (isCompleted ? "Add Reflections" : "Continue Session") 
                : "Begin Morning Prayer"}
            </h2>
            <p className="text-muted-foreground" data-testid="text-session-status">
              {session 
                ? (isCompleted 
                    ? `Day ${session.planDay} is complete. Add mid-day or evening thoughts.`
                    : `You are on step ${(session.currentStep || 0) + 1} of your daily rhythm.`)
                : `Enter into silence. Prepare for Day ${dayOverride || currentPlanDay}.`}
            </p>
          </div>

          {/* Primary action */}
          <Link href={isCompleted ? "/journal" : "/wizard"}>
            <Button 
              size="lg" 
              className="w-full text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              onClick={handleStart}
              data-testid="button-start"
            >
              {session 
                ? (isCompleted ? <><PenLine className="mr-2 w-5 h-5" /> Journal</> : <>Resume <ArrowRight className="ml-2 w-5 h-5" /></>) 
                : <>Start <ArrowRight className="ml-2 w-5 h-5" /></>}
            </Button>
          </Link>

          {/* Session management controls */}
          {session && (
            <div className="flex gap-3 pt-2 border-t border-border/50 w-full justify-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1.5" data-testid="button-restart-day">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restart Day
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restart Day {session.planDay}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear all your responses, readings, and mood for today. The day number stays the same, but you'll start fresh.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => restartSession(session.id!)} data-testid="button-confirm-restart">
                      Restart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-destructive gap-1.5" data-testid="button-delete-day">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Day
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Day {session.planDay}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes this session and all its data. You'll be able to start a new session from scratch.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteSession(session.id!)} 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      data-testid="button-confirm-delete"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
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
                    data-testid={`button-export-${s.id}`}
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
            <span className="font-serif text-lg" data-testid="text-current-day">Day {currentPlanDay}</span>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 flex flex-col items-center gap-2 text-center">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</span>
            <span className="font-serif text-lg" data-testid="text-status">
              {session ? (isCompleted ? "Complete" : "In Progress") : "Ready"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
