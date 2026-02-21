import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface AutoTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AutoTextArea({ value, onChange, placeholder, className }: AutoTextAreaProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Sync local value if prop changes (e.g. step change)
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Debounce save to DB
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 500); // 500ms debounce
  };

  return (
    <Textarea
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`
        min-h-[200px] resize-none border-none shadow-none text-lg leading-relaxed
        focus-visible:ring-0 p-0 placeholder:text-muted-foreground/50
        ${className}
      `}
    />
  );
}
