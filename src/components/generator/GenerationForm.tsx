import React, { useCallback } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import CharacterCounter from "../ui/CharacterCounter";
import type { InitiateGenerationCommand } from "../../types";

interface GenerationFormProps {
  sourceText: string;
  selectedModel: string;
  isGenerating: boolean;
  onInputChange: (text: string) => void;
  onModelChange: (model: string) => void;
  onSubmit: (command: InitiateGenerationCommand) => void;
}

const MIN_CHAR_COUNT = 1000;
const MAX_CHAR_COUNT = 10000;

export default function GenerationForm({
  sourceText,
  selectedModel,
  isGenerating,
  onInputChange,
  onModelChange,
  onSubmit,
}: GenerationFormProps) {
  const isValidLength = sourceText.length >= MIN_CHAR_COUNT && sourceText.length <= MAX_CHAR_COUNT;

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(e.target.value);
    },
    [onInputChange]
  );

  const handleModelSelect = useCallback(
    (value: string) => {
      onModelChange(value);
    },
    [onModelChange]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValidLength || isGenerating) return;

      const command: InitiateGenerationCommand = {
        source_text: sourceText,
        model: selectedModel,
      };

      onSubmit(command);
    },
    [sourceText, selectedModel, isValidLength, isGenerating, onSubmit]
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <Select value={selectedModel} onValueChange={handleModelSelect} disabled={isGenerating}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Wybierz model AI" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={!isValidLength || isGenerating} className="w-full sm:w-auto">
          {isGenerating ? "Generowanie..." : "Generuj Fiszki"}
        </Button>
      </div>
    </form>
  );
}
