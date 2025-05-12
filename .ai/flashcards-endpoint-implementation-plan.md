# API Endpoint Implementation Plan: Create Flashcards

## 1. Przegląd punktu końcowego

Endpoint umożliwia tworzenie jednej lub wielu fiszek (zarówno manualnych, jak i wygenerowanych przez AI) w jednej operacji. Zapewnia przy tym ścisłą walidację danych wejściowych oraz odpowiednie powiązanie z rekordem generacji (jeśli dotyczy).

## 2. Szczegóły żądania

- Metoda HTTP: POST
- URL: `/api/flashcards`
- Nagłówki:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- Body (JSON):
  ```json
  {
    "flashcards": [
      {
        "front": "What is the capital of France?",
        "back": "Paris",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "Define photosynthesis.",
        "back": "Process by which green plants convert light energy into chemical energy.",
        "source": "ai-complete",
        "generation_id": 123
      }
    ]
  }
  ```
- Parametry:
  - Wymagane:
    - `flashcards` (tablica niepusta)
    - `front` (string, max 200 znaków)
    - `back` (string, max 500 znaków)
    - `source` (enum: `manual`, `ai-complete`, `ai-with-updates`)
  - Opcjonalne/warunkowe:
    - `generation_id` (number|null) – musi być `null` gdy `source` = `manual`

## 3. Wykorzystywane typy

- **CreateFlashcardDTO**: Bazowy interfejs dla wszystkich typów fiszek
- **CreateFlashcardManualDTO**: Rozszerzenie bazowego interfejsu dla fiszek tworzonych ręcznie
- **CreateFlashcardAiDTO**: Rozszerzenie bazowego interfejsu dla fiszek generowanych przez AI
- **CreateFlashcardsCommand**: Polecenie zawierające tablicę fiszek do utworzenia
- **FlashcardDTO**: Obiekt zwrotny reprezentujący utworzoną fiszkę

## 4. Szczegóły odpowiedzi

