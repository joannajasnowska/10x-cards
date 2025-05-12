# Plan implementacji widoku "Moje Fiszki"

## 1. Przegląd

Widok "Moje Fiszki" umożliwia użytkownikowi przeglądanie, wyszukiwanie i zarządzanie zapisanymi fiszkami. Widok zawiera funkcjonalność filtrowania, sortowania, paginacji oraz umożliwia tworzenie nowych fiszek ręcznie, edycję istniejących oraz ich usuwanie.

## 2. Routing widoku

Strona dostępna pod ścieżką: `/flashcards`

## 3. Struktura komponentów

```
FlashcardsPage
├── FlashcardsHeader
│   └── Button (Add New Flashcard)
├── FlashcardsFilters
│   ├── SearchInput
│   └── SortDropdown
├── FlashcardsStats
├── FlashcardsList
│   ├── FlashcardItem[]
│   │   ├── FlashcardContent
│   │   ├── FlashcardSourceIcon
│   │   ├── EditButton
│   │   └── DeleteButton
│   └── Pagination
├── FlashcardModal (conditional)
│   ├── TextField (front)
│   │   └── CharacterCounter
│   ├── TextField (back)
│   │   └── CharacterCounter
│   ├── SaveButton
│   └── CancelButton
└── DeleteConfirmationDialog (conditional)
    ├── ConfirmButton
    └── CancelButton
```

## 4. Szczegóły komponentów

### FlashcardsPage

- Opis komponentu: Główny komponent strony zawierający wszystkie pozostałe komponenty, zarządzający globalnym stanem
- Główne elementy: Nagłówek, filtry, statystyki, lista fiszek, modalne okna
- Obsługiwane interakcje: Zarządzanie globalnym stanem, obsługa akcji użytkownika
- Obsługiwana walidacja: N/A
- Typy: FlashcardsPageState, FlashcardsListResponseDTO
- Propsy: N/A

### FlashcardsHeader

- Opis komponentu: Nagłówek strony z tytułem i przyciskiem dodawania nowej fiszki
- Główne elementy: Tytuł "Moje Fiszki", przycisk "Dodaj fiszkę ręcznie"
- Obsługiwane interakcje: Kliknięcie przycisku dodawania nowej fiszki
- Obsługiwana walidacja: N/A
- Typy: N/A
- Propsy: `{ onAddNewClick: () => void }`

### FlashcardsFilters

- Opis komponentu: Zawiera elementy filtrowania i sortowania fiszek
- Główne elementy: Pole wyszukiwania, dropdown sortowania
- Obsługiwane interakcje: Zmiana filtrów, resetowanie filtrów
- Obsługiwana walidacja: Poprawność wartości filtrów
- Typy: FilterParams
- Propsy: `{ filters: FilterParams, onChange: (filters: Partial<FilterParams>) => void }`

### FlashcardsStats

- Opis komponentu: Wyświetla statystyki dotyczące fiszek
- Główne elementy: Liczba fiszek, dodatkowe metryki
- Obsługiwane interakcje: N/A
- Obsługiwana walidacja: N/A
- Typy: `{ total: number }`
- Propsy: `{ total: number }`

### FlashcardsList

- Opis komponentu: Lista fiszek z paginacją
- Główne elementy: Lista FlashcardItem, komponent Pagination
- Obsługiwane interakcje: Wybór strony
- Obsługiwana walidacja: N/A
- Typy: FlashcardDTO[], PaginationDTO
- Propsy: `{ flashcards: FlashcardDTO[], pagination: PaginationDTO, onPageChange: (page: number) => void, onEdit: (flashcard: FlashcardDTO) => void, onDelete: (flashcard: { id: number, front: string }) => void, isLoading: boolean }`

### FlashcardItem

- Opis komponentu: Pojedynczy element listy fiszek
- Główne elementy: Treść fiszki, ikona źródła, przyciski akcji
- Obsługiwane interakcje: Kliknięcie edycji, kliknięcie usunięcia, podgląd szczegółów
- Obsługiwana walidacja: N/A
- Typy: FlashcardDTO
- Propsy: `{ flashcard: FlashcardDTO, onEdit: (flashcard: FlashcardDTO) => void, onDelete: (flashcard: { id: number, front: string }) => void }`

