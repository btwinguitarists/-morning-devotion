import { Button } from "@/components/ui/button";
import { BookOpen, Feather, Heart } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-16">
        <div className="max-w-lg w-full space-y-16 text-center">

          <div className="space-y-6 animate-in">
            <h1 className="text-6xl md:text-7xl font-serif tracking-tight text-primary" data-testid="text-landing-title">
              Eremos
            </h1>
            <p className="text-xs text-muted-foreground/60 tracking-widest uppercase">
              ἔρημος · the desolate place where Jesus withdrew to pray
            </p>
            <p className="text-xl font-serif italic text-muted-foreground leading-relaxed mt-4">
              "Very early in the morning, while it was still dark, Jesus got up, left the house and went off to a solitary place, where he prayed."
            </p>
            <p className="text-sm text-muted-foreground tracking-wide uppercase">
              Mark 1:35
            </p>
          </div>

          <div className="grid gap-6 text-left max-w-sm mx-auto">
            <div className="flex gap-4 items-start">
              <div className="p-2.5 rounded-lg bg-secondary">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Daily Scripture</h3>
                <p className="text-xs text-muted-foreground mt-0.5">A structured reading plan through the whole Bible</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2.5 rounded-lg bg-secondary">
                <Feather className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Guided Meditation</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Reflection prompts drawn from the Desert Fathers</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2.5 rounded-lg bg-secondary">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Self-Examination</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Weekly rotating categories for honest inner work</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <a href="/api/login">
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                data-testid="button-login"
              >
                Enter
              </Button>
            </a>
            <p className="text-xs text-muted-foreground">
              Sign in with email, Google, GitHub, or Apple
            </p>
          </div>
        </div>
      </div>

      <footer className="p-6 text-center space-y-3 border-t border-border/30">
        <p className="text-xs text-muted-foreground">A solitary place for daily prayer and reflection.</p>
        <a 
          href="https://paypal.me/BenjaminVanScyoc" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary transition-colors"
          data-testid="link-donate"
        >
          <Heart className="w-3 h-3" />
          Support this ministry
        </a>
      </footer>
    </div>
  );
}
