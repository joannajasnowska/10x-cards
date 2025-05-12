import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export default function CharacterCounter({ current, max, className }: CharacterCounterProps) {
  // Calculate percentage of limit used
  const percentage = Math.min(100, (current / max) * 100);

  // Determine text color based on how close to the limit
  const getTextColor = () => {
    if (percentage >= 100) return "text-destructive"; // Over limit
    if (percentage >= 90) return "text-amber-500 dark:text-amber-400"; // Near limit
    return "text-muted-foreground"; // Normal
  };

  return (
    <div className={cn("text-xs flex justify-end", getTextColor(), className)}>
      <span>
        {current}/{max}
      </span>
    </div>
  );
}
