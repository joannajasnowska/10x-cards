# Przewodnik implementacji OpenRouter Service

## 1. Opis usługi

OpenRouter Service to interfejs komunikacyjny umożliwiający integrację aplikacji z API OpenRouter, które zapewnia dostęp do różnych modeli LLM od wielu dostawców (OpenAI, Anthropic, Google itp.). Usługa ta ułatwia konfigurację, wysyłanie zapytań oraz przetwarzanie odpowiedzi z modeli AI z jednolitym interfejsem API.

Główne funkcjonalności usługi:

- Konfiguracja i zarządzanie modelami LLM
- Tworzenie i zarządzanie sesjami czatu
- Formatowanie komunikatów (system, user)
- Obsługa ustrukturyzowanych odpowiedzi (response_format)
- Zarządzanie parametrami modeli
- Kompleksowa obsługa błędów

## 2. Opis konstruktora

```typescript
class OpenRouterService {
  constructor(
    apiKey: string,
    config?: {
      defaultModel?: string;
      baseUrl?: string;
      defaultParameters?: ModelParameters;
      timeout?: number;
    }
  ) {
    // Inicjalizacja usługi z kluczem API i opcjonalną konfiguracją
  }
}
```

Parametry:

- `apiKey` (wymagany): Klucz API do OpenRouter
- `config` (opcjonalny): Obiekt konfiguracyjny zawierający:
  - `defaultModel`: Domyślny model do używania (np. "anthropic/claude-3-sonnet")
  - `baseUrl`: Niestandardowy URL bazowy API (domyślnie "https://openrouter.ai/api/v1")
  - `defaultParameters`: Domyślne parametry dla wszystkich wywołań modeli
  - `timeout`: Limit czasu dla żądań HTTP w milisekundach

## 3. Publiczne metody i pola

### 3.1 Zarządzanie modelami

```typescript
// Pobieranie dostępnych modeli
async getAvailableModels(): Promise<Model[]>

// Ustawienie aktywnego modelu
setModel(modelId: string): void

// Wybór modelu na podstawie możliwości
async selectModelByCapability(
  capabilities: {
    streaming?: boolean;
    jsonOutput?: boolean;
    contextLength?: number;
    minTokens?: number;
  }
): Promise<Model>
```

### 3.2 Wysyłanie wiadomości

```typescript
// Wysłanie wiadomości i otrzymanie odpowiedzi
async sendMessage(
  message: string,
  options?: {
    model?: string;
    parameters?: ModelParameters;
    responseFormat?: ResponseFormat;
  }
): Promise<CompletionResponse>


```

### 3.4 Zarządzanie kontekstem systemowym i użytkownika

```typescript
// Ustawienie komunikatu systemowego dla konwersacji
setSystemMessage(
  systemMessage: string
): void

// Dodanie wiadomości użytkownika do konwersacji (bez odpowiedzi modelu)
addUserMessage(
  content: string
): void

```

### 3.5 Zarządzanie formatami odpowiedzi

```typescript
// Tworzenie schematu JSON do formatowania odpowiedzi
createJsonSchema(
  schemaName: string,
  schema: object,
  strict: boolean = true
): ResponseFormat

// Weryfikacja odpowiedzi zgodnie ze schematem
validateResponse(
  response: any,
  schema: ResponseFormat
): { valid: boolean; errors?: string[] }
```

### 3.6 Konfiguracja parametrów modelu

```typescript
// Ustawienie globalnych parametrów dla wszystkich wywołań
setGlobalParameters(parameters: ModelParameters): void

// Dodanie predefiniowanego zestawu parametrów do użycia później
addParameterPreset(
  presetName: string,
  parameters: ModelParameters
): void

// Uzyskanie parametrów z presetu
getParameterPreset(presetName: string): ModelParameters
```

## 4. Prywatne metody i pola

```typescript
// Główna metoda wysyłająca żądanie do API OpenRouter
private async _sendRequest(
  endpoint: string,
  payload: any,
  options?: RequestOptions
): Promise<any>

// Funkcja przygotowująca pełny kontekst konwersacji
private _prepareConversationContext(
  conversationId: string,
  maxTokens?: number
): Message[]

// Funkcja do obsługi odpowiedzi strumieniowej
private _handleStreamResponse(
  response: Response,
  onChunk: (chunk: CompletionChunk) => void
): Promise<CompletionResponse>

// Funkcja do formatowania wiadomości do formatu OpenRouter
private _formatMessages(messages: Message[]): OpenRouterMessage[]

// Funkcja do śledzenia użycia tokenów
private _trackTokenUsage(
  prompt: string,
  response: string,
  model: string
): void
```

## 5. Obsługa błędów

Usługa powinna implementować kompleksowy system obsługi błędów, który wykrywa i obsługuje następujące scenariusze:

### 5.1 Kategorie błędów

```typescript
enum ErrorCategory {
  AUTHENTICATION = "authentication",
  VALIDATION = "validation",
  RATE_LIMIT = "rate_limit",
  MODEL = "model",
  NETWORK = "network",
  RESPONSE = "response",
  INTERNAL = "internal",
}

class OpenRouterServiceError extends Error {
  category: ErrorCategory;
  statusCode?: number;
  retryable: boolean;
  details?: any;

  constructor(
    message: string,
    category: ErrorCategory,
    options?: {
      statusCode?: number;
      retryable?: boolean;
      details?: any;
    }
  ) {
    super(message);
    this.name = "OpenRouterServiceError";
    this.category = category;
    this.statusCode = options?.statusCode;
    this.retryable = options?.retryable ?? false;
    this.details = options?.details;
  }
}
```

