import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentSession, useEremosData } from "@/hooks/use-eremos";
import { Loader2, ArrowRight, BookOpen, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const { isLoading } = useEremosData();
  const { session, startNewSession } = useCurrentSession();

  const handleStart = async () => {
    if (!session) {
      await startNewSession();
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
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
        <Card className="p-8 border-border shadow-2xl shadow-black/5 flex flex-col gap-6 items-center text-center hover:border-primary/20 transition-all duration-500">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-medium">
              {session ? "Continue Session" : "Begin Morning Prayer"}
            </h2>
            <p className="text-muted-foreground">
              {session 
                ? `You are on step ${(session.currentStep || 0) + 1} of your daily rhythm.`
                : "Enter into silence. Prepare your heart."}
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

        {/* Stats / Footer */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-secondary/50 flex flex-col items-center gap-2 text-center">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Plan</span>
            <span className="font-serif text-lg">Day {session?.planDay || 1}</span>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 flex flex-col items-center gap-2 text-center">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</span>
            <span className="font-serif text-lg">-- min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
