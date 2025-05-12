# Architektura UI dla Flashcards Generator

## 1. Przegląd struktury UI

Architektura UI aplikacji Flashcards Generator składa się z kilku kluczowych widoków zorganizowanych wokół dwóch głównych funkcjonalności: generowania fiszek przez AI oraz zarządzania istniejącymi fiszkami. Struktura UI opiera się na nowoczesnym, responsywnym designie z wykorzystaniem komponentów shadcn/ui i Tailwind CSS.

Główne założenia struktury:

- Topbar z nawigacją jako stały element wszystkich widoków po zalogowaniu
- Dwa główne widoki operacyjne: Generator Fiszek i Moje Fiszki
- System modali do edycji i tworzenia fiszek
- Informacje zwrotne w postaci inline (błędy krytyczne) i toastów (sukces, mniej istotne błędy)
- Responsywny design oparty o utility classes Tailwind (sm:, md:, lg:)

## 2. Lista widoków

### 2.1. Logowanie/Rejestracja

- **Ścieżka**: `/login`, `/register`
- **Główny cel**: Umożliwienie uwierzytelnienia użytkownika lub utworzenia nowego konta
- **Kluczowe informacje**:
  - Formularz logowania (email, hasło)
  - Formularz rejestracji (email, hasło, powtórz hasło)
  - Komunikaty błędów walidacji
- **Kluczowe komponenty**:
  - Formularze z walidacją
  - Przyciski akcji
  - Linki do przełączania między widokami logowania/rejestracji
- **UX i dostępność**:
  - Jasne komunikaty błędów
  - Automatyczne fokusowanie pierwszego pola
  - Obsługa klawisza Enter
  - Walidacja w czasie rzeczywistym
- **Bezpieczeństwo**:
  - Maskowanie pola hasła
  - Wykorzystanie tokenów JWT
  - Zabezpieczenie przed atakami CSRF

### 2.2. Generator Fiszek

- **Ścieżka**: `/generator`
- **Główny cel**: Umożliwienie wprowadzenia tekstu źródłowego, wygenerowania propozycji fiszek oraz ich recenzji i zapisania
- **Kluczowe informacje**:
  - Pole tekstowe z licznikiem znaków (1000-10000)
  - Opcjonalny dropdown wyboru modelu AI
  - Status generowania
  - Lista propozycji fiszek (przód/tył)
  - Opcje akcji dla każdej fiszki (zaakceptuj/edytuj/odrzuć)
  - Licznik zatwierdzonych/odrzuconych fiszek
- **Kluczowe komponenty**:
  - Duże pole tekstowe
  - Licznik znaków z kolorowym wskaźnikiem limitu
  - Dropdown wyboru modelu
  - Przycisk "Generuj"
  - Komponent Loading
  - Karty fiszek z przyciskami akcji (zatwierdź/edytuj/odrzuć)
  - Modal edycji fiszki
  - Przyciski zbiorcze: "Zapisz wszystkie", "Zapisz zatwierdzone"
  - Wskaźnik postępu recenzji
- **UX i dostępność**:
  - Wyraźne wskazanie limitu znaków
  - Blokowanie przycisku generowania jeśli tekst nie spełnia wymogów
  - Wskaźnik postępu generowania
  - Możliwość anulowania generowania
  - Wyraźne rozróżnienie między zatwierdzonymi i niezatwierdzonymi fiszkami
  - Szybka nawigacja między fiszkami (skróty klawiszowe)
  - Zachowanie stanu recenzji przy przewijaniu strony
- **Bezpieczeństwo**:
  - Walidacja danych wejściowych
  - Zabezpieczenie przed atakami XSS
  - Walidacja danych przed zapisem
  - Ochrona przed utratą danych (potwierdzenie przy opuszczaniu strony)

### 2.3. Moje Fiszki

