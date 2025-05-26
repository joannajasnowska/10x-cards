# Dokument wymagań produktu (PRD) - Flashcards Generator

## 1. Przegląd produktu

Flashcards Generator jest webową aplikacją dedykowaną ułatwieniu nauki poprzez automatyczne generowanie fiszek edukacyjnych przy użyciu LLM. System umożliwia zarówno generowanie fiszek na podstawie wprowadzonego tekstu, jak i ręczne tworzenie, przeglądanie, edycję oraz usuwanie zapisanych fiszek. Zapewnia prosty interfejs użytkownika oraz bezpieczny system kont z podstawowymi operacjami, takimi jak edycja hasła i usuwanie konta.

## 2. Problem użytkownika

Użytkownicy edukacyjni często napotykają problem czasochłonnego tworzenia wysokiej jakości fiszek, co jest kluczowym narzędziem w nauce metodą spaced repetition. Ręczne przygotowywanie fiszek wymaga dużego nakładu pracy, co zniechęca do regularnej nauki i utrudnia skupienie się na przyswajaniu wiedzy.

## 3. Wymagania funkcjonalne

- System generowania fiszek przez AI na podstawie wprowadzonego przez użytkownika metodą kopiuj-wklej tekstu, gdzie tekst musi mieścić się w przedziale 1000 do 10 000 znaków.
- Aplikacja wysyła do modelu LLM za pośrednictwem API
- Model LLM proponuje zestaw fiszek (pytanie - odpowiedź), przy czym pole "przód" każdej fiszki jest ograniczone do 200 znaków, a pole "tył" do 500 znaków.
- Fiszki są przedstawione użytkownikowi w formie listy z możliwością akceptacji, edycji lub odrzucenia
- Możliwość ręcznego tworzenia, edycji i usuwania fiszek
- Przeglądanie zapisanych fiszek z zaimplementowaną wyszukiwarką, paginacją i edycją przez modal.
- Podstawowy system uwierzytelniania i zarzadzania kontami użytkowniów, obejmujący rejestrację, logowanie, edycję hasła oraz usuwanie konta
- Automatyczna walidacja na poziomie frontendu, backendu i bazy danych dotycząca długości tekstu wejściowego oraz pól fiszek.
- Zapewnienie mechanizmu przypisywania fiszek do harmonogramu powtórek - integracja z biblioteką open-source implementującą gotowy algorytm powtórek.
- Przechowywanie logów generowanych przez AI w dedykowanej tabeli bazy danych.
- Dane o fiszkach przechowywane są w sposób zapenwniający skalowalność i bezpieczeństwo
- Dane osobowe użytkowników i fiszek przechowywane są zgodnie z RODO

## 4. Granice produktu

- Brak implementacji zaawansowanego algorytmu powtórek (np. SuperMemo, Anki); wykorzystana zostanie gotowa biblioteka open-source.
- Brak wsparcia dla importu różnych formatów (PDF, DOCX itd.).
- System nie umożliwia współdzielenia zestawów fiszek między użytkownikami.
- Brak integracji z innymi platformami edukacyjnymi.
- Aplikacja będzie dostępna wyłącznie jako aplikacja webowa, bez natychmiastowych wersji mobilnych.
- Historia zmian fiszek nie jest przechowywana – zapisywany jest wyłącznie finalny stan zaakceptowanych fiszek.
- Brak możliwości cofnięcia ostatnich działań.
- Brak publicznego api

## 5. Historyjki użytkowników

ID: US-001
Tytuł: Rejestracja konta
Opis: Jako nowy użytkownik chcę się zarejestrować, aby mieć dostęp do własnych fiszek i móc korzystać z generowania fiszek przez AI.
Kryteria akceptacji:

- Formularz rejestracyjny zawiera pola na adres e-mail i hasło.
- Po poprawnym wypełnieniu formularza i weryfikacji danych konto jest aktywowane.
- Użytkownik otrzymuje potwierdzenie pomyślnej rejestracji i zostaje zalogowany.

ID: US-002
Tytuł: Logowanie do aplikacji
Opis: Jako zarejestrowany użytkownik chcę móc się zalogować, aby mieć dostęp do moich fiszek i historii generowania.
Kryteria akceptacji:

- Po podaniu prawidłowych danych logowania użytkownik zostaje przekierowany do widoku generowania fiszek.
- Błędne dane logowania wyświetlają komunikat o nieprawidłowych danych.
- Dane dotyczące logowania przechowywane są w bezpieczny sposób.

ID: US-003
Tytuł: Generowanie fiszek przy użyciu AI
Opis: Jako zalogowany użytkownik chcę wkleić kawałek tekstu i za pomocą przycisku wygenerować propozycje fiszek, aby zaoszczędzić czas na ręcznym tworzeniu pytań i odpowiedzi.
Kryteria akceptacji:

- W widoku generowania fiszek znajduje się pole tekstowe, w którym użytkownik może wkleić swój tekst.
- Pole tekstowe oczekuje od 1000 do 10 000 znaków.
- Po kliknięciu przycisku generowania aplikacja komunikuje się z API modelu LLM i wyświetla listę wygenerowanych propozycji fiszek do akceptacji przez użytkownika.
- W przypadku problemów z API lub braku odpowiedzi modelu użytkownik zobaczy stosowny komunikat o błędzie.

