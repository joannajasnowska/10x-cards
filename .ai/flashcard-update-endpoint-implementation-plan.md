# API Endpoint Implementation Plan: Update Flashcard

## 1. Przegląd punktu końcowego

Endpoint pozwala na aktualizację istniejącej fiszki poprzez modyfikację jej pól: front (pytanie), back (odpowiedź) i source (źródło). Upewnia się, że użytkownik może modyfikować tylko własne fiszki oraz że wszystkie dane wejściowe są prawidłowo zwalidowane.

## 2. Szczegóły żądania

- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/flashcards/{id}`
- **Parametry:**
  - Wymagane:
    - `id` (parametr URL): ID fiszki do aktualizacji (liczba całkowita dodatnia)
  - Opcjonalne (co najmniej jedno pole musi być obecne):
    - `front`: Treść pytania fiszki (max 200 znaków)
    - `back`: Treść odpowiedzi fiszki (max 500 znaków)
    - `source`: Źródło fiszki (tylko "manual" lub "ai-with-updates")
- **Request Body:**
  ```json
  {
    "front": "Updated question text",
    "back": "Updated answer text",
    "source": "manual"
  }
  ```

## 3. Wykorzystywane typy

```typescript
// Już zdefiniowane w src/types.ts:
export type UpdateFlashcardCommand = Partial<{
  front: string; // Optional update; max 200 characters if provided
  back: string; // Optional update; max 500 characters if provided
  source: Source;
  generation_id: number | null;
}>;