- **Ścieżka**: `/flashcards`
- **Główny cel**: Przeglądanie, wyszukiwanie i zarządzanie zapisanymi fiszkami
- **Kluczowe informacje**:
  - Lista zapisanych fiszek
  - Opcje filtrowania i sortowania
  - Statystyki (liczba fiszek)
- **Kluczowe komponenty**:
  - Pole wyszukiwania z przyciskiem zatwierdzenia
  - Dropdown sortowania
  - Karty fiszek z opcjami edycji/usunięcia
  - Paginacja (domyślnie 10 fiszek na stronę)
  - Przycisk "Dodaj fiszkę ręcznie"
  - Ikony rozróżniające źródło fiszek (AI vs. ręczne)
- **UX i dostępność**:
  - Szybki podgląd zawartości fiszki
  - Wyraźne oznaczenie źródła fiszki (ikona)
  - Natychmiastowa reakcja interfejsu na akcje użytkownika
- **Bezpieczeństwo**:
  - Potwierdzenie przed usunięciem fiszki
  - Autoryzacja dostępu do danych

### 2.4. Edycja Fiszki (Modal)

- **Ścieżka**: Modalny komponent, nie osobna ścieżka
- **Główny cel**: Umożliwienie edycji istniejącej lub stworzenia nowej fiszki
- **Kluczowe informacje**:
  - Pola edycji przodu i tyłu fiszki
  - Liczniki znaków (przód: max 200, tył: max 500)
- **Kluczowe komponenty**:
  - Formularz z walidacją
  - Liczniki znaków
  - Przyciski "Zapisz" i "Anuluj"
- **UX i dostępność**:
  - Walidacja w czasie rzeczywistym
  - Automatyczne fokusowanie pierwszego pola
  - Blokowanie przycisku zapisu przy nieprawidłowych danych
- **Bezpieczeństwo**:
  - Walidacja danych wejściowych
  - Zabezpieczenie przed utratą danych (potwierdzenie przy anulowaniu ze zmianami)

### 2.5. Usunięcie Fiszki (poprzez przycisk)

- **Główny cel**: Umożliwienie usuniecia istniejącej fiszki

- **Kluczowe komponenty**:
  - Przyciski "Zatwierdź" i "Anuluj"

### 2.6. Profil Użytkownika (opcjonalnie w MVP)

- **Ścieżka**: `/profile`
- **Główny cel**: Zarządzanie kontem użytkownika
- **Kluczowe informacje**:
  - Podstawowe dane użytkownika
  - Opcje zarządzania kontem
- **Kluczowe komponenty**:
  - Formularz zmiany hasła
  - Przycisk usunięcia konta z modalem potwierdzenia
- **UX i dostępność**:
  - Jasne komunikaty potwierdzenia akcji
  - Dwuetapowe potwierdzenie krytycznych akcji
- **Bezpieczeństwo**:
  - Potwierdzenie aktualnego hasła przy zmianie
  - Dodatkowe potwierdzenie przy usuwaniu konta

## 3. Mapa podróży użytkownika

### 3.1. Główna ścieżka: Generowanie i zapisywanie fiszek

1. **Logowanie**

   - Użytkownik wchodzi na stronę logowania
   - Wprowadza dane logowania
   - Po poprawnym logowaniu jest przekierowany do Generatora Fiszek

2. **Generowanie i recenzja fiszek**

   - Użytkownik wprowadza tekst źródłowy (1000-10000 znaków)
   - Opcjonalnie wybiera model AI
   - Klika przycisk "Generuj"
   - Wyświetla się wskaźnik ładowania
   - Po zakończeniu generowania, pod polem tekstowym wyświetlana jest lista propozycji fiszek
   - Użytkownik przegląda każdą fiszkę i decyduje:
     - Zatwierdzić (przycisk "Zatwierdź")
     - Edytować (przycisk "Edytuj" → otwiera modal edycji)
     - Odrzucić (przycisk "Odrzuć")
   - Po recenzji klika "Zapisz zatwierdzone" lub "Zapisz wszystkie"
   - System zapisuje fiszki i wyświetla komunikat sukcesu
   - Użytkownik może wygenerować nowe fiszki lub przejść do "Moich fiszek"

