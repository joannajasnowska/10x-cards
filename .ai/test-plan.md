# Plan Testów (Zaktualizowany)

## 1. Wprowadzenie i cele testowania

Celem testowania jest zapewnienie wysokiej jakości i niezawodności aplikacji, która wykorzystuje nowoczesne technologie takie jak Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui oraz integrację z Supabase. Testy mają na celu wykrycie potencjalnych błędów, zagwarantowanie spójnego interfejsu użytkownika oraz prawidłowej komunikacji między komponentami a backendem.

## 2. Zakres testów

- **Frontend:** Weryfikacja renderowania stron, interaktywności elementów React, zgodności komponentów Shadcn/ui oraz poprawności stylowania z użyciem Tailwind.
- **Backend:** Testowanie API endpoints, integracji z bazą danych Supabase oraz mechanizmów autoryzacji.
- **Integracja:** Sprawdzenie współdziałania między frontendem i backendem, w tym komunikacji między elementami aplikacji.
- **Wydajność i responsywność:** Analiza szybkości ładowania stron i działania aplikacji na różnych urządzeniach oraz przy różnych obciążeniach.

## 3. Typy testów

- **Testy jednostkowe (Unit Tests):** Testowanie poszczególnych funkcji, komponentów i helperów z wykorzystaniem Vitest i React Testing Library.
- **Testy komponentów:** Izolowane testowanie komponentów UI z wykorzystaniem Storybook i @storybook/testing-library.
- **Testy integracyjne:** Walidacja współpracy między komponentami oraz komunikacji z API i usługami backendowymi, z wykorzystaniem MSW do mockowania API.
- **Testy end-to-end (E2E):** Symulacja scenariuszy użytkowania dla pełnych przepływów z wykorzystaniem Playwright.
- **Testy API:** Testowanie endpointów API z wykorzystaniem Supertest lub Pactum.js.
- **Testy regresyjne:** Regularne uruchamianie testów w celu upewnienia się, że nowe zmiany nie wprowadzają nowych błędów.
- **Testy wydajnościowe i obciążeniowe:** Monitorowanie czasu odpowiedzi i stabilności pod różnym obciążeniem z wykorzystaniem Lighthouse, Web Vitals i funkcji tracingu w Playwright.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Rejestracja i uwierzytelnianie (US-001, US-002, US-009, US-010)

1. **Rejestracja nowego użytkownika:**

   - Weryfikacja poprawności walidacji formularza rejestracyjnego (wymagane pola, format email, minimalna długość hasła)
   - Testowanie obsługi istniejącego adresu email (komunikat o błędzie)
   - Sprawdzenie przekierowania po pomyślnej rejestracji
   - Weryfikacja zapisania danych użytkownika w bazie Supabase

2. **Logowanie użytkownika:**

   - Testowanie logowania z poprawnymi danymi (przekierowanie do widoku generowania fiszek)
   - Weryfikacja logowania z nieprawidłowymi danymi (odpowiedni komunikat błędu)
   - Testowanie persystencji sesji użytkownika po odświeżeniu strony
   - Sprawdzenie działania automatycznego wylogowania po wygaśnięciu sesji

3. **Bezpieczeństwo dostępu:**

   - Weryfikacja ograniczenia dostępu do chronionych stron dla niezalogowanych użytkowników
   - Testowanie ochrony danych przed dostępem przez innych użytkowników
   - Weryfikacja poprawności wylogowania (usunięcie sesji, przekierowanie)

### 4.2. Generowanie i zarządzanie fiszkami (US-003, US-004)

1. **Generowanie fiszek przez AI:**

   - Testowanie walidacji pola tekstowego (minimum 1000, maksimum 10 000 znaków)
   - Weryfikacja integracji z API modelu LLM z użyciem mock serwera MSW
   - Sprawdzenie obsługi błędów API i wyświetlanie odpowiednich komunikatów
   - Testowanie wyświetlania wygenerowanych propozycji fiszek

2. **Przegląd i zatwierdzanie propozycji fiszek:**

   - Weryfikacja wyświetlania listy wygenerowanych fiszek
   - Testowanie funkcjonalności zatwierdzania, edycji i odrzucania pojedynczych fiszek
   - Sprawdzenie zapisywania zatwierdzonych fiszek do bazy danych
   - Testowanie mechanizmu zapisywania wielu fiszek jednocześnie

