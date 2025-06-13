# Specyfikacja modułu autentykacji i zarządzania kontem

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Struktura stron i layoutów

- **Strony Astro:**

  - `/login` – Strona logowania zawierająca formularz logowania.
  - `/register` – Strona rejestracji z formularzem rejestracyjnym.

- **Layouty:**
  - `PublicLayout` – Layout dla użytkowników anonimowych (strony takie jak logowanie, rejestracja). Brak elementów specyficznych dla autoryzacji.
  - `PrivateLayout` – Layout dla użytkowników zalogowanych, zawierający elementy nawigacyjne (przycisk wylogowania, profil użytkownika) oraz dodatkowe zabezpieczenia przy użyciu middleware.

### Komponenty i formularze (Client-side React)

- **Formularze uwierzytelniania:**

  - `LoginForm` – Komponent odpowiedzialny za logowanie; zawiera pola: email, hasło oraz przycisk submit.
  - `RegisterForm` – Komponent obsługujący rejestrację; zawiera pola: email, hasło, potwierdzenie hasła.

- **Walidacja i komunikaty błędów:**
  - Walidacja na poziomie frontendu (sprawdzanie formatu email, minimalnej długości hasła, zgodności haseł w rejestracji).
  - Dynamiczne wyświetlanie komunikatów o błędach: np. niepoprawny format email, niedopasowanie haseł, błędy zwracane przez backend (np. błędne dane logowania).

### Integracja z backendem i nawigacją

- Formularze będą wysyłały zapytania do odpowiednich endpointów API (np. `/api/auth/login`, `/api/auth/signup`) przy użyciu fetch lub innej biblioteki HTTP (np. axios).
- Po udanej operacji (rejestracja/logowanie) użytkownik zostanie przekierowany do strony głównej lub dashboardu.
- Utrzymywanie stanu sesji na froncie (przechowywanie tokena w ciasteczkach lub w kontekście aplikacji) będzie kluczowe dla zarządzania widokami auth i non-auth.

## 2. LOGIKA BACKENDOWA

### Struktura endpointów API i modele danych

- **Endpointy API (lokalizacja: `src/pages/api/auth`):**

  - `POST /api/auth/signup` – Rejestracja użytkownika. Przyjmuje dane: email oraz hasło. Wykorzystuje metodę Supabase `signUp`.
  - `POST /api/auth/login` – Logowanie użytkownika. Przyjmuje dane: email, hasło. Zwraca token sesji lub odpowiedni komunikat błędu.
  - `POST /api/auth/logout` – Wylogowanie użytkownika; czyści sesję poprzez `signOut`.

- **Modele danych:**
  - Model użytkownika zgodny z danymi zwracanymi przez Supabase Auth.
  - Model sesji zawierający token JWT oraz informacje o sesji użytkownika.

### Walidacja danych i obsługa wyjątków

- Stosowanie walidacji danych wejściowych (np. przy użyciu bibliotek Zod lub Yup) zarówno w warstwie API, jak i przy renderowaniu stron.
- Sprawdzanie warunków wstępnych:
  - Poprawność formatu email
  - Minimalna długość hasła oraz zgodność potwierdzenia hasła
- Obsługa wyjątków:
  - Przechwytywanie błędów zwracanych przez Supabase (np. duplikacja konta, błędy autentykacji).
  - Rejestrowanie błędów i zwracanie stosownych statusów HTTP (400, 401, 500) wraz z czytelnymi komunikatami.

### Aktualizacja renderowania stron server-side

- Wykorzystanie Astro server-side rendering do dynamicznego wstrzykiwania danych (np. komunikatów o błędach) do widoków.
- Konfiguracja `astro.config.mjs` oraz middleware (`src/middleware/index.ts`) zostanie rozszerzona o kontrolę autoryzacji, umożliwiając dostęp do stron prywatnych tylko zalogowanym użytkownikom.

## 3. SYSTEM AUTENTYKACJI

### Integracja z Supabase Auth

- **Inicjalizacja:**

  - Utworzenie instancji SupabaseClient w pliku `src/db/supabaseClient.ts` do komunikacji z API Supabase.

- **Procesy autentykacyjne:**
  - **Rejestracja:**
    - Endpoint `/api/auth/signup` wywołuje `supabase.auth.signUp` z danymi: email i hasło. Następnie wysyłany jest e-mail weryfikacyjny do użytkownika.
  - **Logowanie:**
    - Endpoint `/api/auth/login` korzysta z `supabase.auth.signIn` (lub `signInWithPassword`) w celu autoryzacji, a w odpowiedzi zwraca token sesji.
  - **Wylogowanie:**
    - Endpoint `/api/auth/logout` wywołuje metodę `supabase.auth.signOut`, usuwając sesję użytkownika.

### Bezpieczeństwo i middleware

- Zapewnienie dostępu do stron prywatnych poprzez middleware w Astro, które weryfikuje ważność sesji (na podstawie ciasteczek lub tokena JWT).
- Dodatkowe sprawdzanie uprawnień w endpointach API, aby chronić dane użytkowników.

## Podsumowanie

Implementacja modułu autentykacji w oparciu o Supabase Auth integruje frontend (Astro + React) z backendowymi endpointami API, zapewniając spójną architekturę oraz zgodność z wymaganiami funkcjonalnymi i bezpieczeństwa określonymi w dokumencie PRD.

Kluczowe komponenty rozwiązania:

- Astro pages dla procesów logowania, rejestracji.
- React komponenty (`LoginForm`, `RegisterForm`) odpowiedzialne za interaktywną walidację i obsługę formularzy.
- Dedykowane endpointy API w `src/pages/api/auth` do komunikacji z Supabase Auth.
- Middleware oraz konfiguracja server-side renderingu do ochrony tras wymagających autentykacji.

To rozwiązanie zapewnia bezpieczeństwo, czytelność kodu oraz łatwą rozbudowę modułu autentykacji w przyszłości, pozostając zgodnym z istniejącą architekturą aplikacji i wzorcami projektowymi stosowanymi w projekcie.
