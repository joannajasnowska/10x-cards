# API Endpoint Implementation Plan: Retrieve a Single Flashcard

## 1. Przegląd punktu końcowego

Endpoint umożliwia pobieranie szczegółów pojedynczej fiszki na podstawie jej identyfikatora. Zapewnia autoryzację dostępu, walidację parametrów oraz odpowiednią obsługę błędów, gdy fiszka nie istnieje lub użytkownik nie ma do niej dostępu.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- Struktura URL: `/api/flashcards/{id}`
- Parametry:
  - Wymagane:
    - `id`: identyfikator fiszki (liczba całkowita dodatnia)
- Request Body: brak (GET request)

## 3. Wykorzystywane typy

```typescript
// Już zdefiniowane w src/types.ts:
export type FlashcardDTO = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

// Nowy schemat walidacji do zdefiniowania:
export const flashcardIdSchema = z.number().int().positive();
```

## 4. Szczegóły odpowiedzi

- Kody statusu:
  - 200 OK - Fiszka znaleziona i zwrócona
  - 400 Bad Request - Nieprawidłowy format ID
  - 401 Unauthorized - Brak autoryzacji
  - 404 Not Found - Fiszka nie istnieje lub użytkownik nie ma do niej dostępu
  - 500 Internal Server Error - Błąd serwera
- Format odpowiedzi (200 OK):

```json
{
  "data": {
    "id": 123,
    "front": "Pytanie na przedniej stronie fiszki",
    "back": "Odpowiedź na tylnej stronie fiszki",
    "source": "manual",
    "generation_id": null,
    "created_at": "2023-10-15T14:30:00Z",
    "updated_at": "2023-10-15T14:30:00Z"
  }
}
```

## 5. Przepływ danych

1. Pobranie parametru `id` z URL.
2. Walidacja, czy `id` jest poprawną liczbą całkowitą dodatnią.
3. Sprawdzenie autoryzacji użytkownika.
4. Wywołanie usługi do pobrania fiszki z bazy danych.
5. Weryfikacja, czy fiszka należy do zalogowanego użytkownika.
6. Zwrócenie danych fiszki lub odpowiedniego kodu błędu.

## 6. Względy bezpieczeństwa

- **Autoryzacja**: Sprawdzenie, czy użytkownik jest zalogowany.
- **Kontrola dostępu**: Weryfikacja, czy użytkownik ma dostęp do żądanej fiszki (jest jej właścicielem).
- **Walidacja danych wejściowych**: Ścisła walidacja parametru `id` dla ochrony przed atakami wstrzyknięcia.
- **Sanityzacja danych wyjściowych**: Zapewnienie, że dane wyjściowe nie zawierają poufnych informacji (np. user_id).

## 7. Obsługa błędów

- **Nieprawidłowy format ID**: Zwróć 400 Bad Request z odpowiednim komunikatem.
- **Fiszka nie istnieje**: Zwróć 404 Not Found.
- **Nieautoryzowany dostęp**: Zwróć 401 Unauthorized, gdy użytkownik nie jest zalogowany.
- **Brak uprawnień**: Zwróć 404 Not Found (zamiast 403 Forbidden) dla bezpieczeństwa - nie ujawniaj istnienia zasobów, do których użytkownik nie ma dostępu.
- **Błędy bazy danych**: Logowanie błędów, zwróć 500 Internal Server Error z ogólnym komunikatem.

## 8. Rozważania dotyczące wydajności

- **Indeksowanie**: Upewnienie się, że kolumna `id` w tabeli `flashcards` jest odpowiednio zindeksowana.
- **Cache**: Rozważenie implementacji cache'owania odpowiedzi dla często przeglądanych fiszek.
- **Selektywne pobieranie danych**: Pobieranie tylko niezbędnych kolumn z bazy danych.

## 9. Kroki implementacji

1. Dodać schemat walidacji w `src/lib/validations/flashcards.schema.ts`:

```typescript
export const flashcardIdSchema = z.number().int().positive("Flashcard ID must be a positive integer");
```

2. Dodać metodę `getFlashcardById` do serwisu `src/lib/services/flashcards.service.ts`:

```typescript
/**
 * Retrieves a single flashcard by ID
 * @param id The ID of the flashcard to retrieve
 * @param userId The ID of the user requesting the flashcard
 * @returns The flashcard data or null if not found
 */
async getFlashcardById(id: number, userId: string): Promise<FlashcardDTO | null> {
  const { data, error } = await this.supabase
    .from("flashcards")
    .select("id, front, back, source, generation_id, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    // Check if this is a "not found" error
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as FlashcardDTO;
}
```

3. **Implementacja handlera w pliku flashcards.ts**:

```typescript
import { z } from "zod";
import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import { flashcardIdSchema } from "../../../lib/validations/flashcards.schema";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
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

    // Retrieve the flashcard
    const flashcard = await flashcardsService.getFlashcardById(flashcardId, DEFAULT_USER_ID);

    if (!flashcard) {
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

    return new Response(
      JSON.stringify({
        data: flashcard,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error retrieving flashcard:", error);

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

4. Zaktualizować testy (jeśli istnieją) dla nowych funkcjonalności.

5. Dodać dokumentację API dla nowego endpointu.
