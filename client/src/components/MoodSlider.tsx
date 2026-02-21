import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

const LABELS: Record<number, string> = {
  1: "Deep Desolation",
  2: "Desolation",
  3: "Heavy",
  4: "Unsettled",
  5: "Neutral",
  6: "Settling",
  7: "Calm",
  8: "Peaceful",
  9: "Consolation",
  10: "Deep Consolation"
};

interface MoodSliderProps {
  value: number;
  note: string;
  onChange: (val: number, note: string) => void;
}

export function MoodSlider({ value, note, onChange }: MoodSliderProps) {
  const [localVal, setLocalVal] = useState(value || 5);
  const [localNote, setLocalNote] = useState(note || "");

  useEffect(() => {
    setLocalVal(value || 5);
    setLocalNote(note || "");
  }, [value, note]);

  const handleSliderChange = (vals: number[]) => {
    const val = vals[0];
    setLocalVal(val);
    onChange(val, localNote);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocalNote(text);
    onChange(localVal, text);
  };

  return (
    <div className="space-y-12" data-testid="mood-slider">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Inner State</Label>
          <div className="text-right">
            <span className="text-4xl font-serif font-light" data-testid="text-mood-value">{localVal}</span>
            <p className="text-xs text-muted-foreground mt-1" data-testid="text-mood-label">{LABELS[localVal]}</p>
          </div>
        </div>
        <Slider
          value={[localVal]}
          onValueChange={handleSliderChange}
          min={1}
          max={10}
          step={1}
          className="py-4 cursor-pointer"
          data-testid="slider-mood"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="font-medium">Desolation</span>
          <span className="text-center text-muted-foreground/60">← lower is harder · higher is peaceful →</span>
          <span className="font-medium">Consolation</span>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Name It</Label>
        <Input 
          value={localNote}
          onChange={handleNoteChange}
          placeholder="e.g. Heavy, Light, Distracted, Peaceful"
          className="border-b border-0 rounded-none px-0 text-xl font-serif focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/30"
          data-testid="input-mood-note"
        />
      </div>
    </div>
  );
}
