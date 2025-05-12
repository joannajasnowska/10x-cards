# API Endpoint Implementation Plan: Flashcards Generation Endpoint

## 1. Przegląd punktu końcowego

Endpoint służy do inicjowania procesu generowania propozycji fiszek przy użyciu zewnętrznego API LLM. Po otrzymaniu odpowiedniego tekstu źródłowego oraz identyfikatora modelu, system weryfikuje dane wejściowe, rejestruje nowy rekord generacji i wywołuje zewnętrzne API celem wygenerowania propozycji fiszek. Ostatecznie, endpoint zwraca szczegóły generacji wraz z propozycjami fiszek.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **URL:** /api/generations
- **Parametry i format żądania:**
  - **Wymagane pola w Request Body:**
    - `source_text`: string (tekst o długości od 1000 do 10000 znaków)
    - `model`: string (identyfikator wybranego modelu, niepusty)
  - **Walidacja:**
    - `source_text` musi mieścić się w limicie długości (1000-10000 znaków)
    - `model` musi być prawidłowym, niepustym ciągiem znaków

## 3. Wykorzystywane typy

- **InitiateGenerationCommand:** zawiera `source_text` oraz `model` (definiowany w `src/types.ts`).
- **InitiateGenerationResponseDTO:** zawiera dane generacji oraz tablicę `flashcard_proposals` (każda z nich typu `GenerationFlashcardProposalDTO`).
- Pozostałe typy:
  - `GenerationDTO` – reprezentacja rekordu generacji.
  - `GenerationFlashcardProposalDTO` – reprezentacja pojedynczej propozycji fiszki (z polami `front`, `back`, `source`).

## 4. Przepływ danych

1. Klient wysyła żądanie POST na endpoint `/api/generations` z payloadem, zawierającym `source_text` i `model`.
2. Na poziomie API:
   - Walidacja danych wejściowych przy użyciu Zod.
   - Pobranie kontekstu użytkownika (np. z Supabase Auth w `request.locals`).
   - Obliczenie hashu `source_text` oraz rejestrowanie czasu rozpoczęcia generacji.
3. Delegacja logiki do warstwy serwisowej - wywołanie dedykowanego serwisu (np. generation.service), który:
   - Wywoła zewnętrzną usługę LLM celem uzyskania propozycji fiszek
   - Rejestracja rekordu w tabeli `generations` z odpowiednimi danymi (w tym `source_text_length`, `source_text_hash`, `model`, liczby fiszek itp.).
4. Zwrócenie odpowiedzi w formacie JSON zawierającej szczegóły generacji w formacie `GenerationFlashcardProposalDTO`. Status odpowiedzi to 201 Created.

## 5. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja:**
  - Endpoint powinien weryfikować tożsamość użytkownika (np. za pomocą Supabase Auth) i zabezpieczać dostęp do danych.
- **Walidacja danych wejściowych:**
  - Użycie silnej walidacji (np. Zod) aby zapewnić zgodność formatu `source_text` oraz `model`.
- **Ochrona przed atakami:**
  - Ograniczenia długości tekstu oraz przy użyciu parametrów zapytań w bazie danych aby zapobiec SQL Injection.

## 6. Obsługa błędów

- **Błędy walidacji (400 Bad Request):**
  - W przypadku nieprawidłowych danych wejściowych, zwrócenie kodu 400 wraz z komunikatem błędu.
- **Błędy serwera (500 Internal Server Error):**
  - Błędy podczas komunikacji z zewnętrznym API LLM lub zapisu do bazy danych powinny skutkować zwróceniem kodu 500.
- **Logowanie zdarzeń:**
  - W sytuacji błędów wywoływane powinno być logowanie do tabeli `generation_logs` (zapisywanie `error_code` oraz `error_message`).

## 7. Rozważania dotyczące wydajności

- **Przetwarzanie dużych danych wejściowych:**
  - Tekst źródłowy może mieć do 10 000 znaków; należy zapewnić optymalizację pamięci i zapytań do bazy.
- **Asynchroniczność:**
  - Wykorzystanie operacji asynchronicznych dla wywołań zewnętrznego API i zapytań DB w celu poprawy responsywności.
- **Optymalizacja zapytań:**
  - Użycie indeksów w bazie danych dla często wyszukiwanych pól.

## 8. Etapy wdrożenia

1. **Przygotowanie środowiska:**
   - Upewnić się, że stos technologiczny (Astro, TypeScript, Supabase) jest prawidłowo skonfigurowany.
2. **Implementacja endpointu API:**
   - Utworzyć plik endpointu (np. `src/pages/api/generations.ts`).
   - Zaimportować i skonfigurować walidację danych wejściowych (np. Zod schema dla `InitiateGenerationCommand`).
   - Pobierać bieżące dane użytkownika z kontekstu (np. `request.locals`).
3. **Implementacja logiki serwisowej:**
   - Wyodrębnić logikę generacji do osobnej warstwy serwisowej (np. w `src/lib/services/generations.service.ts`), gdzie zostanie wykonane:
     - Obliczenie hash-a źródłowego tekstu
     - Rejestracja rekordu w tabeli `generations`
     - Wywołanie zewnętrznego API LLM
     - Opcjonalnie: rejestracja błędów w `generation_logs`
4. **Walidacja i obsługa błędów:**
   - Implementacja walidacji danych wejściowych i natychmiastowe zwracanie 400 w przypadku błędów.
   - Implementacja mechanizmów try-catch dla obsługi wyjątków oraz zwracania 500 przy awariach.
5. **Testowanie endpointu:**
   - Przeprowadzić testy jednostkowe oraz integracyjne dla endpointu, symulując zarówno scenariusze sukcesu jak i błędów.
6. **Dokumentacja i code review:**
   - Sporządzić dokumentację endpointu oraz przeprowadzić code review z zespołem developerskim.
7. **Wdrożenie i monitoring:**
   - Wdrożyć rozwiązanie na środowisko staging/production.
   - Monitorować logi oraz wydajność endpointu, wprowadzając ewentualne poprawki.
