# Plan implementacji widoku Generator Fiszek

## 1. Przegląd

Widok Generatora Fiszek (`/generator`) umożliwia użytkownikom wklejenie tekstu źródłowego (1000-10000 znaków), opcjonalny wybór modelu AI, a następnie zainicjowanie procesu generowania propozycji fiszek przez AI za pomocą endpointu `/api/generations`. Wygenerowane propozycje są wyświetlane na liście, gdzie użytkownik może je przeglądać, akceptować, odrzucać lub edytować (w dedykowanym modalu). Na koniec użytkownik może zapisać wszystkie lub tylko zaakceptowane fiszki do bazy danych za pomocą endpointu `/api/flashcards`. Widok zapewnia informacje zwrotne na temat postępu operacji i obsługuje potencjalne błędy.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/generator`. Implementacja jako strona Astro (`src/pages/generator.astro`), która będzie renderować główny komponent React odpowiedzialny za logikę i UI widoku.

## 3. Struktura komponentów

Komponenty będą zaimplementowane w React z użyciem TypeScript i Shadcn/ui, osadzone w stronie Astro.

```
GeneratorView (React Root w generator.astro)
├── GenerationForm
│   ├── TextArea (shadcn/ui: Textarea) - Pole na tekst źródłowy
│   ├── CharacterCounter - Licznik znaków dla TextArea
│   ├── Select (shadcn/ui: Select - Opcjonalnie) - Wybór modelu AI
│   └── Button (shadcn/ui: Button) - Przycisk "Generuj"
├── SkeletonLoader – komponent wskaźnika ładowania (skeleton), wyświetlany podczas oczekiwania na odpowiedź API.
├── ErrorDisplay (np. shadcn/ui: Alert/AlertDescription lub useToast) - Wyświetlanie błędów
└── FlashcardsProposalList (Renderowany warunkowo po otrzymaniu propozycji)
    ├── div - Kontener na liczniki/wskaźnik postępu recenzji
    │   ├── span - Licznik zaakceptowanych
    │   └── span - Licznik odrzuconych
    ├── FlashcardProposalItem[] - Lista kart z propozycjami
    │   ├── Card (shadcn/ui: Card) - Kontener karty
    │   ├── CardHeader/CardContent (shadcn/ui) - Wyświetlanie front/back
    │   ├── CardFooter (shadcn/ui) - Kontener na przyciski akcji
    │   │   ├── Button (variant="outline") - Akceptuj
    │   │   ├── Button (variant="outline") - Edytuj
    │   │   └── Button (variant="destructive") - Odrzuć
    │   └── div - Wskaźnik statusu (np. Badge z shadcn/ui: Accepted, Rejected, Edited)
    ├── div - Kontener na przyciski zapisu
    │   ├── Button (shadcn/ui: Button) - "Zapisz zatwierdzone"
    │   └── Button (shadcn/ui: Button, variant="secondary") - "Zapisz wszystkie" (opcjonalnie, zależnie od definicji)