### 5.2 Strategia obsługi błędów

1. **Błędy uwierzytelniania**

   - Weryfikacja klucza API przed każdym żądaniem
   - Automatyczne rozpoznawanie wygaśnięcia lub nieprawidłowości klucza

2. **Błędy walidacji**

   - Walidacja schematów JSON dla response_format

3. **Ograniczenia szybkości i limity**

   - Implementacja strategii ponownych prób z wykładniczym odczekiwaniem
   - Monitorowanie użycia i ostrzeganie o zbliżających się limitach

4. **Błędy specyficzne dla modeli**

   - Obsługa filtrowania treści i przekroczenia długości kontekstu
   - Fallback do alternatywnych modeli, gdy to możliwe

5. **Błędy sieciowe**

   - Automatyczne ponowne próby dla przejściowych błędów sieciowych
   - Wykrywanie i raportowanie przestojów usługi

6. **Błędy przetwarzania odpowiedzi**
   - Graceful handling of malformed responses
   - Dostarczanie częściowych wyników, gdy to możliwe

## 6. Kwestie bezpieczeństwa

### 6.1 Zarządzanie kluczami API

- Nigdy nie hardkoduj kluczy API w kodzie źródłowym
- Przechowuj klucze API w zmiennych środowiskowych
- Zapewnij możliwość rotacji kluczy API bez ponownego wdrażania

```typescript
// Przykład bezpiecznego ładowania klucza API
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  throw new Error("Brak klucza API OpenRouter. Ustaw OPENROUTER_API_KEY w zmiennych środowiskowych.");
}
const openRouterService = new OpenRouterService(apiKey);
```

### 6.2 Filtrowanie danych wrażliwych

- Implementuj mechanizm sanityzacji danych wejściowych
- Nigdy nie loguj pełnych wiadomości zawierających potencjalnie wrażliwe dane
- Sanityzuj dane wyjściowe przed zapisaniem ich w bazie danych lub logach

### 6.3 Kontrola dostępu

- Zaimplementuj mechanizm zarządzania dostępem do poszczególnych modeli
- Ogranicz dostęp do kosztownych modeli dla określonych użytkowników
- Monitoruj i zapisuj użycie pod kątem potencjalnego nadużycia

## 7. Plan wdrożenia krok po kroku

### 7.1 Konfiguracja projektu

1. Utworzenie nowego katalogu `src/lib/openrouter` zgodnie ze strukturą projektu
2. Instalacja wymaganych zależności

```bash
npm install openrouter-api axios zod
```

### 7.2 Implementacja klas usługi

1. Utworzenie pliku `src/lib/openrouter/types.ts` z definicjami typów
2. Implementacja głównej klasy usługi w `src/lib/openrouter/service.ts`
3. Implementacja klasy konwersacji w `src/lib/openrouter/conversation.ts`
4. Implementacja obsługi błędów w `src/lib/openrouter/errors.ts`

### 7.3 Implementacja integracji z API OpenRouter

1. Utworzenie klasy klienta API w `src/lib/openrouter/api-client.ts`
2. Implementacja metod do komunikacji z różnymi endpointami API
3. Dodanie obsługi strumieniowania odpowiedzi

### 7.4 Implementacja systemu formatowania odpowiedzi

1. Utworzenie zarządcy formatów odpowiedzi w `src/lib/openrouter/response-format.ts`
2. Implementacja generatorów schematów JSON
3. Dodanie funkcji walidacji odpowiedzi

### 7.5 Dodanie obsługi parametrów modelu

1. Utworzenie pliku `src/lib/openrouter/model-parameters.ts`
2. Implementacja presetów parametrów dla różnych przypadków użycia
3. Dodanie walidacji parametrów specyficznych dla modelu

### 7.6 Implementacja punktu końcowego Astro API

1. Utworzenie punktu końcowego w `src/pages/api/chat.ts`
2. Dodanie obsługi autoryzacji i walidacji żądań

```typescript
// src/pages/api/chat.ts
import type { APIRoute } from "astro";
import { OpenRouterService } from "@/lib/openrouter/service";

export const POST: APIRoute = async ({ request, env }) => {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await request.json();
    const { message, options } = data;

    const openRouter = new OpenRouterService(apiKey);

    // Obsługa standardowej odpowiedzi
    const response = await openRouter.sendMessage(message, options);

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: error.statusCode || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
```

### 7.8 Implementacja zaawansowanych funkcji

1. **Obsługa ustrukturyzowanych odpowiedzi:**

```typescript
// Przykład ustrukturyzowanej odpowiedzi (response_format)
const responseFormat = {
  type: "json_schema",
  json_schema: {
    name: "article_summary",
    strict: true,
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        keyPoints: {
          type: "array",
          items: { type: "string" },
        },
        sentiment: {
          type: "string",
          enum: ["positive", "neutral", "negative"],
        },
      },
      required: ["title", "summary", "keyPoints", "sentiment"],
    },
  },
};
```

## Podsumowanie

Plan ten dostarcza kompleksowy przewodnik do implementacji usługi OpenRouter, zgodny z określonym stackiem technologicznym i najlepszymi praktykami. Usługa ta zapewni elastyczny dostęp do różnych modeli LLM, z odpowiednią obsługą błędów, bezpieczeństwem i optymalizacją kosztów.

Pamiętaj, aby regularnie monitorować zmiany w API OpenRouter i aktualizować usługę w miarę potrzeby. Ciągłe testowanie i optymalizacja będą kluczowe dla zapewnienia niezawodności i efektywności kosztowej rozwiązania.
