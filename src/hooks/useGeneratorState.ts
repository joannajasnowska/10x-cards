import { useState, useCallback } from "react";
import { toast } from "sonner";
import type {
  CreateFlashcardAiDTO,
  GenerationFlashcardProposalDTO,
  InitiateGenerationCommand,
  InitiateGenerationResponseDTO,
} from "../types";

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

export default function useGeneratorState() {
  // Form state
  const [sourceText, setSourceText] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("openai/gpt-4o-mini");

  // Proposal state
  const [proposals, setProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [generationModel, setGenerationModel] = useState<string | null>(null);

  // Loading states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Error states
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Edit state
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);

  // Computed property for editing proposal
  const editingProposal = editingProposalId ? proposals.find((p) => p.id === editingProposalId) || null : null;

  // Handler for generating flashcards
  const handleGenerate = useCallback(async () => {
    setGenerationError(null);
    setIsGenerating(true);

    try {
      const command: InitiateGenerationCommand = {
        source_text: sourceText,
        model: selectedModel,
      };

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate flashcards");
      }

      const data: InitiateGenerationResponseDTO = await response.json();

      // Transform API proposals to view models
      const viewModels: FlashcardProposalViewModel[] = data.flashcard_proposals.map(
        (proposal: GenerationFlashcardProposalDTO) => ({
          id: crypto.randomUUID(),
          front: proposal.front,
          back: proposal.back,
          status: "pending",
          originalFront: proposal.front,
          originalBack: proposal.back,
          source: "ai-complete",
          model: selectedModel,
          generation_id: data.generation_id,
        })
      );

      setProposals(viewModels);
      setGenerationId(data.generation_id);
      setGenerationModel(selectedModel);

      toast.success("Wygenerowano fiszki", {
        description: `Pomyślnie wygenerowano ${data.ai_complete_count} propozycji fiszek.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setGenerationError(errorMessage);
      toast.error("Błąd generowania", {
        description: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [sourceText, selectedModel]);

  // Handler for accepting a proposal
  const handleAccept = useCallback((proposalId: string) => {
    setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, status: "accepted" } : p)));
  }, []);

  // Handler for rejecting a proposal
  const handleReject = useCallback((proposalId: string) => {
    setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, status: "rejected" } : p)));
  }, []);

  // Handler for starting the edit process
  const handleEditStart = useCallback((proposalId: string) => {
    setEditingProposalId(proposalId);
  }, []);

  // Handler for saving edits
  const handleEditSave = useCallback((proposalId: string, updatedData: { front: string; back: string }) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              front: updatedData.front,
              back: updatedData.back,
              status: "edited",
              source: "ai-with-updates",
            }
          : p
      )
    );
    setEditingProposalId(null);

    toast.success("Zapisano zmiany", {
      description: "Pomyślnie zaktualizowano fiszkę.",
    });
  }, []);

  // Handler for canceling edits
  const handleEditCancel = useCallback(() => {
    setEditingProposalId(null);
  }, []);

  // Helper to save flashcards to API
  const saveFlashcards = async (flashcardsToSave: FlashcardProposalViewModel[]) => {
    if (flashcardsToSave.length === 0) return;

    setSaveError(null);
    setIsSaving(true);

    try {
      // Transform view models to API DTOs
      const flashcardDTOs: CreateFlashcardAiDTO[] = flashcardsToSave.map((p) => ({
        front: p.front,
        back: p.back,
        source: p.source,
        model: p.model,
        generation_id: p.generation_id,
      }));

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flashcards: flashcardDTOs }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save flashcards");
      }

      // On success, mark all saved as accepted
      setProposals((prev) =>
        prev.map((p) => {
          const wasSaved = flashcardsToSave.some((saved) => saved.id === p.id);
          return wasSaved ? { ...p, status: "accepted" } : p;
        })
      );

      // Show success toast
      toast.success("Zapisano fiszki", {
        description: `Pomyślnie zapisano ${flashcardsToSave.length} fiszek w bazie danych.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setSaveError(errorMessage);
      toast.error("Błąd zapisywania", {
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for saving approved flashcards
  const handleSaveApproved = useCallback(async () => {
    const flashcardsToSave = proposals.filter((p) => p.status === "accepted" || p.status === "edited");

    await saveFlashcards(flashcardsToSave);
  }, [proposals]);

  // Handler for saving all flashcards
  const handleSaveAll = useCallback(async () => {
    const flashcardsToSave = proposals.filter((p) => p.status !== "rejected");
    await saveFlashcards(flashcardsToSave);
  }, [proposals]);

  return {
    sourceText,
    selectedModel,
    proposals,
    generationId,
    generationModel,
    isGenerating,
    isSaving,
    generationError,
    saveError,
    editingProposalId,
    editingProposal,
    setSourceText,
    setSelectedModel,
    handleGenerate,
    handleAccept,
    handleReject,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleSaveApproved,
    handleSaveAll,
  };
}
