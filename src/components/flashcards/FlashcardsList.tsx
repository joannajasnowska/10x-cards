import { Loader2 } from "lucide-react";
import type { FlashcardDTO, PaginationDTO } from "@/types";
import FlashcardItem from "./FlashcardItem";
import Pagination from "./Pagination";
import { Card } from "@/components/ui/card";

interface FlashcardsListProps {
  flashcards: FlashcardDTO[];
  pagination: PaginationDTO;
  onPageChange: (page: number) => void;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcard: { id: number; front: string }) => void;
  isLoading: boolean;
}

export default function FlashcardsList({
  flashcards,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  isLoading,
}: FlashcardsListProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show empty state if no flashcards
  if (flashcards.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center h-64">
        <h3 className="text-lg font-semibold mb-2">Nie masz jeszcze żadnych fiszek</h3>
        <p className="text-muted-foreground mb-4">Dodaj swoją pierwszą fiszkę ręcznie lub wygeneruj fiszki z tekstu.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {flashcards.map((flashcard) => (
          <FlashcardItem key={flashcard.id} flashcard={flashcard} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Pagination pagination={pagination} onChange={onPageChange} />
      </div>
    </div>
  );
}
