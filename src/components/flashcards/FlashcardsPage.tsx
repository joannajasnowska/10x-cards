import { useState } from "react";
import { useFlashcardsState } from "@/lib/hooks/useFlashcardsState";
import type { FlashcardDTO, CreateFlashcardDTO, UpdateFlashcardCommand } from "@/types";

import FlashcardsHeader from "./FlashcardsHeader";
import FlashcardsFilters from "./FlashcardsFilters";
import FlashcardsStats from "./FlashcardsStats";
import FlashcardsList from "./FlashcardsList";
import FlashcardModal from "./FlashcardModal";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

export default function FlashcardsPage() {
  const {
    flashcards,
    pagination,
    isLoading,
    error,
    filters,
    editingFlashcard,
    deletingFlashcard,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    setEditingFlashcard,
    setDeletingFlashcard,
    updateFilters,
    changePage,
    setState,
  } = useFlashcardsState();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle adding new flashcard
  const handleAddNew = () => {
    setEditingFlashcard({} as FlashcardDTO); // Use empty object to indicate creating new
  };

  // Handle saving flashcard (create or update)
  const handleSaveFlashcard = async (flashcardData: CreateFlashcardDTO | UpdateFlashcardCommand) => {
    setIsSaving(true);
    try {
      if (editingFlashcard && editingFlashcard.id) {
        // Update existing
        await updateFlashcard(editingFlashcard.id, flashcardData as UpdateFlashcardCommand);
      } else {
        // Create new
        await createFlashcard(flashcardData as CreateFlashcardDTO);
      }
      setEditingFlashcard(null);
    } catch {
      // Set error state instead of using console.error
      setState((prev) => ({ ...prev, error: "Nie udało się zapisać fiszki. Spróbuj ponownie." }));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit flashcard
  const handleEditFlashcard = (flashcard: FlashcardDTO) => {
    setEditingFlashcard(flashcard);
  };

  // Handle delete confirmation
  const handleDeleteFlashcard = (flashcard: { id: number; front: string }) => {
    setDeletingFlashcard(flashcard);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await deleteFlashcard(id);
      setDeletingFlashcard(null);
    } catch {
      // Set error state instead of using console.error
      setState((prev) => ({ ...prev, error: "Nie udało się usunąć fiszki. Spróbuj ponownie." }));
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setEditingFlashcard(null);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeletingFlashcard(null);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => changePage(1)} // Refresh by going back to first page
            className="underline ml-2"
          >
            Spróbuj ponownie
          </button>
        </div>
      )}

      {/* Page components */}
      <FlashcardsHeader onAddNewClick={handleAddNew} />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <FlashcardsFilters filters={filters} onChange={updateFilters} />
        <FlashcardsStats total={pagination.total} />
      </div>

      <FlashcardsList
        flashcards={flashcards}
        pagination={pagination}
        onPageChange={changePage}
        onEdit={handleEditFlashcard}
        onDelete={handleDeleteFlashcard}
        isLoading={isLoading}
      />

      {/* Modals */}
      <FlashcardModal
        flashcard={editingFlashcard}
        isOpen={editingFlashcard !== null}
        onClose={handleModalClose}
        onSave={handleSaveFlashcard}
        isSaving={isSaving}
      />

      <DeleteConfirmationDialog
        flashcard={deletingFlashcard}
        isOpen={deletingFlashcard !== null}
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