ID: US-004
Tytuł: Przegląd i zatwierdzanie propozycji fiszek
Opis: Jako zalogowany użytkownik chcę móc przeglądać wygenerowane fiszki i decydować, które z nich chcę dodać do mojego zestawu, aby zachować tylko przydatne pytania i odpowiedzi.
Kryteria akceptacji:

- Lista wygenerowanych fiszek jest wyświetlana pod formularzem generowania.
- Przy każdej fiszce znajduje się przycisk pozwalający na jej zatwierdzenie, edycję lub odrzucenie.
- Po zatwierdzeniu wybranych fiszek użytkownik może kliknąć przycisk zapisu i dodać je do bazy danych.

ID: US-005
Tytuł: Edycja fiszek utworzonych ręcznie i generowanych przez AI
Opis: Jako zalogowany użytkownik chcę edytować stworzone lub wygenerowane fiszki, aby poprawić ewentualne błędy lub dostosować pytania i odpowiedzi do własnych potrzeb.
Kryteria akceptacji:

- Istnieje lista zapisanych fiszek (zarówno ręcznie tworzonych, jak i zatwierdzonych wygenerowanych).
- Każdą fiszkę można kliknąć i wejść w tryb edycji.
- Zmiany są zapisywane w bazie danych po zatwierdzeniu.

ID: US-006
Tytuł: Usuwanie fiszek
Opis: Jako zalogowany użytkownik chcę usuwać zbędne fiszki, aby zachować porządek w moim zestawie.
Kryteria akceptacji:

- Przy każdej fiszce na liście (w widoku "Moje fiszki") widoczna jest opcja usunięcia.
- Po wybraniu usuwania użytkownik musi potwierdzić operację, zanim fiszka zostanie trwale usunięta.
- Fiszki zostają trwale usunięte z bazy danych po potwierdzeniu.

ID: US-007
Tytuł: Ręczne tworzenie fiszek
Opis: Jako zalogowany użytkownik chcę ręcznie stworzyć fiszkę (określając przód i tył fiszki), aby dodawać własny materiał, który nie pochodzi z automatycznie generowanych treści.
Kryteria akceptacji:

- W widoku "Moje fiszki" znajduje się przycisk dodania nowej fiszki.
- Naciśnięcie przycisku otwiera formularz z polami "Przód" i "Tył".
- Po zapisaniu nowa fiszka pojawia się na liście.

ID: US-008
Tytuł: Sesja nauki z algorytmem powtórek
Opis: Jako zalogowany użytkownik chcę, aby dodane fiszki były dostępne w widoku "Sesja nauki" opartym na zewnętrznym algorytmie, aby móc efektywnie się uczyć (spaced repetition).
Kryteria akceptacji:

- W widoku "Sesja nauki" algorytm przygotowuje dla mnie sesję nauki fiszek
- Na start wyświetlany jest przód fiszki, poprzez interakcję użytkownik wyświetla jej tył
- Użytkownik ocenia zgodnie z oczekiwaniami algorytmu na ile przyswoił fiszkę
- Następnie algorytm pokazuje kolejną fiszkę w ramach sesji nauki

- Tylko zalogowany użytkownik może wyświetlać, edytować i usuwać swoje fiszki.
- Nie ma dostępu do fiszek innych użytkowników ani możliwości współdzielenia.

ID: US-009
Tytuł: Bezpieczny dostęp i uwierzytelnianie
Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych. Chcę mieć pewność, że moje fiszki nie są dostępne dla innych użytkowników
Kryteria akceptacji:

- Logowanie i rejestracja odbywają się na dedykowanych stronach.
- Logowanie wymaga podania adresu email i hasła.
- Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
- Użytkownik NIE MOŻE korzystać z funckji generowania i akceptacji/odrzucania/edycji fiszek bez logowania się do systemu (US-003, US-004, US-005, US-006, 007).
- Użytkownik NIE MOŻE korzystać z widoków Generator
- Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
- Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
- Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
- Odzyskiwanie hasła powinno być możliwe.

ID: US-010

- Tytuł: Edycja hasła
  Opis: Jako zalogowany użytkownik chcę mieć możliwość zmiany hasła, aby zapewnić bezpieczeństwo moich danych.
  Kryteria akceptacji:
- Użytkownik może zmienić hasło w ustawieniach konta (przycisk Profil) - Po kliknięciu w przycisk "Zmień hasło" otwiera się formularz z polami "Stare hasło", "Nowe hasło" i "Potwierdź nowe hasło".

## 6. Metryki sukcesu

- Minimum 75% wygenerowanych przez AI fiszek musi być zaakceptowanych przez użytkowników.
- Co najmniej 75% fiszek tworzonych przez użytkowników powinno pochodzić z funkcji generowania fiszek przez AI.
- System musi zapewniać płynne działanie interfejsu podczas generowania, recenzji oraz zapisu fiszek.
- Walidacja danych musi być zgodna z wymaganiami (limity długości, komunikaty błędów).
- Wysoki poziom zadowolenia użytkowników, mierzony pozytywnymi opiniami oraz niskim wskaźnikiem błędów w interakcji z systemem.