### FlashcardModal

- Opis komponentu: Modalne okno do tworzenia/edycji fiszki
- Główne elementy: Pola tekstowe z licznikami znaków, przyciski akcji
- Obsługiwane interakcje: Zmiana pól, zapisanie, anulowanie
- Obsługiwana walidacja:
  - Przód fiszki: pole wymagane, max 200 znaków
  - Tył fiszki: pole wymagane, max 500 znaków
- Typy: FlashcardFormState, FlashcardModalProps
- Propsy: `{ flashcard?: FlashcardDTO, isOpen: boolean, onClose: () => void, onSave: (flashcard: CreateFlashcardDTO | UpdateFlashcardCommand) => Promise<void> }`

### DeleteConfirmationDialog

- Opis komponentu: Dialog potwierdzenia usunięcia fiszki
- Główne elementy: Informacja o fiszce, przyciski potwierdzenia i anulowania
- Obsługiwane interakcje: Potwierdzenie, anulowanie
- Obsługiwana walidacja: N/A
- Typy: DeleteConfirmationDialogProps
- Propsy: `{ flashcard: { id: number, front: string } | null, isOpen: boolean, onClose: () => void, onConfirm: (id: number) => Promise<void>, isDeleting: boolean }`

### Pagination

- Opis komponentu: Komponent paginacji
- Główne elementy: Przyciski stron, informacja o bieżącej stronie
- Obsługiwane interakcje: Zmiana strony
- Obsługiwana walidacja: Poprawność numeru strony
- Typy: PaginationDTO
- Propsy: `{ pagination: PaginationDTO, onChange: (page: number) => void }`

### CharacterCounter

- Opis komponentu: Licznik znaków dla pól tekstowych
- Główne elementy: Licznik znaków (aktualna/maksymalna liczba)
- Obsługiwane interakcje: N/A
- Obsługiwana walidacja: Przekroczenie limitu (zmiana koloru)
- Typy: `{ current: number, max: number }`
- Propsy: `{ current: number, max: number }`

## 5. Typy

### FilterParams

```typescript
interface FilterParams {
  search: string;
  sort: "created_at" | "updated_at";
  order: "asc" | "desc";
  page: number;
  limit: number;
}
```

### FlashcardFormState

```typescript
interface FlashcardFormState {
  front: string;
  back: string;
  isValid: boolean;
  frontError?: string;
  backError?: string;
  isSaving: boolean;
}
```

### FlashcardModalProps

```typescript
interface FlashcardModalProps {
  flashcard?: FlashcardDTO;
  isOpen: boolean;
  onClose: () => void;
  onSave: (flashcard: CreateFlashcardDTO | UpdateFlashcardCommand) => Promise<void>;
}
```

### DeleteConfirmationDialogProps

```typescript
interface DeleteConfirmationDialogProps {
  flashcard: { id: number; front: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  isDeleting: boolean;
}
```

### FlashcardsPageState

```typescript
interface FlashcardsPageState {
  flashcards: FlashcardDTO[];
  pagination: PaginationDTO;
  isLoading: boolean;
  error: string | null;
  filters: FilterParams;
  editingFlashcard: FlashcardDTO | null;
  deletingFlashcard: { id: number; front: string } | null;
}
```

## 6. Zarządzanie stanem

Strona będzie korzystać z hooka `useFlashcardsState`, który będzie zarządzać całym stanem widoku:

```typescript
const useFlashcardsState = () => {
  const [state, setState] = useState<FlashcardsPageState>({
    flashcards: [],
    pagination: { page: 1, limit: 10, total: 0 },
    isLoading: true,
    error: null,
    filters: { search: "", sort: "created_at", order: "desc", page: 1, limit: 10 },
    editingFlashcard: null,
    deletingFlashcard: null,
  });

  // Metody zarządzania stanem i komunikacji z API
  const fetchFlashcards = useCallback(async () => {
    // Pobieranie fiszek z uwzględnieniem filtrów
  }, [state.filters]);

  const createFlashcard = useCallback(async (flashcard: CreateFlashcardDTO) => {
    // Tworzenie fiszki
  }, []);

  const updateFlashcard = useCallback(async (id: number, data: UpdateFlashcardCommand) => {
    // Aktualizacja fiszki
  }, []);

  const deleteFlashcard = useCallback(async (id: number) => {
    // Usuwanie fiszki
  }, []);

  // Metody zarządzania interfejsem
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

  // Pobieranie danych przy zmianie filtrów
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
```

Dodatkowo, dla formularza edycji/tworzenia fiszki będzie używany hook `useFlashcardForm`:

```typescript
const useFlashcardForm = (initialData?: FlashcardDTO) => {
  const [form, setForm] = useState<FlashcardFormState>({
    front: initialData?.front || "",
    back: initialData?.back || "",
    isValid: false,
    frontError: undefined,
    backError: undefined,
    isSaving: false,
  });

  // Walidacja formularza
  const validateForm = useCallback(() => {
    // Implementacja walidacji
  }, [form.front, form.back]);

  // Metody zarządzania formularzem
  const updateField = useCallback((field: "front" | "back", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    // Reset formularza
  }, [initialData]);

  const setIsSaving = useCallback((isSaving: boolean) => {
    setForm((prev) => ({
      ...prev,
      isSaving,
    }));
  }, []);

  // Automatyczna walidacja przy zmianie pól
  useEffect(() => {
    validateForm();
  }, [form.front, form.back, validateForm]);

  return {
    form,
    updateField,
    validateForm,
    resetForm,
    setIsSaving,
  };
};
```

## 7. Integracja API

### Pobieranie listy fiszek

- **Endpoint:** GET /api/flashcards
- **Query Params:** page, limit, sort, filter, order
- **Typ odpowiedzi:** FlashcardsListResponseDTO
- **Implementacja:**

```typescript
const fetchFlashcards = async () => {
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
};
```

### Tworzenie fiszki

- **Endpoint:** POST /api/flashcards
- **Request Body:** { flashcards: CreateFlashcardDTO[] }
- **Typ odpowiedzi:** { data: FlashcardDTO[] }
- **Implementacja:**

```typescript
const createFlashcard = async (flashcard: CreateFlashcardDTO) => {
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
};
```

### Aktualizacja fiszki

- **Endpoint:** PUT /api/flashcards/{id}
- **Request Body:** UpdateFlashcardCommand
- **Typ odpowiedzi:** FlashcardDTO
- **Implementacja:**

```typescript
const updateFlashcard = async (id: number, data: UpdateFlashcardCommand) => {
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
};
```

### Usuwanie fiszki

- **Endpoint:** DELETE /api/flashcards/{id}
- **Typ odpowiedzi:** 204 No Content
- **Implementacja:**

```typescript
const deleteFlashcard = async (id: number) => {
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
};
```

## 8. Interakcje użytkownika

1. **Wyszukiwanie fiszek**

   - Użytkownik wprowadza tekst do pola wyszukiwania
   - Po kliknięciu przycisku wyszukiwania lub wciśnięciu Enter, lista fiszek jest filtrowana
   - Paginacja resetuje się do pierwszej strony

2. **Sortowanie fiszek**

   - Użytkownik wybiera pole sortowania i kierunek z dropdown
   - Lista fiszek jest automatycznie sortowana zgodnie z wyborem
   - Paginacja resetuje się do pierwszej strony

3. **Nawigacja po stronach**

   - Użytkownik klika przyciski nawigacji paginacji
   - Lista fiszek jest aktualizowana o elementy z wybranej strony

4. **Tworzenie nowej fiszki**

   - Użytkownik klika przycisk "Dodaj fiszkę ręcznie"
   - Otwiera się modalne okno z pustymi polami
   - Po wypełnieniu pól i kliknięciu "Zapisz", nowa fiszka jest tworzona
   - Lista fiszek jest odświeżana, aby pokazać nowy element