```

## 4. Szczegóły komponentów

### `GeneratorView` (Komponent główny React)

- **Opis:** Kontener całego widoku. Zarządza stanem (za pomocą custom hooka `useGeneratorState`), obsługuje wywołania API (`/api/generations`, `/api/flashcards`) i koordynuje interakcje między komponentami podrzędnymi. Renderuje `GenerationForm`, `LoadingIndicator`, `ErrorDisplay`, `ProposalList` i `EditFlashcardModal` warunkowo, w zależności od stanu aplikacji.
- **Główne elementy:** Komponenty wymienione w strukturze.
- **Obsługiwane interakcje:** Inicjuje generowanie fiszek po otrzymaniu eventu z `GenerationForm`. Inicjuje zapisywanie fiszek po otrzymaniu eventu z `FlashcardProposalList`. Otwiera `EditFlashcardModal` po otrzymaniu eventu z `FlashcardProposalItem`.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji; deleguje do komponentów podrzędnych.
- **Typy:** `FlashcardProposalViewModel[]`, `string | null` (błędy), `boolean` (ładowanie), `string | null` (ID edytowanej propozycji).
- **Propsy:** Może otrzymywać ewentualne funkcje callback dla potwierdzenia zapisu lub przekierowania po zapisaniu.

### `GenerationForm`

- **Opis:** Formularz do wprowadzania danych wejściowych dla generowania fiszek. Zawiera pole tekstowe, licznik znaków, opcjonalny wybór modelu i przycisk "Generuj".
- **Główne elementy:** `Textarea`, `CharacterCounter`, `Select` (opcjonalnie), `Button`.
- **Obsługiwane interakcje:** Aktualizacja stanu tekstu źródłowego (`onInputChange`), aktualizacja wybranego modelu (`onModelChange`), wysłanie formularza (`onSubmit`).
- **Obsługiwana walidacja:**
  - Długość tekstu źródłowego musi być w zakresie 1000-10000 znaków.
  - Przycisk "Generuj" jest nieaktywny, jeśli walidacja długości tekstu nie przechodzi.
- **Typy:** `string` (sourceText), `string` (selectedModel).
- **Propsy:**
  - `sourceText: string`
  - `selectedModel: string`
  - `isGenerating: boolean` (do wyłączania przycisku podczas ładowania)
  - `onInputChange: (text: string) => void`
  - `onModelChange: (model: string) => void`
  - `onSubmit: (command: InitiateGenerationCommand) => void`

### `CharacterCounter`

- **Opis:** Wyświetla bieżącą liczbę znaków i wizualnie wskazuje, czy mieści się w dopuszczalnych limitach (min/max).
- **Główne elementy:** `<span>` lub `<p>`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Zmienia styl (np. kolor) w zależności od `currentCount` vs `min`/`max`.
- **Typy:** `number`.
- **Propsy:**
  - `currentCount: number`
  - `min: number`
  - `max: number`

### `FlashcardsProposalList`

- **Opis:** Wyświetla listę wygenerowanych propozycji (`FlashcardProposalItem`), liczniki recenzji oraz przyciski do zapisywania fiszek.
- **Główne elementy:** Kontenery `div`, mapowanie `proposals` na `FlashcardProposalItem`, liczniki `span`, przyciski `Button`.
- **Obsługiwane interakcje:** Deleguje akcje z `ProposalCard` (accept, reject, edit) do rodzica. Obsługuje kliknięcia przycisków "Zapisz zatwierdzone" (`onSaveApproved`) i "Zapisz wszystkie" (`onSaveAll`).
- **Obsługiwana walidacja:**
  - Przycisk "Zapisz zatwierdzone" jest aktywny tylko, gdy istnieje co najmniej jedna propozycja ze statusem `accepted` lub `edited`.
  - Przycisk "Zapisz wszystkie" jest aktywny tylko, gdy lista propozycji nie jest pusta.
- **Typy:** `FlashcardProposalViewModel[]`.
- **Propsy:**
  - `proposals: FlashcardProposalViewModel[]`
  - `isSaving: boolean` (do wyłączania przycisków zapisu)
  - `onAccept: (proposalId: string) => void`
  - `onReject: (proposalId: string) => void`
  - `onEdit: (proposalId: string) => void`
  - `onSaveApproved: () => void`
  - `onSaveAll: () => void`

### `FlashcardProposalItem`

- **Opis:** Wyświetla pojedynczą propozycję fiszki (przód, tył), jej status recenzji oraz przyciski akcji (Akceptuj, Edytuj, Odrzuć).
- **Główne elementy:** `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Button`, `Badge` (dla statusu).
- **Obsługiwane interakcje:** Kliknięcie przycisków "Akceptuj", "Edytuj", "Odrzuć" emituje odpowiednie zdarzenia do rodzica (`onAccept`, `onEdit`, `onReject`).
- **Obsługiwana walidacja:** Brak. Wizualnie odzwierciedla status propozycji (np. przez `Badge`, stylizację przycisków).
- **Typy:** `FlashcardProposalViewModel`.
- **Propsy:**
  - `proposal: FlashcardProposalViewModel`
  - `onAccept: (proposalId: string) => void`
  - `onReject: (proposalId: string) => void`
  - `onEdit: (proposalId: string) => void`

### `EditFlashcardModal`

- **Opis:** Modal (dialog) do edycji tekstu przodu i tyłu wybranej propozycji fiszki. Zawiera liczniki znaków i przyciski zapisu/anulowania.
- **Główne elementy:** `Dialog`, `DialogContent`, `Input`, `Textarea`, `CharacterCounter`, `DialogFooter`, `Button`.
- **Obsługiwane interakcje:** Aktualizacja stanu edytowanego tekstu. Kliknięcie "Zapisz" (`onSave`), kliknięcie "Anuluj" (`onCancel`).
- **Obsługiwana walidacja:**
  - Długość tekstu 'front' musi być > 0 i <= 200 znaków.
  - Długość tekstu 'back' musi być > 0 i <= 500 znaków.
  - Przycisk "Zapisz" jest nieaktywny, jeśli walidacja nie przechodzi.
- **Typy:** `FlashcardProposalViewModel` (dla danych początkowych), `{ front: string, back: string }` (dla danych zaktualizowanych).
- **Propsy:**
  - `isOpen: boolean`
  - `proposal: FlashcardsProposalViewModel | null` (propozycja do edycji)
  - `onSave: (proposalId: string, updatedData: { front: string, back: string }) => void`
  - `onCancel: () => void`

## 5. Typy

Kluczowe typy danych wykorzystywane w widoku:

- **`InitiateGenerationCommand` (z `src/types.ts`):** Używany do stworzenia payloadu dla `POST /api/generations`.
  ```typescript
  interface InitiateGenerationCommand {
    source_text: string; // 1000-10000 znaków
    model: string; // Identyfikator modelu AI
  }
  ```
- **`InitiateGenerationResponseDTO` (z `src/types.ts`):** Reprezentuje odpowiedź z `POST /api/generations`.
  ```typescript
  interface InitiateGenerationResponseDTO {
    generation_id: number;
    flashcard_proposals: GenerationFlashcardProposalDTO[];
    ai_complete_count: number; // Liczba propozycji
  }
  ```
- **`GenerationFlashcardProposalDTO` (z `src/types.ts`):** Reprezentuje pojedynczą propozycję w odpowiedzi API.
  ```typescript
  interface GenerationFlashcardProposalDTO {
    front: string; // <= 200 znaków (powinno być zweryfikowane przez backend/LLM)
    back: string; // <= 500 znaków (powinno być zweryfikowane przez backend/LLM)
    source: "ai-complete";
  }
  ```
- **`FlashcardProposalViewModel` (Nowy typ frontendowy):** Rozszerza propozycję API o stan UI potrzebny do procesu recenzji.
  ```typescript
  interface ProposalViewModel {
    id: string; // Unikalny identyfikator po stronie klienta (np. crypto.randomUUID())
    front: string; // Aktualny tekst przodu (może być edytowany)
    back: string; // Aktualny tekst tyłu (może być edytowany)
    status: "pending" | "accepted" | "rejected" | "edited"; // Status recenzji
    originalFront: string; // Oryginalny tekst przodu z API
    originalBack: string; // Oryginalny tekst tyłu z API
    source: "ai-complete" | "ai-with-updates"; // Źródło, zmienia się na 'ai-with-updates' po edycji
    model: string; // Model użyty do generacji (przechowywany z odpowiedzi API)
    generation_id: number; // ID generacji (przechowywane z odpowiedzi API)
  }
  ```
- **`CreateFlashcardsCommand` (z `src/types.ts`):** Używany do stworzenia payloadu dla `POST /api/flashcards`.
  ```typescript
  interface CreateFlashcardsCommand {
    flashcards: CreateFlashcardAiDTO[]; // Tablica fiszek do zapisania
  }
  ```
- **`CreateFlashcardAiDTO` (z `src/types.ts`):** Reprezentuje strukturę pojedynczej fiszki AI do zapisania.
  ```typescript
  interface CreateFlashcardAiDTO {
    front: string; // <= 200 znaków
    back: string; // <= 500 znaków
    source: "ai-complete" | "ai-with-updates";
    model: string; // Wymagane
    generation_id: number; // Wymagane (ID z InitiateGenerationResponseDTO)
  }
  ```

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany w głównym komponencie `GeneratorView` przy użyciu hooków React (`useState`, `useReducer` lub preferowanie `zustand` jeśli projekt go używa). Ze względu na złożoność logiki (obsługa API, stanu propozycji, edycji), zalecane jest stworzenie **customowego hooka `useGeneratorState`**.

**Hook `useGeneratorState` będzie zarządzał:**

- `sourceText: string`: Tekst z `TextArea`.
- `selectedModel: string`: Wybrany model AI.
- `proposals: ProposalViewModel[]`: Lista propozycji fiszek ze stanem recenzji.
- `generationId: number | null`: ID bieżącej generacji.
- `generationModel: string | null`: Model użyty dla bieżącej generacji.
- `isGenerating: boolean`: Stan ładowania dla API generowania.
- `isSaving: boolean`: Stan ładowania dla API zapisywania.
- `generationError: string | null`: Błąd z API generowania.
- `saveError: string | null`: Błąd z API zapisywania.
- `editingProposalId: string | null`: ID propozycji aktualnie edytowanej w modalu.

**Hook `useGeneratorState` będzie udostępniał funkcje:**

- `setSourceText`, `setSelectedModel`.
- `handleGenerate()`: Obsługuje logikę wywołania `POST /api/generations`.
- `handleAccept(proposalId: string)`: Zmienia status propozycji na `accepted`.
- `handleReject(proposalId: string)`: Zmienia status propozycji na `rejected`.
- `handleEditStart(proposalId: string)`: Ustawia `editingProposalId` i otwiera modal.
- `handleEditSave(proposalId: string, updatedData: { front: string, back: string })`: Aktualizuje propozycję w stanie, zmienia status na `edited` i `source` na `ai-with-updates`, zamyka modal.
- `handleEditCancel()`: Czyści `editingProposalId` i zamyka modal.
- `handleSaveApproved()`: Filtruje propozycje (`accepted`, `edited`) i wywołuje `POST /api/flashcards`.
- `handleSaveAll()`: Filtruje propozycje (`pending`, `accepted`, `edited`) i wywołuje `POST /api/flashcards`.

## 7. Integracja API

Widok integruje się z dwoma endpointami API:

1.  **`POST /api/generations`**

    - **Cel:** Wysłanie tekstu źródłowego i zainicjowanie generowania propozycji fiszek.
    - **Wywołanie:** Po kliknięciu przycisku "Generuj" (po walidacji).
    - **Request Payload:** `InitiateGenerationCommand` (`{ source_text: string, model: string }`).
    - **Response Payload:** `InitiateGenerationResponseDTO` (`{ generation_id: number, flashcard_proposals: GenerationFlashcardProposalDTO[], ai_complete_count: number }`).
    - **Obsługa:** Aktualizacja stanu `isGenerating`, `generationError`, `proposals` (mapowanie DTO na ViewModel), `generationId`, `generationModel`.

2.  **`POST /api/flashcards`**
    - **Cel:** Zapisanie zaakceptowanych/edytowanych/wszystkich propozycji jako fiszek w bazie danych.
    - **Wywołanie:** Po kliknięciu przycisku "Zapisz zatwierdzone" lub "Zapisz wszystkie".
    - **Request Payload:** `CreateFlashcardsCommand` (`{ flashcards: CreateFlashcardAiDTO[] }`). Tablica `flashcards` jest tworzona przez transformację odpowiednich `ProposalViewModel` do `CreateFlashcardAiDTO` (uwzględniając edytowane `front`/`back` i ustawiając `source` na `ai-with-updates` dla edytowanych).
    - **Response Payload:** `{ data: FlashcardDTO[] }` (zawiera nowo utworzone fiszki).
    - **Obsługa:** Aktualizacja stanu `isSaving`, `saveError`. Wyświetlenie komunikatu o sukcesie (np. Toast). Opcjonalne wyczyszczenie stanu propozycji lub nawigacja.

## 8. Interakcje użytkownika

- **Wpisywanie tekstu:** Aktualizuje stan `sourceText`, licznik znaków, stan przycisku "Generuj".
- **Wybór modelu (opcjonalnie):** Aktualizuje stan `selectedModel`.
- **Kliknięcie "Generuj":** Rozpoczyna proces generowania (walidacja, API call, loading state, obsługa odpowiedzi/błędu).
- **Kliknięcie "Akceptuj":** Zmienia status wizualny karty i wewnętrzny stan `ProposalViewModel.status` na `'accepted'`. Aktualizuje liczniki recenzji.
- **Kliknięcie "Odrzuć":** Zmienia status wizualny karty i wewnętrzny stan `ProposalViewModel.status` na `'rejected'`. Aktualizuje liczniki recenzji.
- **Kliknięcie "Edytuj":** Otwiera `EditFlashcardModal` z danymi tej propozycji.
- **Edycja w modalu:** Aktualizuje tymczasowy stan w modalu, waliduje długość pól, wpływa na stan przycisku "Zapisz" w modalu.
- **Kliknięcie "Zapisz" (w modalu):** Zapisuje zmiany w głównym stanie (`proposals`), aktualizuje `front`, `back`, `status` na `'edited'`, `source` na `'ai-with-updates'`. Zamyka modal.
- **Kliknięcie "Anuluj" (w modalu):** Zamyka modal bez zapisywania zmian.
- **Kliknięcie "Zapisz zatwierdzone":** Rozpoczyna proces zapisywania zaakceptowanych i edytowanych fiszek (API call, loading state, obsługa odpowiedzi/błędu).
- **Kliknięcie "Zapisz wszystkie":** Rozpoczyna proces zapisywania wszystkich nieodrzuconych fiszek (API call, loading state, obsługa odpowiedzi/błędu).

## 9. Warunki i walidacja

- **Pole tekstowe (`TextArea` w `GenerationForm`):** Wymaga tekstu o długości 1000-10000 znaków.
  - **UI:** `CharacterCounter` pokazuje aktualną długość i wizualnie sygnalizuje (np. kolorem), czy jest w zakresie. Przycisk "Generuj" jest nieaktywny (`disabled`), jeśli długość jest poza zakresem.
- **Modal edycji (`EditFlashcardModal`):**
  - Pole 'front' wymaga tekstu o długości > 0 i <= 200 znaków.
  - Pole 'back' wymaga tekstu o długości > 0 i <= 500 znaków.
  - **UI:** Liczniki znaków w modalu pokazują limity. Przycisk "Zapisz" w modalu jest nieaktywny, jeśli którekolwiek z pól nie spełnia warunków walidacji.
- **Przyciski zapisu (`FlashcardProposalList`):**
  - "Zapisz zatwierdzone" jest aktywny tylko, gdy `proposals.some(p => p.status === 'accepted' || p.status === 'edited')`.
  - "Zapisz wszystkie" jest aktywny tylko, gdy `proposals.length > 0`.

## 10. Obsługa błędów

- **Błędy walidacji formularza generowania:** Komunikaty wyświetlane inline (np. przez `CharacterCounter`) i deaktywacja przycisku "Generuj".
- **Błędy walidacji modala edycji:** Komunikaty wyświetlane inline (np. przez liczniki znaków w modalu) i deaktywacja przycisku "Zapisz" w modalu.
- **Błędy API (`POST /api/generations`):**
  - **400 Bad Request:** Wyświetlić komunikat błędu (np. "Tekst źródłowy musi mieć od 1000 do 10000 znaków.") w komponencie `ErrorDisplay` lub jako Toast.
  - **500 Internal Server Error:** Wyświetlić ogólny komunikat (np. "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie.") w `ErrorDisplay` lub jako Toast.
- **Błędy API (`POST /api/flashcards`):**
  - **400 Bad Request:** Wyświetlić ogólny komunikat błędu walidacji lub bazy danych (np. "Błąd zapisu fiszek. Sprawdź wprowadzone dane.") jako Toast lub w `ErrorDisplay`.
  - **403 Forbidden:** Wyświetlić komunikat o braku autoryzacji (np. "Brak uprawnień do zapisu tych fiszek.") jako Toast/ErrorDisplay.
  - **404 Not Found:** Wyświetlić komunikat o nieznalezionym zasobie (np. "Nie można znaleźć powiązanej generacji.") jako Toast/ErrorDisplay.
  - **500 Internal Server Error:** Wyświetlić ogólny komunikat (np. "Wystąpił błąd podczas zapisywania fiszek. Spróbuj ponownie.") jako Toast/ErrorDisplay.
- **Komunikaty sukcesu:** Po pomyślnym zapisaniu fiszek (`POST /api/flashcards` zwraca 201) wyświetlić komunikat sukcesu używając Shadcn/ui `useToast`.

## 11. Kroki implementacji

1.  **Stworzenie strony Astro:** Utworzyć plik `src/pages/generator.astro`.
2.  **Stworzenie głównego komponentu React:** Utworzyć plik `src/components/views/GeneratorView.tsx` (lub podobnie). Osadzić go w `generator.astro` z odpowiednią dyrektywą `client:*` (np. `client:load`).
3.  **Implementacja `useGeneratorState`:** Stworzyć custom hook (`src/hooks/useGeneratorState.ts`) z podstawową logiką stanu (zmienne stanu, puste funkcje handlerów).
4.  **Implementacja `GenerationForm`:** Stworzyć komponent (`src/components/generator/GenerationForm.tsx`) z `Textarea`, `CharacterCounter`, (opcjonalnie `Select`) i `Button`. Podłączyć go do stanu i handlerów z `useGeneratorState` przekazanych przez propsy. Zaimplementować logikę walidacji i deaktywacji przycisku.
5.  **Implementacja `CharacterCounter`:** Stworzyć reużywalny komponent (`src/components/ui/CharacterCounter.tsx` lub podobnie).
6.  **Implementacja logiki generowania:** W `useGeneratorState` zaimplementować funkcję `handleGenerate` wywołującą `POST /api/generations`, obsługującą stany ładowania i błędu, oraz przetwarzającą odpowiedź (mapowanie `GenerationFlashcardProposalDTO` na `ProposalViewModel`).
7.  **Implementacja `LoadingIndicator` i `ErrorDisplay`:** Dodać komponenty do `GeneratorView` renderowane warunkowo na podstawie stanów `isGenerating`, `isSaving`, `generationError`, `saveError`. Można użyć komponentów Shadcn/ui.
8.  **Implementacja `FlashcardProposalList`:** Stworzyć komponent (`src/components/generator/FlashcardProposalList.tsx`). Renderować listę `FlashcardProposalItem` na podstawie stanu `proposals`. Dodać liczniki i przyciski zapisu z logiką deaktywacji.
9.  **Implementacja `FlashcardProposalItem`:** Stworzyć komponent (`src/components/generator/FlashcardProposalItem.tsx`). Wyświetlać dane `proposal`, dodać przyciski akcji wywołujące handlery z propsów. Dodać wizualne wskazanie statusu.
10. **Implementacja logiki recenzji:** W `useGeneratorState` zaimplementować funkcje `handleAccept`, `handleReject`, aktualizujące status odpowiedniej `ProposalViewModel`.
11. **Implementacja `EditFlashcardModal`:** Stworzyć komponent (`src/components/generator/EditFlashcardModal.tsx`) używając `Dialog` z Shadcn/ui. Dodać pola formularza, liczniki znaków, przyciski. Zaimplementować walidację i logikę deaktywacji przycisku zapisu.
12. **Implementacja logiki edycji:** W `useGeneratorState` zaimplementować `handleEditStart`, `handleEditSave`, `handleEditCancel`, zarządzające stanem `editingProposalId` i aktualizujące `ProposalViewModel` po zapisie edycji.
13. **Implementacja logiki zapisywania:** W `useGeneratorState` zaimplementować `handleSaveApproved` i `handleSaveAll`, które filtrują `proposals`, transformują je do `CreateFlashcardAiDTO[]`, wywołują `POST /api/flashcards` i obsługują odpowiedź/błąd.
14. **Dodanie Toastów:** Zintegrować Shadcn/ui `useToast` do wyświetlania komunikatów o sukcesie zapisu i ewentualnie mniej krytycznych błędów.
15. **Styling i Refinement:** Dopracować style za pomocą Tailwind CSS, upewnić się, że komponenty Shadcn/ui są poprawnie zintegrowane i ostylowane. Przetestować przepływ użytkownika i obsługę przypadków brzegowych.
16. **Testowanie:** Przeprowadzić manualne testy wszystkich funkcjonalności, walidacji i obsługi błędów.
