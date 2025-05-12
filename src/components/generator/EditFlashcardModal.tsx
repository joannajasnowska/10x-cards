import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import CharacterCounter from "../ui/CharacterCounter";

interface FlashcardProposalViewModel {
  id: string;
  front: string;
  back: string;
  status: "pending" | "accepted" | "rejected" | "edited";
  originalFront: string;
  originalBack: string;
  source: "ai-complete" | "ai-with-updates";
  model: string;
  generation_id: number;
}

interface EditFlashcardModalProps {
  isOpen: boolean;
  proposal: FlashcardProposalViewModel | null;
  onSave: (proposalId: string, updatedData: { front: string; back: string }) => void;
  onCancel: () => void;
}

// Constants for validation
const FRONT_MAX_LENGTH = 200;
const BACK_MAX_LENGTH = 500;

export default function EditFlashcardModal({ isOpen, proposal, onSave, onCancel }: EditFlashcardModalProps) {
  // State for edited content
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  // Initialize state when proposal changes
  useEffect(() => {
    if (proposal) {
      setFront(proposal.front);
      setBack(proposal.back);
    }
  }, [proposal]);

  // Handler for front text change
  const handleFrontChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFront(e.target.value);
  };

  // Handler for back text change
  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBack(e.target.value);
  };

  // Validation
  const isFrontValid = front.length > 0 && front.length <= FRONT_MAX_LENGTH;
  const isBackValid = back.length > 0 && back.length <= BACK_MAX_LENGTH;
  const isFormValid = isFrontValid && isBackValid;

  // Save handler
  const handleSave = () => {
    if (!proposal || !isFormValid) return;

    onSave(proposal.id, {
      front,
      back,
    });
  };

  if (!isOpen || !proposal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="front" className="text-sm font-medium">
              Przód fiszki
            </Label>
            <Textarea
              id="front"
              value={front}
              onChange={handleFrontChange}
              className="resize-y min-h-[100px]"
              placeholder="Wprowadź tekst przodu fiszki (max 200 znaków)"
            />
            <CharacterCounter currentCount={front.length} min={1} max={FRONT_MAX_LENGTH} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="back" className="text-sm font-medium">
              Tył fiszki
            </Label>
            <Textarea
              id="back"
              value={back}
              onChange={handleBackChange}
              className="resize-y min-h-[150px]"
              placeholder="Wprowadź tekst tyłu fiszki (max 500 znaków)"
            />
            <CharacterCounter currentCount={back.length} min={1} max={BACK_MAX_LENGTH} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
