# API Endpoint Implementation Plan: Delete Flashcard

## 1. Przegląd punktu końcowego

Endpoint DELETE umożliwia usunięcie istniejącej fiszki na podstawie jej identyfikatora. Operacja jest nieodwracalna i wymaga uwierzytelnienia. Po pomyślnym usunięciu, serwer zwraca kod 204 No Content, który wskazuje na pomyślne przetworzenie żądania, ale brak treści odpowiedzi.

## 2. Szczegóły żądania

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/flashcards/{id}`
- **Parametry:**
  - Wymagane:
    - `id` (parametr URL): ID fiszki do usunięcia (liczba całkowita dodatnia)
  - Opcjonalne: brak
- **Request Body:** brak (DELETE nie wymaga body)

## 3. Wykorzystywane typy

Nie są potrzebne nowe typy DTO ani Command Modele dla tego endpointu. Wykorzystywane będą istniejące:

```typescript
// Typ FlashcardDTO do weryfikacji istnienia (opcjonalnie)
export type FlashcardDTO = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

// Schema walidacyjna dla ID (już zdefiniowana w projekcie)
export const flashcardIdSchema = z.number().int().positive("Flashcard ID must be a positive integer");
```

## 3. Szczegóły odpowiedzi

- **Kody statusu:**

  - 204 No Content - Fiszka została pomyślnie usunięta
  - 400 Bad Request - Nieprawidłowy format ID
  - 401 Unauthorized - Brak autoryzacji
  - 404 Not Found - Fiszka nie istnieje lub użytkownik nie ma do niej dostępu
  - 500 Internal Server Error - Problem po stronie serwera

- **Format odpowiedzi:**
  - Sukces (204): Brak treści
  - Błąd (pozostałe kody): Obiekt JSON zawierający `error` i `message`

## 4. Przepływ danych

1. Żądanie DELETE przychodzi na `/api/flashcards/{id}`
2. Handler pozyskuje ID fiszki z parametrów URL
3. Handler waliduje format ID (musi być liczbą całkowitą dodatnią)
4. Handler wywołuje metodę serwisu `deleteFlashcard(id, userId)`
5. Serwis sprawdza, czy fiszka istnieje i czy należy do zalogowanego użytkownika
6. Serwis wykonuje operację DELETE w bazie danych
7. Handler zwraca odpowiedź 204 No Content (sukces) lub odpowiedni kod błędu

## 5. Względy bezpieczeństwa

- **Uwierzytelnianie:** Wymagane uwierzytelnienie użytkownika (obsługiwane przez Supabase Auth)
- **Autoryzacja:** Sprawdzenie, czy użytkownik jest właścicielem fiszki przed jej usunięciem
- **Walidacja danych:** Walidacja ID fiszki za pomocą Zod
- **Ochrona przed SQL Injection:** Zapewniona przez parametryzowane zapytania Supabase
- **Ograniczenie dostępu:** Użytkownik może usuwać tylko własne fiszki

## 6. Obsługa błędów

- **Nieprawidłowy format ID:** 400 Bad Request z komunikatem o błędzie
- **Fiszka nie istnieje:** 404 Not Found z informacją, że fiszka nie została znaleziona
- **Użytkownik nie jest właścicielem fiszki:** 404 Not Found (z takim samym komunikatem jak "nie istnieje" dla bezpieczeństwa)
- **Błąd bazy danych:** 500 Internal Server Error z ogólnym komunikatem błędu

## 7. Rozważania dotyczące wydajności

- **Indeksowanie:** Upewnić się, że kolumny `id` i `user_id` w tabeli `flashcards` są odpowiednio zindeksowane
- **Transakcje:** Rozważyć użycie transakcji dla operacji usuwania, aby zapewnić spójność danych
- **Kaskadowe usuwanie:** Wykorzystanie kaskadowego usuwania dla powiązanych rekordów (już skonfigurowane w schemacie bazy danych)

## 8. Kroki implementacji

1. Dodać metodę `deleteFlashcard` do serwisu `FlashcardsService`:

```typescript
/**
 * Deletes a flashcard with the given ID
 * @param id The ID of the flashcard to delete
 * @param userId The ID of the user performing the deletion
 * @returns void
 * @throws Error if the flashcard is not found or user does not have access
 */
async deleteFlashcard(id: number, userId: string): Promise<void> {
  // Check if flashcard exists and belongs to user
  const { data, error: findError } = await this.supabase
    .from("flashcards")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (findError || !data) {
    throw new Error("Flashcard not found");
  }

  // Perform the delete operation
  const { error: deleteError } = await this.supabase
    .from("flashcards")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (deleteError) {
    throw deleteError;
  }
}
```

2. Utworzyć plik `src/pages/api/flashcards/[id].ts` dla obsługi pojedynczej fiszki:

```typescript
import { z } from "zod";
import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import { flashcardIdSchema } from "../../../lib/validations/flashcards.schema";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { supabase } = locals;

    // Parse and validate the ID parameter
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

    const flashcardId = idValidation.data;
    const flashcardsService = new FlashcardsService(supabase);

    try {
      // Use DEFAULT_USER_ID instead of authentication (to be replaced with actual auth)
      await flashcardsService.deleteFlashcard(flashcardId, DEFAULT_USER_ID);

      // Return 204 No Content for successful deletion
      return new Response(null, {
        status: 204,
      });
    } catch (serviceError: any) {
      // Handle common error scenarios
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

      // Re-throw the error to be caught by the outer catch block
      throw serviceError;
    }
  } catch (error) {
    console.error("Error processing flashcard deletion request:", error);

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

3. Jeśli plik `src/pages/api/flashcards/[id].ts` już istnieje, dodać metodę DELETE do istniejącego pliku, zachowując obecne implementacje.

4. Upewnić się, że w pliku `src/lib/validations/flashcards.schema.ts` istnieje schema walidacji ID:

```typescript
// Schemat walidacji ID fiszki (jeśli jeszcze nie istnieje)
export const flashcardIdSchema = z.number().int().positive("Flashcard ID must be a positive integer");
```

5. Przeprowadzić testy:
   - Test 204: Usunięcie istniejącej fiszki użytkownika
   - Test 400: Próba usunięcia z nieprawidłowym ID (np. "abc")
   - Test 404: Próba usunięcia nieistniejącej fiszki
   - Test 404: Próba usunięcia fiszki należącej do innego użytkownika
