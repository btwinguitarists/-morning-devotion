import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

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
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Intensity</Label>
          <span className="text-4xl font-serif font-light">{localVal}</span>
        </div>
        <Slider
          value={[localVal]}
          onValueChange={handleSliderChange}
          min={1}
          max={10}
          step={1}
          className="py-4 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>Desolation</span>
          <span>Consolation</span>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">One Word Name</Label>
        <Input 
          value={localNote}
          onChange={handleNoteChange}
          placeholder="e.g. Heavy, Light, Distracted, Peaceful"
          className="border-b border-0 rounded-none px-0 text-xl font-serif focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/30"
        />
      </div>
    </div>
  );
}
