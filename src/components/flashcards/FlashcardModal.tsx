import { useEffect } from "react";
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
  const { form, updateField, validateForm, resetForm, setIsSaving } = useFlashcardForm(flashcard || undefined);

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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{flashcard ? "Edytuj fiszkę" : "Dodaj nową fiszkę"}</DialogTitle>
          <DialogDescription>
            {flashcard
              ? "Wprowadź zmiany w istniejącej fiszce."
              : "Wypełnij pola, aby utworzyć nową fiszkę. Przód powinien zawierać pytanie lub termin, a tył - odpowiedź lub definicję."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="front" className="text-sm font-medium">
                Przód fiszki
              </Label>
              <CharacterCounter current={form.front.length} max={200} />
            </div>
            <Textarea
              id="front"
              placeholder="Wpisz pytanie lub termin..."
              value={form.front}
              onChange={(e) => updateField("front", e.target.value)}
              rows={2}
              className={form.frontError ? "border-destructive" : ""}
            />
            {form.frontError && <p className="text-sm text-destructive">{form.frontError}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="back" className="text-sm font-medium">
                Tył fiszki
              </Label>
              <CharacterCounter current={form.back.length} max={500} />
            </div>
            <Textarea
              id="back"
              placeholder="Wpisz odpowiedź lub definicję..."
              value={form.back}
              onChange={(e) => updateField("back", e.target.value)}
              rows={6}
              className={form.backError ? "border-destructive" : ""}
            />
            {form.backError && <p className="text-sm text-destructive">{form.backError}</p>}
          </div>
        </div>

        <DialogFooter>
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
