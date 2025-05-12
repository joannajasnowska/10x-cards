import React from "react";
import { cn } from "../../lib/utils";

interface CharacterCounterProps {
  currentCount: number;
  min: number;
  max: number;
  className?: string;
}

export default function CharacterCounter({ currentCount, min, max, className }: CharacterCounterProps) {
  const isValid = currentCount >= min && currentCount <= max;
  const isUnderMinimum = currentCount < min;

  // Force consistent locale (en-US) for number formatting to avoid hydration mismatches
  const formatNumber = (num: number) => num.toLocaleString("en-US");

  return (
    <div className={cn("text-xs flex justify-end", className)}>
      <span className={cn("tabular-nums", !isValid && "text-destructive", isValid && "text-muted-foreground")}>
        {formatNumber(currentCount)} / {formatNumber(max)}
        {isUnderMinimum && ` (min: ${formatNumber(min)})`}
      </span>
    </div>
  );
}