- Kod statusu: 201 Created
- Body (JSON):
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "...",
        "back": "...",
        "source": "manual",
        "generation_id": null,
        "created_at": "2023-10-10T12:00:00Z",
        "updated_at": "2023-10-10T12:00:00Z"
      },
      {
        "id": 2,
        "front": "...",
        "back": "...",
        "source": "ai-complete",
        "generation_id": 456,
        "created_at": "2023-10-10T12:05:00Z",
        "updated_at": "2023-10-10T12:05:00Z"
      }
    ]
  }
  ```
- Kody błędów:
  - 400 Bad Request (walidacja)
  - 401 Unauthorized (brak/nieprawidłowy token)
  - 500 Internal Server Error (błędy serwera/bazy)

## 5. Przepływ danych

1. Warstwa API (np. w /src/pages/api/flashcards.ts) odbiera żądanie i weryfikuje autoryzację użytkownika. Uwierzytelnienie: pobranie `user_id` z `context.locals.supabase.auth.getUser()`.
2. Walidacja wejścia: Zod schema w `src/lib/validations/flashcards.schema.ts`.
3. Mapowanie DTO → modele DB.
4. Wywołanie serwisu `createFlashcards(command, userId)` w `src/lib/services/flashcards.service.ts`:
   - Batch insert poprzez `supabase.from('flashcards').insert([...])` z `user_id` z tokena.
5. Sprawdzenie poprawnych referencji do `generation_id` (jeśli podano) - weryfikacja czy generacja należy do zalogowanego użytkownika.
6. W razie powodzenia zwrócenie obiektów `FlashcardDTO` z bazy.

## 6. Względy bezpieczeństwa

- Weryfikacja JWT i pobranie `user_id` z kontekstu Astro (middleware).
- Weryfikacja czy `generation_id` (jeśli podano) należy do zalogowanego użytkownika.
- Unikanie SQL injection przez użycie parametrów Supabase SDK.
- Limit liczby fiszek w jednym żądaniu (np. max 50) oraz limit rozmiaru payloadu.
- Escape HTML w polach tekstowych, aby uniknąć XSS.
- Walidacja poprawności typów danych i formatu na poziomie API, aby uniknąć przekazywania niepoprawnych danych do bazy.

## 7. Obsługa błędów

- 400: nieprawidłowe dane (walidacja Zod) lub logiczne niespójności (`source` vs `generation_id`/`model`).
- 401: brak lub nieważny token.
- 403: próba powiązania fiszki z generacją, która nie należy do zalogowanego użytkownika.
- 404: podane `generation_id` nie istnieje w bazie.
- 500: nieoczekiwany wyjątek lub błąd bazy danych (logowanie w konsoli/systemie monitoringu).

### 7.1 Szczegółowa obsługa błędów dla fiszek AI

W przypadku fiszek generowanych przez AI (`source` = `ai-complete` lub `ai-with-updates`), gdy wystąpi błąd:

1. Dla błędów walidacji (kod 400):

   - Zaloguj dokładny typ błędu walidacji (np. brak wymaganego pola, nieprawidłowy format)
   - Zaloguj identyfikator modelu AI (`model`) dla celów analitycznych
   - Jeśli podano `generation_id`, zapisz wpis w tabeli `generation_logs` z kodem błędu i opisem

2. Dla błędów autoryzacji (kod 401/403):

   - Zaloguj próbę nieuprawnionego dostępu z informacją o ID użytkownika (jeśli dostępne)
   - Zapisz adres IP żądania dla analizy potencjalnych ataków

3. Dla błędów referencji (kod 404):

   - Zaloguj nieprawidłowy `generation_id`
   - Dodaj wpis do `generation_logs` z kodem błędu `INVALID_GENERATION_REFERENCE`

4. Dla błędów serwera (kod 500):

   - Zapisz pełny stack trace błędu do logów systemowych
   - Dodaj wpis do tabeli `generation_logs` zawierający:
     ```
     {
       "user_id": <user_id>,
       "generation_id": <generation_id>,
       "error_code": "SERVER_ERROR",
       "error_message": <opis błędu>,
       "model": <model AI>,
       "source_text_hash": <hash z powiązanej generacji, jeśli dostępny>,
       "source_text_length": <długość tekstu z powiązanej generacji, jeśli dostępna>
     }
     ```
   - Ustaw flagę alarmową dla zespołu DevOps w przypadku powtarzających się błędów

5. Obsługa błędów transakcyjnych:
   - Implementacja wzorca "all-or-nothing" dla batch insertów (jeśli jedna fiszka się nie powiedzie, żadna nie powinna zostać zapisana)
   - W przypadku częściowego powodzenia (np. gdy niektóre fiszki spełniają walidację, a inne nie):
     - Zwróć kod 207 Multi-Status z informacją o statusie każdej fiszki
     - Zaloguj które fiszki zostały utworzone, a które nie (z przyczynami)

## 8. Rozważania dotyczące wydajności

- Batch insert zamiast pojedynczych zapytań.
- Indeks na `user_id` i `generation_id` dla szybszego wyszukiwania.
- Limit liczby fiszek w jednym żądaniu (np. max 50) dla uniknięcia przeciążenia serwera.
- Kompresja odpowiedzi dla większych zestawów danych.
- Cache kontrolny na poziomie nagłówków HTTP dla optymalizacji ruchu sieciowego.

## 9. Kroki implementacji

1. Utworzyć Zod schema `src/lib/validations/flashcards.schema.ts`:

   ```typescript
   export const createFlashcardManualSchema = z.object({
     front: z.string().max(200),
     back: z.string().max(500),
     source: z.literal("manual"),
     generation_id: z.null(),
   });

   export const createFlashcardAiSchema = z.object({
     front: z.string().max(200),
     back: z.string().max(500),
     source: z.enum(["ai-complete", "ai-with-updates"]),
     generation_id: z.number(),
   });

   export const createFlashcardSchema = z.discriminatedUnion("source", [
     createFlashcardManualSchema,
     createFlashcardAiSchema,
   ]);

   export const createFlashcardsSchema = z.object({
     flashcards: z.array(createFlashcardSchema).min(1).max(50),
   });
   ```

2. Dodać serwis `src/lib/services/flashcards.service.ts` z metodą `createFlashcards` i obsługą błędów:

   ```typescript
   // Implementacja funkcji logującej błędy dla fiszek AI
   const logAiFlashcardError = async (error: any, userId: string, flashcardData: CreateFlashcardAiDTO) => {
     try {
       // Pobierz informacje o generacji, jeśli dostępne
       let generationData = null;
       if (flashcardData.generation_id) {
         generationData = await supabase
           .from("generations")
           .select("source_text_hash, source_text_length")
           .eq("id", flashcardData.generation_id)
           .single();
       }

       // Utwórz wpis w tabeli generation_logs
       awai[generation-view-implementation-plan.md](generation-view-implementation-plan.md)t supabase.from("generation_logs").insert({
         user_id: userId,
         generation_id: flashcardData.generation_id,
         error_code: error.code || "UNKNOWN_ERROR",
         error_message: error.message || "Unexpected error while creating AI flashcards",
         source_text_hash: generationData?.data?.source_text_hash || "",
         source_text_length: generationData?.data?.source_text_length || 0,
       });
     } catch (logError) {
       // Jeśli logowanie się nie powiedzie, zapisz w konsoli dla celów debugowych
       console.error("Unexpected error while creating AI flashcards:", logError);
     }
   };
   ```

3. Stworzyć endpoint w `src/pages/api/flashcards.ts`:
   - Importować schema i serwis.
   - Uwierzytelnić użytkownika.
   - Walidować payload.
   - Wywołać serwis.
   - Obsłużyć błędy zgodnie z sekcją 7.1.
   - Zwrócić 201 z danymi.
4. Dodać testy jednostkowe dla walidacji, serwisu i endpointu.
5. Uaktualnić dokumentację API i zaktualizować plik `README.md`.
6. Zweryfikować zgodność z lintingiem i uruchomić CI.