export type FlashcardDTO = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;
```

## 4. Szczegóły odpowiedzi

- **Kody statusu:**
  - 200 OK - Fiszka została pomyślnie zaktualizowana
  - 400 Bad Request - Nieprawidłowe dane wejściowe
  - 401 Unauthorized - Brak autoryzacji
  - 404 Not Found - Fiszka nie istnieje lub użytkownik nie ma do niej dostępu
- **Format odpowiedzi (200 OK):**
  ```json
  {
    "data": {
      "id": 123,
      "front": "Updated question text",
      "back": "Updated answer text",
      "source": "manual",
      "generation_id": null,
      "created_at": "2023-10-15T10:30:00Z",
      "updated_at": "2023-10-16T08:45:00Z"
    }
  }
  ```

## 5. Przepływ danych

1. **Odbiór żądania:** Endpoint odbiera żądanie PUT z ID fiszki w URL i danymi do aktualizacji w body.
2. **Walidacja:** Sprawdzenie poprawności ID i danych wejściowych przy użyciu Zod.
3. **Autoryzacja:** Weryfikacja, czy użytkownik ma dostęp do fiszki (jest jej właścicielem).
4. **Aktualizacja:** Wywołanie metody serwisu do aktualizacji fiszki.
5. **Sprawdzenie praw dostępu do powiązanej generacji:** Jeśli aktualizowana jest źródło na "ai-with-updates", sprawdzenie czy użytkownik ma dostęp do powiązanej generacji.
6. **Odpowiedź:** Zwrócenie zaktualizowanej fiszki lub odpowiedniego kodu błędu.

## 6. Względy bezpieczeństwa

- **Autoryzacja:** Upewnienie się, że użytkownik może modyfikować tylko własne fiszki.
- **Walidacja danych wejściowych:** Ścisła walidacja wszystkich danych wejściowych dla ochrony przed atakami wstrzyknięcia (injection).
- **Obsługa wyjątków:** Przechwytywanie i odpowiednie obsługiwanie wszystkich wyjątków.
- **Nie ujawnianie poufnych informacji:** Zwracanie ogólnych komunikatów o błędach bez ujawniania szczegółów wewnętrznych.

## 7. Obsługa błędów

- **Nieprawidłowy format ID:** 400 Bad Request z komunikatem błędu.
- **Brak fiszki:** 404 Not Found z komunikatem "Flashcard not found".
- **Niedozwolona wartość source:** 400 Bad Request z informacją o dozwolonych wartościach.
- **Przekroczenie limitu znaków:** 400 Bad Request z informacją o limicie.
- **Nieautoryzowany dostęp do generacji:** 403 Forbidden z odpowiednim komunikatem.
- **Błąd bazy danych:** 500 Internal Server Error z ogólnym komunikatem błędu.

## 8. Rozważania dotyczące wydajności

- **Selektywne aktualizacje:** Aktualizacja tylko zmienionych pól, nie całego rekordu.
- **Indeksowanie:** Upewnienie się, że kolumny `id` i `user_id` w tabeli `flashcards` są odpowiednio zindeksowane.
- **Automatyczna aktualizacja timestamp:** Wykorzystanie wbudowanego triggera Postgres do aktualizacji pola `updated_at`.
- **Minimalizacja zapytań:** Łączenie operacji sprawdzania dostępu i aktualizacji w jednym zapytaniu, gdy to możliwe.

## 9. Kroki implementacji

1. Dodać schemat walidacji w `src/lib/validations/flashcards.schema.ts`:

```typescript
// Aktualizacja schematu walidacji fiszki
export const updateFlashcardSchema = z
  .object({
    front: z.string().max(200, "Front text cannot exceed 200 characters").optional(),
    back: z.string().max(500, "Back text cannot exceed 500 characters").optional(),
    source: z
      .enum(["manual", "ai-with-updates"], {
        errorMap: () => ({ message: "Source must be either 'manual' or 'ai-with-updates'" }),
      })
      .optional(),
    generation_id: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

// Walidacja ID fiszki
export const flashcardIdSchema = z.number().int().positive("Flashcard ID must be a positive integer");
```

2. Dodać metodę `updateFlashcard` do serwisu `src/lib/services/flashcards.service.ts`:

```typescript
/**
 * Updates a flashcard with the given ID
 * @param id The ID of the flashcard to update
 * @param command The update command containing fields to update
 * @param userId The ID of the user performing the update
 * @returns The updated flashcard
 * @throws Error if the flashcard is not found or user does not have access
 */
async updateFlashcard(id: number, command: UpdateFlashcardCommand, userId: string): Promise<FlashcardDTO> {
  // Check if the flashcard exists and belongs to the user
  const { data: existingFlashcard, error: checkError } = await this.supabase
    .from("flashcards")
    .select("id, generation_id, source")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (checkError) {
    if (checkError.code === "PGRST116") {
      throw new Error("Flashcard not found");
    }
    throw checkError;
  }

  // If updating to ai-with-updates, verify generation access
  if (command.source === "ai-with-updates" && command.generation_id) {
    const isValid = await this.verifyGenerationBelongsToUser(command.generation_id, userId);
    if (!isValid) {
      const error = new Error(`Generation with ID ${command.generation_id} does not belong to the user`);
      error.name = "UNAUTHORIZED_GENERATION_ACCESS";
      throw error;
    }
  }

  // Update the flashcard
  const { data, error } = await this.supabase
    .from("flashcards")
    .update(command)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, front, back, source, generation_id, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data as FlashcardDTO;
}
```

3. Utworzyć plik endpointu `src/pages/api/flashcards/[id].ts`:

```typescript
import type { APIRoute } from "astro";
import { updateFlashcardSchema, flashcardIdSchema } from "../../../lib/validations/flashcards.schema";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import type { UpdateFlashcardCommand } from "../../../types";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

// Endpoint do aktualizacji fiszki
export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const { supabase } = locals;

    // Walidacja ID z parametrów URL
    const idValidation = flashcardIdSchema.safeParse(parseInt(params.id || ""));
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: "Invalid flashcard ID format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parsowanie i walidacja body
    const body = await request.json();
    const validationResult = updateFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const flashcardId = idValidation.data;
    const command = validationResult.data as UpdateFlashcardCommand;
    const flashcardsService = new FlashcardsService(supabase);

    try {
      // Użycie DEFAULT_USER_ID zamiast autentykacji
      const updatedFlashcard = await flashcardsService.updateFlashcard(flashcardId, command, DEFAULT_USER_ID);

      return new Response(
        JSON.stringify({
          data: updatedFlashcard,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (serviceError: any) {
      // Obsługa typowych błędów
      if (serviceError.message === "Flashcard not found") {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: "Flashcard not found",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (serviceError.name === "UNAUTHORIZED_GENERATION_ACCESS") {
        return new Response(
          JSON.stringify({
            error: "Forbidden",
            message: serviceError.message,
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Dla błędów walidacji z bazy danych
      if (serviceError.code === "23505" || serviceError.code === "23503" || serviceError.code === "23514") {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            message: serviceError.message || "Database constraint violation",
            details: serviceError.details,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Rzucenie błędu do zewnętrznego bloku catch
      throw serviceError;
    }
  } catch (error) {
    console.error("Error processing flashcard update request:", error);

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
```

4. Jeśli plik `src/pages/api/flashcards/[id].ts` już istnieje, dodać metodę PUT do istniejącego pliku, zachowując obecne implementacje.

5. W razie potrzeby zaimplementować metodę `verifyGenerationBelongsToUser` w serwisie, jeśli jeszcze nie istnieje.

6. Przetestować endpoint z różnymi scenariuszami:
   - Prawidłowa aktualizacja z wszystkimi polami
   - Aktualizacja tylko wybranych pól
   - Próba aktualizacji nieistniejącej fiszki
   - Próba aktualizacji fiszki z nieprawidłowymi danymi
   - Próba aktualizacji z nieprawidłowym ID generacji
