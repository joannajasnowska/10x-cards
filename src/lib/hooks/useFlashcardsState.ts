import { useState, useCallback, useEffect } from "react";
import type {
  FlashcardDTO,
  PaginationDTO,
  CreateFlashcardDTO,
  UpdateFlashcardCommand,
  FlashcardsListResponseDTO,
} from "@/types";

export interface FilterParams {
  search: string;
  sort: "created_at" | "updated_at";
  order: "asc" | "desc";
  page: number;
  limit: number;
}

export interface FlashcardsPageState {
  flashcards: FlashcardDTO[];
  pagination: PaginationDTO;
  isLoading: boolean;
  error: string | null;
  filters: FilterParams;
  editingFlashcard: FlashcardDTO | null;
  deletingFlashcard: { id: number; front: string } | null;
}

export const useFlashcardsState = () => {
  const [state, setState] = useState<FlashcardsPageState>({
    flashcards: [],
    pagination: { page: 1, limit: 10, total: 0 },
    isLoading: true,
    error: null,
    filters: { search: "", sort: "created_at", order: "desc", page: 1, limit: 10 },
    editingFlashcard: null,
    deletingFlashcard: null,
  });

  // Fetch flashcards from API
  const fetchFlashcards = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", state.filters.page.toString());
      queryParams.append("limit", state.filters.limit.toString());
      queryParams.append("sort", state.filters.sort);
      queryParams.append("order", state.filters.order);
      if (state.filters.search) {
        queryParams.append("filter", state.filters.search);
      }

      const response = await fetch(`/api/flashcards?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const data: FlashcardsListResponseDTO = await response.json();

      setState((prev) => ({
        ...prev,
        flashcards: data.data,
        pagination: data.pagination,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [state.filters]);

  // Create new flashcard
  const createFlashcard = useCallback(
    async (flashcard: CreateFlashcardDTO) => {
      try {
        const response = await fetch("/api/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flashcards: [
              {
                ...flashcard,
                source: "manual",
                generation_id: null,
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create flashcard");
        }

        // Refresh list
        await fetchFlashcards();

        return true;
      } catch (error) {
        throw error;
      }
    },
    [fetchFlashcards]
  );

  // Update existing flashcard
  const updateFlashcard = useCallback(
    async (id: number, data: UpdateFlashcardCommand) => {
      try {
        const response = await fetch(`/api/flashcards/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update flashcard");
        }

        // Refresh list
        await fetchFlashcards();

        return true;
      } catch (error) {
        throw error;
      }
    },
    [fetchFlashcards]
  );

  // Delete flashcard
  const deleteFlashcard = useCallback(
    async (id: number) => {
      try {
        const response = await fetch(`/api/flashcards/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete flashcard");
        }

        // Refresh list
        await fetchFlashcards();

        return true;
      } catch (error) {
        throw error;
      }
    },
    [fetchFlashcards]
  );

  // UI state management methods
  const setEditingFlashcard = useCallback((flashcard: FlashcardDTO | null) => {
    setState((prev) => ({ ...prev, editingFlashcard: flashcard }));
  }, []);

  const setDeletingFlashcard = useCallback((flashcard: { id: number; front: string } | null) => {
    setState((prev) => ({ ...prev, deletingFlashcard: flashcard }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<FilterParams>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters, page: 1 }, // Reset page on filter change
    }));
  }, []);

  const changePage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, page },
    }));
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards, state.filters]);

  return {
    ...state,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    setEditingFlashcard,
    setDeletingFlashcard,
    updateFilters,
    changePage,
  };
};
