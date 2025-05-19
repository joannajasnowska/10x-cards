# Plan wdrożenia usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter umożliwia integrację z interfejsem API OpenRouter w celu automatycznego generowania odpowiedzi na podstawie kombinacji komunikatów systemowych oraz użytkownika Dzięki tej usłudze możliwe jest dynamiczne przesyłanie komunikatów systemowych i użytkowników, przetwarzanie odpowiedzi w ustrukturyzowanym formacie JSON oraz konfigurowanie modelu oraz jego parametrów. Usługa jest projektowana zgodnie z najlepszymi praktykami bezpieczeństwa, walidacji danych (Zod) oraz integracji z Supabase zgodnie z zasadami backend.mdc i shared.mdc.

## 2. Opis konstruktora

Konstruktor serwisu OpenRouter inicjalizuje połączenie z API OpenRouter poprzez utworzenie dedykowanego klienta. W konstruktorze definiowane są podstawowe ustawienia, takie jak:

- konfiguracja API (np. endpoint, klucz API)
- Nazwa modelu (np. "gpt-4")
- Domyślne parametry modelu (np. temperature, max_tokens, top_p)
- Wstępne komunikaty systemowe (role: 'system') oraz użytkownika (role: 'user').
- Opcjonalne parametry inicjalizacyjne (np. timeout, retries).
  Dodatkowo konstruktor odpowiada za walidację konfiguracji przy użyciu Zod oraz ustawienie mechanizmów centralnej obsługi błędów.

## 3. Publiczne metody i pola

**Metody:**

1. `sendChatRequest(message: string): Promise<Response>`  
   Wysyła żądanie użytkownika do API OpenRouter, wykorzystując przygotowany payload i zwracając odpowiedź.
2. `setSystemMessage(message: string): void`
   Umożliwia ustawienie komunikatu systemowego.
3. `setUserMessage(message: string): void`
   Umożliwia ustawienie komunikatu użytkownika.
4. `setModelConfig(name: string, config: ModelConfig): void`  
    Umożliwia wybór nazwy modelu oraz parametrów modelu w locie. 4.`getDefaultResponseFormat(schema: JSONSchema)`  
    Zwraca domyślny schemat ustrukturyzowanej odpowiedzi (response_format), zgodny ze wzorem:
   ```
   { type: 'json_schema', json_schema: { name: 'chat_response', strict: true, schema: { message: 'string', tokens: 'number' } } }
   ```

**Pola:**

1. `modelName: string` – nazwa modelu używanego do przetwarzania wiadomości.
2. `modelParameters: ModelParameters` – obiekt przechowujący parametry modelu, np. `{ temperature: 0.7, max_tokens: 256, top_p: 1.0 }`.
3. `systemMessage: string` – stały komunikat systemowy używany przy budowaniu zapytań (np. "System: Utrzymaj spójność konwersacji i zapewnij logiczną odpowiedź.").

## 4. Prywatne metody i pola

**Metody:**

1. `buildRequestPayload(userMessage: string): RequestPayload`  
   Buduje ładunek zapytania, łącząc komunikat systemowy, komunikat użytkownika oraz ustrukturyzowany format odpowiedzi.
2. `executeRequest(requestPayload: RequestPayload): Promise`
   Realizuje wywołanie HTTP do API OpenRouter, zarządza retry oraz parsowaniem odpowiedzi.
3. `handleError(error: any): void`  
   Centralizuje obsługę błędów – loguje błąd oraz przetwarza go do standardowego formatu.

**Pola:**

1. `apiClient: ApiClient` – instancja odpowiedzialna za komunikację z API OpenRouter.
2. `zodSchemas` – zestaw schematów walidacyjnych (Zod) dla payloadu i odpowiedzi.
3. Prywatne pola przechowujące bieżącą konfigurację: currentSystemMessage, currentUserMessage, currentResponseFormat, currentModelName oraz currentModelParameters.

## 5. Obsługa błędów

**Potencjalne scenariusze błędów:**

1. Błąd połączenia (Network Error) – utrata połączenia, timeout lub problemy z siecią.
2. Błąd walidacji danych – niezgodność ładunku lub odpowiedzi z zdefiniowanym schematem.
3. Błąd autoryzacji – niewłaściwe lub wygasłe klucze API.
4. Błąd formatu odpowiedzi – API zwraca niestrukturyzowaną lub nieoczekiwaną odpowiedź.

**Proponowane rozwiązania:**

1. Implementacja mechanizmu ponownych prób (retry logic) z exponential backoff w przypadku błędów sieciowych.
2. Stosowanie walidacji za pomocą Zod
3. Bezpieczne przechowywanie i zarządzanie kluczami API poprzez zmienne środowiskowe i context.locals.supabase.
4. Centralne logowanie błędów i ich filtrowanie, aby uniknąć ujawniania wrażliwych informacji.

## 6. Kwestie bezpieczeństwa

1. Przechowywanie kluczy API oraz innych wrażliwych danych w zmiennych środowiskowych, bez zapisywania ich bezpośrednio w kodzie.
2. Walidacja wszystkich danych przychodzących i wychodzących przy użyciu Zod.
3. Wykorzystanie kontekstu Supabase (`context.locals.supabase`) do autoryzacji i uwierzytelniania żądań.
4. Minimalizacja ekspozycji szczegółowych informacji o błędach – stosowanie przyjaznych dla użytkownika komunikatów.
5. Stosowanie najlepszych praktyk w zakresie ochrony przed atakami, np. injection, oraz regularne audyty bezpieczeństwa.

## 7. Plan wdrożenia krok po kroku

1. **Przygotowanie środowiska:**

   - Skonfigurowanie zmiennych środowiskowych (np. API_KEY, MODEL_CONFIG) oraz ustawienie dostępu do Supabase zgodnie z zasadami backend.mdc.
   - Aktualizacja konfiguracji projektu Astro, aby zapewnić poprawną integrację z backendem.

2. **Implementacja klienta API OpenRouter:**

   - Utworzenie modułu w `src/lib/openrouterService.ts` dedykowanego komunikacji z API using fetch z uwzględnieniem obsługi błędów.

3. **Implementacja konstruktora usługi:**

   - Zdefiniowanie klasy `OpenRouterService` z konstruktorem inicjującym instancję klienta, ustawiającym domyślne parametry i walidującym konfigurację z Zod.

4. **Budowanie payloadu:**

   - Implementacja metody `buildRequestPayload`, która łączy następujące elementy:
     1. Komunikat systemowy (np. "System: Utrzymaj spójność konwersacji i zapewnij logiczną odpowiedź.")
     2. Komunikat użytkownika (np. "User: Jak mogę zresetować hasło?")
     3. Ustrukturyzowany `response_format` zgodny z wzorem:
        ```
        { type: 'json_schema', json_schema: { name: 'chat_response', strict: true, schema: { message: 'string', tokens: 'number' } } }
        ```
     4. Nazwę modelu (np. "gpt-4")
     5. Parametry modelu (np. `{ temperature: 0.7, max_tokens: 256, top_p: 1.0 }`)

5. **Parsowanie odpowiedzi:**

   - Implementacja metody `parseApiResponse` przy użyciu Zod do walidacji struktury otrzymanej odpowiedzi.

6. **Obsługa błędów:**
   - Implementacja centralnej metody `handleError` do przetwarzania i logowania błędów.
   - Dodanie mechanizmów ponownych prób w przypadkach błędów sieciowych lub walidacyjnych.