3. **Obsługa błędów generowania:**
   - Weryfikacja zachowania aplikacji przy problemach z połączeniem
   - Testowanie obsługi nieprawidłowych odpowiedzi z API LLM
   - Sprawdzenie mechanizmu ponownych prób przy tymczasowych błędach
   - Testowanie zachowania przy przekroczeniu limitów API

### 4.3. Zarządzanie zapisanymi fiszkami (US-005, US-006, US-007)

1. **Edycja istniejących fiszek:**

   - Testowanie otwierania formularza edycji dla istniejącej fiszki
   - Weryfikacja walidacji pól (maksymalna długość "przodu" 200 znaków, "tyłu" 500 znaków)
   - Sprawdzenie zapisywania zmian w bazie danych
   - Testowanie anulowania edycji bez zapisywania zmian

2. **Usuwanie fiszek:**

   - Weryfikacja wyświetlania opcji usunięcia przy każdej fiszce
   - Testowanie potwierdzenia przed trwałym usunięciem
   - Sprawdzenie usunięcia fiszki z bazy danych po potwierdzeniu
   - Testowanie anulowania operacji usuwania

3. **Ręczne tworzenie fiszek:**

   - Weryfikacja działania przycisku dodania nowej fiszki
   - Testowanie formularza tworzenia z polami "Przód" i "Tył"
   - Sprawdzenie walidacji formularza (wymagane pola, maksymalne długości)
   - Testowanie zapisywania nowej fiszki i jej wyświetlania na liście

4. **Zarządzanie listą fiszek:**
   - Weryfikacja paginacji dla dużej liczby fiszek
   - Testowanie funkcjonalności wyszukiwania fiszek
   - Sprawdzenie filtrowania fiszek według kryteriów
   - Testowanie sortowania listy fiszek

### 4.5. Responsywność i dostępność

1. **Testy na różnych urządzeniach:**

   - Weryfikacja wyglądu i funkcjonalności na tabletach (landscape i portrait)
   - Testowanie na urządzeniach mobilnych różnych rozmiarów
   - Sprawdzanie działania na dużych ekranach desktopowych
   - Testowanie z różnymi ustawieniami systemu (ciemny/jasny motyw, różne skale)

2. **Testy dostępności:**
   - Weryfikacja dostępności dla czytników ekranowych
   - Testowanie nawigacji klawiaturą
   - Sprawdzanie kontrastu kolorów i czytelności tekstu
   - Testowanie zgodności z WCAG 2.1 AA

### 4.6. Wydajność i bezpieczeństwo

1. **Testy wydajnościowe:**

   - Pomiar czasu ładowania kluczowych stron aplikacji
   - Testowanie wydajności generowania fiszek dla dużych fragmentów tekstu
   - Sprawdzenie responsywności interfejsu podczas operacji asynchronicznych
   - Monitorowanie zużycia pamięci przy długotrwałym korzystaniu z aplikacji

2. **Testy bezpieczeństwa:**
   - Weryfikacja bezpiecznego przechowywania danych użytkownika
   - Testowanie ochrony przed popularnymi zagrożeniami (XSS, CSRF)
   - Sprawdzenie poprawności implementacji uprawnień i kontroli dostępu
   - Testowanie zgodności z wymogami RODO

## 5. Środowisko testowe

- **Lokalne środowisko deweloperskie:** Konfiguracja zbliżona do produkcyjnego z wykorzystaniem identycznych wersji bibliotek i usług.
- **Testowa baza danych:** Supabase Local Development do lokalnego testowania z izolowaną bazą danych.
- **Konteneryzacja:** Wykorzystanie Docker i Docker Compose do orkiestracji całego środowiska testowego.
- **Izolowane testy integracyjne:** Wykorzystanie TestContainers do izolowanych testów z rzeczywistymi zależnościami.

## 6. Narzędzia do testowania

