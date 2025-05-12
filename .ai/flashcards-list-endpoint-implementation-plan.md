# API Endpoint Implementation Plan: GET /api/flashcards

## 1. Przegląd punktu końcowego

Endpoint GET `/api/flashcards` umożliwia pobieranie paginowanej listy fiszek należących do zalogowanego użytkownika. Endpoint wspiera sortowanie, filtrowanie oraz paginację wyników, aby zapewnić elastyczne i wydajne przeglądanie kolekcji fiszek użytkownika.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- Struktura URL: `/api/flashcards`
- Parametry:
  - Opcjonalne:
    - `page` (domyślnie: 1) - numer strony wyników
    - `limit` (domyślnie: 10) - liczba fiszek na stronę
    - `sort` (np. `created_at`) - pole, po którym sortowane są wyniki
    - `filter` - zapytanie wyszukiwania dla pól `front` lub `back`
    - `order` (`asc` lub `desc`, domyślnie: `desc` dla pola `created_at`) - kierunek sortowania
- Request Body: brak (GET request)

## 3. Wykorzystywane typy

```typescript
// Już zdefiniowane w src/types.ts:
export type FlashcardDTO = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
}

export interface FlashcardsListResponseDTO {
  data: FlashcardDTO[];
  pagination: PaginationDTO;
}

// Nowy typ do zdefiniowania w pliku walidacji:
export interface ListFlashcardsQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: string;
  order?: "asc" | "desc";
}
```

## 4. Szczegóły odpowiedzi

- Kody statusu:
  - 200 OK - Poprawne pobranie fiszek
  - 400 Bad Request - Nieprawidłowe parametry zapytania
  - 401 Unauthorized - Brak autoryzacji
  - 500 Internal Server Error - Błąd serwera
- Format odpowiedzi (200 OK):

```json
{
  "data": [
    {
      "id": 1,
      "front": "Treść pytania",
      "back": "Treść odpowiedzi",
      "source": "manual",
      "generation_id": null,
      "created_at": "2023-01-01T12:00:00Z",
      "updated_at": "2023-01-01T12:00:00Z"
    }
    // ...więcej fiszek
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

## 5. Przepływ danych

1. **Walidacja zapytania**:

   - Sprawdzenie i walidacja parametrów zapytania przy użyciu Zod
   - Ustawienie wartości domyślnych dla brakujących parametrów opcjonalnych

2. **Autoryzacja**:

   - Weryfikacja, czy użytkownik jest zalogowany poprzez kontekst Supabase
   - Pobranie ID użytkownika z kontekstu autoryzacji - na ten moment używany DEFAULT_USER_ID

3. **Przetwarzanie zapytania w serwisie**:

   - Konstruowanie zapytania do bazy danych na podstawie parametrów
   - Filtrowanie wyników do fiszek należących tylko do zalogowanego użytkownika
   - Implementacja filtrowania tekstowego (jeśli podano parametr `filter`)
   - Zastosowanie sortowania według określonego pola i kierunku
   - Zastosowanie paginacji na podstawie `page` i `limit`

4. **Przygotowanie odpowiedzi**:
   - Konwersja wyników bazy danych do formatu DTO
   - Konstrukcja obiektu odpowiedzi z danymi i informacjami o paginacji

## 6. Względy bezpieczeństwa

1. **Autoryzacja**:

   - Zapewnienie, że użytkownik jest zalogowany przed dostępem do endpointu. Na ten moment używamy DEFAULT_USER_ID.
   - Filtrowanie wyników, aby zawierały tylko fiszki należące do zalogowanego użytkownika

2. **Walidacja danych wejściowych**:

   - Ścisła walidacja parametrów zapytania (page, limit, sort, filter, order)
   - Sanityzacja parametru `filter` w celu zapobiegania atakom SQL injection
   - Weryfikacja, czy pole `sort` jest dozwolonym polem do sortowania

3. **Zarządzanie błędami**:
   - Ukrywanie szczegółów technicznych w komunikatach o błędach zwracanych do klienta
   - Logowanie wewnętrznych błędów do celów debugowania

## 7. Obsługa błędów

1. **Nieprawidłowe parametry zapytania (400 Bad Request)**:

   - Nieprawidłowy format `page` lub `limit` (nie są liczbami dodatnimi)
   - Nieprawidłowa wartość `order` (inna niż 'asc' lub 'desc')
   - Nieprawidłowa wartość `sort` (niezgodna z dozwolonymi polami sortowania)

2. **Błąd autoryzacji (401 Unauthorized)**:

   - Brak ważnego tokenu autoryzacji
   - Wygaśnięcie sesji użytkownika

3. **Błędy serwera (500 Internal Server Error)**:
   - Problemy z połączeniem z bazą danych
   - Nieoczekiwane błędy w trakcie przetwarzania zapytania
   - Błędy w logice biznesowej

## 8. Rozważania dotyczące wydajności

1. **Optymalizacja zapytań**:

   - Użycie indeksów bazy danych dla pól używanych do sortowania i filtrowania
   - Dodanie indeksu dla kolumny `user_id` w tabeli `flashcards`
   - Dodanie indeksów dla kolumn używanych w `sort` (np. `created_at`)
   - Używanie COUNT(\*) OVER() w celu efektywnego obliczania całkowitej liczby rekordów

2. **Limity**:

   - Ograniczenie maksymalnej wartości parametru `limit` (np. do 100) w celu zapobiegania nadmiernemu obciążeniu

3. **Caching**:
   - Rozważenie mechanizmów cachowania dla często używanych zapytań

## 9. Kroki implementacji

1. **Rozszerzenie FlashcardsService o metodę listowania fiszek**:

   ```typescript
   // src/lib/services/flashcards.service.ts
   async listFlashcards(
     userId: string,
     page: number = 1,
     limit: number = 10,
     sort: string = 'id',
     order: 'asc' | 'desc' = 'asc',
     filter?: string
   ): Promise<{ data: FlashcardDTO[], total: number }> {
     // Implementacja
   }
   ```

2. **Utworzenie schematu walidacji dla parametrów zapytania**:

   ```typescript
   // src/lib/validations/flashcards.schema.ts
   export const listFlashcardsQuerySchema = z.object({
     page: z.coerce.number().int().positive().optional().default(1),
     limit: z.coerce.number().int().positive().max(100).optional().default(10),
     sort: z.enum(["created_at", "updated_at", "front", "back", "id"]).optional().default("id"),
     order: z.enum(["asc", "desc"]).optional().default("asc"),
     filter: z.string().optional(),
   });
   ```

3. **Implementacja handlera GET w pliku flashcards.ts**:

   ```typescript
   // src/pages/api/flashcards.ts
   export const GET: APIRoute = async ({ request, locals }) => {
     try {
       // Implementacja handlera GET
     } catch (error) {
       // Obsługa błędów
     }
   };
   ```

4. **Testy jednostkowe i integracyjne**:

   - Testy dla walidacji parametrów zapytania
   - Testy dla logiki paginacji, sortowania i filtrowania
   - Testy dla autoryzacji i filtrowania wyników po użytkowniku
   - Testy dla przypadków błędów

5. **Dokumentacja API**:
   - Aktualizacja dokumentacji API o nowy endpoint
   - Dodanie przykładów użycia z różnymi parametrami zapytania
   - Dokumentacja obsługiwanych kodów błędów