5. **Edycja fiszki**

   - Użytkownik klika przycisk edycji przy fiszce
   - Otwiera się modalne okno z danymi fiszki
   - Po zmianie pól i kliknięciu "Zapisz", fiszka jest aktualizowana
   - Lista fiszek jest odświeżana

6. **Usuwanie fiszki**
   - Użytkownik klika przycisk usunięcia przy fiszce
   - Pojawia się dialog potwierdzenia
   - Po kliknięciu "Zatwierdź", fiszka jest usuwana
   - Lista fiszek jest odświeżana
   - Anulowanie zamyka dialog bez zmian

## 9. Warunki i walidacja

### Walidacja pól fiszki

1. **Przód fiszki**

   - Pole wymagane
   - Maksymalna długość: 200 znaków
   - Komunikat przy przekroczeniu: "Przód fiszki nie może być dłuższy niż 200 znaków"
   - Licznik znaków: zmiana koloru przy zbliżaniu się do limitu

2. **Tył fiszki**
   - Pole wymagane
   - Maksymalna długość: 500 znaków
   - Komunikat przy przekroczeniu: "Tył fiszki nie może być dłuższy niż 500 znaków"
   - Licznik znaków: zmiana koloru przy zbliżaniu się do limitu

### Walidacja parametrów API

1. **Parametry paginacji**

   - page: liczba całkowita > 0
   - limit: liczba całkowita > 0, domyślnie 10

2. **Parametry sortowania**
   - sort: 'created_at' lub 'updated_at'
   - order: 'asc' lub 'desc'

## 10. Obsługa błędów

1. **Błąd pobierania listy fiszek**

   - Wyświetlenie komunikatu błędu nad listą
   - Przycisk do ponownej próby pobrania
   - Zachowanie ostatnich poprawnie pobranych danych, jeśli są dostępne

2. **Błąd tworzenia/aktualizacji fiszki**

   - Wyświetlenie komunikatu błędu w modalu
   - Zachowanie wprowadzonych wartości
   - Przycisk zapisu pozostaje aktywny, umożliwiając ponowną próbę

3. **Błąd usuwania fiszki**

   - Wyświetlenie komunikatu błędu w dialogu potwierdzenia
   - Przycisk potwierdzenia pozostaje aktywny, umożliwiając ponowną próbę

4. **Brak fiszek**

   - Wyświetlenie przyjaznego komunikatu "Nie masz jeszcze żadnych fiszek"
   - Przycisk "Dodaj pierwszą fiszkę"

5. **Problemy z połączeniem**
   - Informacja o problemach z połączeniem
   - Automatyczne ponowienie próby po przywróceniu połączenia

## 11. Kroki implementacji

1. **Przygotowanie typów i hooków**

   - Definicja typów (FilterParams, FlashcardFormState, itd.)
   - Implementacja hooków (useFlashcardsState, useFlashcardForm)

2. **Implementacja głównych komponentów**

   - FlashcardsPage - główny komponent widoku
   - FlashcardsHeader - z przyciskiem dodawania
   - FlashcardsFilters - wyszukiwanie i sortowanie
   - FlashcardsList - lista fiszek z paginacją

3. **Implementacja komponentów interaktywnych**

   - FlashcardItem - pojedyncza fiszka na liście
   - FlashcardModal - tworzenie/edycja fiszki
   - DeleteConfirmationDialog - potwierdzenie usunięcia

4. **Integracja z API**

   - Metody CRUD dla fiszek
   - Obsługa paginacji i filtrowania
   - Zarządzanie stanem ładowania i błędami

5. **Testy manualne i naprawa bugów**

   - Testowanie wszystkich interakcji użytkownika
   - Testowanie walidacji
   - Testowanie obsługi błędów

6. **Optymalizacja wydajności**
   - Memoizacja komponentów
   - Optymalizacja renderowania listy
   - Efektywne zarządzanie stanem