- **Frameworki testów jednostkowych:** Vitest i React Testing Library do testów jednostkowych i integracyjnych.
- **Mockowanie API:** MSW (Mock Service Worker) do realistycznego mockowania API.
- **Testowanie komponentów:** Storybook z dodatkiem @storybook/testing-library.
- **Testy E2E:** Playwright do wieloprzeglądarkowych testów (Chromium, Firefox, WebKit).
- **Testy API:** Supertest lub Pactum.js do testowania endpointów.
- **Testy bazy danych:** Drizzle ORM do typowo bezpiecznych testów z Supabase.
- **Testy wydajnościowe:** Lighthouse, Web Vitals, Sentry Performance, Tracing w Playwright.
- **CI/CD:** GitHub Actions z Turborepo do cache'owania wyników testów i przyspieszenia pipeline'ów.
- **Raportowanie:** Allure do wizualizacji wyników testów.

## 7. Harmonogram testów

- **Planowanie:** 1 tydzień – ustalenie zakresu testów, przygotowanie środowiska i narzędzi.
- **Konfiguracja Storybook i testów komponentów:** 1 tydzień - utworzenie biblioteki komponentów.
- **Implementacja testów jednostkowych i integracyjnych:** 2 tygodnie – pisanie i uruchamianie testów z Vitest.
- **Konfiguracja i wdrożenie MSW:** 1 tydzień - przygotowanie mocków API.
- **Testy E2E z Playwright:** 2 tygodnie – przygotowanie i uruchomienie scenariuszy testowych.
- **Konfiguracja Docker Compose i TestContainers:** 1 tydzień - przygotowanie izolowanych środowisk.
- **Testy wydajnościowe:** 1 tydzień – analiza i optymalizacja wydajności aplikacji.
- **Konfiguracja CI/CD z Turborepo:** 1 tydzień - optymalizacja pipeline'ów.
- **Testy regresyjne i zbiorcze:** Cykliczne w ramach sprintów i przed wdrożeniem do produkcji.

## 8. Kryteria akceptacji testów

- Pokrycie krytycznych funkcjonalności testami na poziomie co najmniej 80%.
- Brak krytycznych błędów zgłoszonych w trakcie testów oraz minimalna liczba błędów wpływających na użyteczność aplikacji.
- Pomyślne przejście wszystkich testów jednostkowych, integracyjnych i E2E przed wdrożeniem zmian.
- Zachowanie minimalnych progów dla Core Web Vitals w testach wydajnościowych.

## 9. Role i odpowiedzialności

- **Inżynierowie QA:** Opracowywanie, uruchamianie i analiza wyników testów.
- **Deweloperzy:** Wdrażanie poprawek w oparciu o zgłoszone błędy, pisanie testów jednostkowych i komponentów.
- **Kierownik projektu:** Monitorowanie postępów i koordynacja prac pomiędzy zespołami.
- **Specjaliści DevOps:** Integracja testów z pipeline CI/CD oraz utrzymanie środowiska testowego, konfiguracja TestContainers i Docker Compose.

## 10. Procedury raportowania błędów

- **System zgłoszeń:** Użycie narzędzia (np. Jira, GitHub Issues) do rejestrowania i śledzenia błędów.
- **Priorytetyzacja:** Błędy oznaczane według krytyczności i wpływu na użytkownika.
- **Dokumentacja:** Każdy raport błędu zawiera opis, kroki reprodukcji, zrzuty ekranu oraz logi systemowe.
- **Komunikacja:** Regularne spotkania między zespołem QA a deweloperami w celu omówienia i priorytetyzacji problemów.
- **Automatyczne raportowanie:** Integracja Allure do wizualizacji wyników testów automatycznych.

## 11. Plan wdrażania nowych narzędzi testowych

### Faza 1 (Wysoki priorytet)

1. Migracja z Jest na Vitest
2. Wdrożenie Playwright jako głównego narzędzia do testów E2E
3. Dodanie MSW do mockowania API

### Faza 2 (Średni priorytet)

1. Konfiguracja Storybook do testowania komponentów UI
2. Wdrożenie Turborepo do CI/CD pipeline
3. Dodanie Supertest lub Pactum.js do testów API

### Faza 3 (Niski priorytet)

1. Wdrożenie Web Vitals i Sentry Performance do monitorowania wydajności
2. Konfiguracja TestContainers i Docker Compose dla izolowanych środowisk testowych
3. Implementacja Supabase Local Development
