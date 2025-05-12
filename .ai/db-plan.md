# Schemat Bazy Danych PostgreSQL - Flashcards Generator

## 1. Tabele i Kolumny

### Tabela: users

Ta tabela jest zarządzana przez Supabase Auth

- id: UUID PRIMARY KEY
- email: VARCHAR(255) NOT NULL UNIQUE
- encrypted_password: TEXT NOT NULL
- created_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- confirmed_at: TIMESTAMP WITH TIME ZONE

### Tabela: flashcards

- id: BIGSERIAL PRIMARY KEY
- front: VARCHAR(200) NOT NULL
- back: VARCHAR(500) NOT NULL
- source: TEXT NOT NULL CHECK (source IN ('manual', 'ai-complete', 'ai-with-updates'))
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- generation_id: BIGINT REFERENCES generations(id) ON DELETE SET NULL
- created_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- updated_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

* Trigger - automatycznie aktualizuje `updated_at` na aktualny czas przy każdej aktualizacji rekordu.

### Tabela: generations

- id: BIGSERIAL PRIMARY KEY
- start_date: TIMESTAMP WITH TIME ZONE NOT NULL
- end_date: TIMESTAMP WITH TIME ZONE
- generation_time: INTERVAL NOT NULL
- user_id: BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
- source_text_hash: TEXT NOT NULL
- source_text_length: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- model: TEXT NOT NULL
- all_count: INTEGER NOT NULL
- ai_complete_count: INTEGER NOT NULL
- ai_with_updates_count: INTEGER NOT NULL

### Tabela: generation_logs

- id: BIGSERIAL PRIMARY KEY
- timestamp: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- user_id: BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
- generation_id: BIGINT NOT NULL REFERENCES generations(id) ON DELETE CASCADE
- error_code: TEXT
- error_message: TEXT
- source_text_hash: TEXT NOT NULL
- source_text_length: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- model: TEXT NOT NULL

## 2. Relacje Między Tabelami

- users (1) --- (N) flashcards
  - (flashcards.user_id -> users.id)
- users (1) --- (N) generations
  - (generations.user_id -> users.id)
- generations (1) --- (N) flashcards
  - (flashcards.generation_id -> generations.id)
- users (1) --- (N) generation_logs
  - (generation_logs.user_id -> users.id)
- generations (1) --- (N) generation_logs
  - (generation_logs.generation_id -> generations.id)
    (opcjonalnie)
- flashcards (1) --- (1) generations
  - (generations.id -> flascards.generation_id)

## 3. Indeksy

- Index na kolumnie user_id w tabeli flashcards
- Index na kolumnie user_id w tabeli generations
- Index na kolumnie user_id w tabeli generation_logs
- Index na kolumnie generation_id w tabeli flashcards

## 4. Zasady PostgreSQL (RLS)

Dla tabel związanych z użytkownikiem (flashcards, generations, generation_logs) wdrożone zostaną polityki RLS, aby ograniczyć dostęp danych tylko do właściciela rekordu. Przykładowa polityka dla tabeli flashcards:

```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_own_flashcards ON flashcards
  USING (user_id = current_setting('supabase.auth.uid')::bigint);
```

Polityki RLS należy analogicznie zastosować do tabel generations oraz generation_logs.

## 5. Dodatkowe Uwagi

- Wszystkie pola dat są typu TIMESTAMP WITH TIME ZONE, co ułatwia zarządzanie strefami czasowymi.
- Domyślne wartości, takie jak `DEFAULT now()`, zapewniają automatyczny zapis znaczników czasowych.
- Ograniczenia (CHECK constraints) dla długości tekstu oraz wartości pola `source` są egzekwowane na poziomie bazy danych.
- Mechanizmy RLS zapewniają, że użytkownik ma dostęp tylko do swoich danych, co jest kluczowe w kontekście Supabase Auth.
- Schemat jest zaprojektowany zgodnie z zasadami normalizacji (do 3NF) oraz najlepszymi praktykami pod kątem wydajności i skalowalności.
