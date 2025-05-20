import { useEffect } from "react";
import "./flashcard-modal.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useFlashcardForm } from "@/lib/hooks/useFlashcardForm";
import CharacterCounter from "./CharacterCounter";
import type { FlashcardDTO, CreateFlashcardDTO, UpdateFlashcardCommand } from "@/types";

interface FlashcardModalProps {
  flashcard?: FlashcardDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (flashcard: CreateFlashcardDTO | UpdateFlashcardCommand) => Promise<void>;
  isSaving?: boolean;
}

export default function FlashcardModal({ flashcard, isOpen, onClose, onSave, isSaving = false }: FlashcardModalProps) {
  const isNewFlashcard = !flashcard || !flashcard.id;
  const { form, updateField, validateForm, resetForm, setIsSaving } = useFlashcardForm(
    flashcard?.id ? flashcard : undefined
  );

  // Update isSaving state when prop changes
  useEffect(() => {
    setIsSaving(isSaving);
  }, [isSaving, setIsSaving]);

  // Reset form when modal opens/closes or flashcard changes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, flashcard, resetForm]);

  // Handle save action
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const saveData = {
        front: form.front,
        back: form.back,
        source: "manual" as const,
      };

      await onSave(saveData);
    } catch (error) {
      console.error("Error saving flashcard:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[95vh] w-[95vw] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isNewFlashcard ? "Dodaj nową fiszkę" : "Edytuj fiszkę"}</DialogTitle>
          <DialogDescription>
            {isNewFlashcard
              ? "Wypełnij pola, aby utworzyć nową fiszkę. Przód powinien zawierać pytanie lub termin, a tył - odpowiedź lub definicję."
              : "Wprowadź zmiany w istniejącej fiszce."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 overflow-y-auto flex-grow">
          <div className="space-y-2">
            <div className="flex flex-row justify-between items-center gap-2">
              <Label htmlFor="front" className="text-sm font-medium min-w-[80px]">
                Przód fiszki
              </Label>
              <span className="flex-grow"></span>
              <CharacterCounter current={form.front.length} max={200} />
            </div>
            <Textarea
              id="front"
              placeholder="Wpisz pytanie lub termin..."
              value={form.front}
              onChange={(e) => updateField("front", e.target.value)}
              rows={3}
              maxLength={200}
              style={{
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                width: "100%",
              }}
              className={`resize-none min-h-[80px] ${form.frontError ? "border-destructive" : ""}`}
              data-front-text
            />
            {form.frontError && <p className="text-sm text-destructive">{form.frontError}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex flex-row justify-between items-center gap-2">
              <Label htmlFor="back" className="text-sm font-medium min-w-[80px]">
                Tył fiszki
              </Label>
              <span className="flex-grow"></span>
              <CharacterCounter current={form.back.length} max={500} />
            </div>
            <Textarea
              id="back"
              placeholder="Wpisz odpowiedź lub definicję..."
              value={form.back}
              onChange={(e) => updateField("back", e.target.value)}
              rows={8}
              maxLength={500}
              style={{
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                width: "100%",
              }}
              className={`resize-none min-h-[200px] max-h-[300px] overflow-y-auto ${form.backError ? "border-destructive" : ""}`}
              data-back-text
            />
            {form.backError && <p className="text-sm text-destructive">{form.backError}</p>}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-2">
          <Button variant="outline" onClick={onClose} disabled={form.isSaving}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={!form.isValid || form.isSaving}>
            {form.isSaving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
