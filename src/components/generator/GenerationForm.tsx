import React, { useCallback } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import CharacterCounter from "../ui/CharacterCounter";
import { Sparkles } from "lucide-react";
import type { InitiateGenerationCommand } from "../../types";

interface GenerationFormProps {
  sourceText: string;
  isGenerating: boolean;
  onInputChange: (text: string) => void;
  onSubmit: (command: InitiateGenerationCommand) => void;
}

const MIN_CHAR_COUNT = 1000;
const MAX_CHAR_COUNT = 10000;

export default function GenerationForm({ sourceText, isGenerating, onInputChange, onSubmit }: GenerationFormProps) {
  const isValidLength = sourceText.length >= MIN_CHAR_COUNT && sourceText.length <= MAX_CHAR_COUNT;

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(e.target.value);
    },
    [onInputChange]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValidLength || isGenerating) return;

      const command: InitiateGenerationCommand = {
        source_text: sourceText,
      };

      onSubmit(command);
    },
    [sourceText, isValidLength, isGenerating, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Wklej tekst źródłowy tutaj (1000-10000 znaków)..."
          value={sourceText}
          onChange={handleTextChange}
          className="min-h-[200px] resize-y"
          disabled={isGenerating}
        />
        <CharacterCounter currentCount={sourceText.length} min={MIN_CHAR_COUNT} max={MAX_CHAR_COUNT} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isValidLength || isGenerating} className="w-full sm:w-auto gap-2">
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "Generowanie..." : "Generuj Fiszki"}
        </Button>
      </div>
    </form>
  );
}
