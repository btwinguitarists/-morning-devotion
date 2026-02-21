import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

interface WizardLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  title?: string;
  isLastStep?: boolean;
  isValid?: boolean;
}

export function WizardLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onClose,
  title,
  isLastStep = false,
  isValid = true
}: WizardLayoutProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground max-w-2xl mx-auto relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
            {title || "Morning Prayer"}
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <Progress value={progress} className="h-0.5 rounded-none w-full bg-secondary" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-24 pb-32 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col justify-center min-h-[60vh]"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background p-6 border-t border-border/40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={!onBack}
            className={`
              gap-2 pl-2 text-muted-foreground hover:text-foreground
              ${!onBack ? 'opacity-0 pointer-events-none' : ''}
            `}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="text-xs text-muted-foreground font-mono">
            {currentStep + 1} / {totalSteps}
          </div>

          <Button
            onClick={onNext}
            disabled={!isValid}
            className="gap-2 pr-4 min-w-[120px] shadow-lg shadow-black/5"
          >
            {isLastStep ? "Complete" : "Continue"}
            {!isLastStep && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