3. **Przeglądanie zapisanych fiszek**
   - Użytkownik przechodzi do widoku "Moje fiszki"
   - Może przeglądać, wyszukiwać, filtrować i sortować fiszki
   - Może edytować lub usuwać poszczególne fiszki

### 3.2. Alternatywna ścieżka: Ręczne tworzenie fiszki

1. **Przejście do widoku "Moje fiszki"**

   - Użytkownik klika "Moje fiszki" w nawigacji

2. **Dodawanie nowej fiszki**
   - Użytkownik klika "Dodaj fiszkę"
   - Otwiera się modal z pustym formularzem
   - Użytkownik wypełnia pola "Przód" i "Tył"
   - Klika "Zapisz"
   - System zapisuje fiszkę i odświeża listę

## 4. Układ i struktura nawigacji

### 4.1. Główne elementy nawigacji

- **Topbar** (widoczny na wszystkich stronach po zalogowaniu)

  - Logo aplikacji (link do strony głównej/generatora)
  - Link do Generatora Fiszek
  - Link do Moich Fiszek
  - Dropdown z opcjami użytkownika
    - Profil (opcjonalnie w MVP)
    - Wyloguj

- **Nawigacja kontekstowa** (zależna od widoku)
  - W widoku Generatora (podczas recenzji): przyciski "Zapisz wszystkie", "Zapisz zatwierdzone"
  - W widoku Moich fiszek: przyciski paginacji, wyszukiwarka, filtry

### 4.2. Przepływ między widokami

- Z ekranu logowania → Generator Fiszek (po poprawnym logowaniu)
- W ramach Generatora Fiszek: wprowadzanie tekstu → generowanie → recenzja propozycji → zapisywanie
- Z Generatora Fiszek → Moje Fiszki (przez topbar lub po zapisaniu fiszek)
- Z każdego widoku dostęp do Generatora i Moich Fiszek przez topbar
- Modalne komponenty (edycja fiszki, potwierdzenia) nakładają się na aktualny widok

## 5. Kluczowe komponenty

### 5.1. Komponenty nawigacji

- **Topbar** - główny element nawigacyjny z linkami do kluczowych widoków
- **Dropdown Menu** - do wyświetlania opcji użytkownika
- **Pagination** - do nawigacji między stronami w widoku Moich fiszek

### 5.2. Komponenty formularzy

- **TextField** - pola tekstowe z walidacją
- **TextArea** - większe pole tekstowe do wprowadzania treści w generatorze
- **Dropdown** - do wyboru modelu AI i opcji sortowania
- **Button** - przyciski akcji z różnymi wariantami (primary, secondary, danger)
- **CharacterCounter** - licznik znaków z wizualnym wskaźnikiem limitu

### 5.3. Komponenty wyświetlania danych

- **FlashcardCard** - komponent karty fiszki z opcjami akcji
- **SearchBar** - pole wyszukiwania z przyciskiem
- **SortDropdown** - dropdown do wyboru opcji sortowania
- **AIBadge** - ikona/badge wskazująca na źródło fiszki (AI vs. ręczne)

### 5.4. Komponenty informacji zwrotnej

- **Loading** - wskaźnik ładowania podczas operacji asynchronicznych
- **Toast** - komunikaty sukcesu i mniej istotne ostrzeżenia
- **InlineError** - komunikaty błędów krytycznych wyświetlane inline
- **ProgressIndicator** - wskaźnik postępu recenzji fiszek

### 5.5. Komponenty modalne

- **Dialog** - podstawowy komponent modalny
- **EditFlashcardDialog** - modal do edycji fiszki
- **ConfirmationDialog** - modal potwierdzenia dla krytycznych operacji
