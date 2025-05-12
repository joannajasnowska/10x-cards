# REST API Plan

## 1. Resources

- **Users** (managed by Supabase Auth)
- **Flashcards** (table: flashcards)
- **Generations** (table: generations)
- **Generation Logs** (table: generation_logs)

## 2. Endpoints

### 2.1 Flashcards

#### List Flashcards

- **Method:** GET
- **URL:** `/api/flashcards`
- **Description:** Retrieves a paginated list of flashcards belonging to the authenticated user.
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
  - `sort` (optional, e.g., by `created_at`)
  - `filter` (optional, e.g., search query against `front` or `back`)
  - `order` (optional, `asc` or `desc`, default: `desc` for `created_at` field)
- **Validation:**
  - No request body validation required.
  - Query parameters are validated: `page` and `limit` must be positive integers; if provided, `order` must be either `asc` or `desc`.
- **Response Example:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "Question text",
        "back": "Answer text",
        "source": "manual",
        "generation_id": null,
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50
    }
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized, 500 Internal Server Error

#### Retrieve a Single Flashcard

- **Method:** GET
- **URL:** `/api/flashcards/{id}`
- **Description:** Retrieves details of a specific flashcard.
- **URL Parameter:**
  - `id`: Flashcard ID
- **Validation:**
  - The `id` must be a valid integer and correspond to an existing flashcard record.
- **Response:** Flashcard JSON object.
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized, 404 Not Found

#### Create Flashcards

- **Method:** POST
- **URL:** `/api/flashcards`
- **Description:** Creates one or more flashcards. Can be used for both manual creation and AI-generated flashcards.
- **Request Payload:**
  ```json
  {
    "flashcards": [
      {
        "front": "What is the capital of France?",
        "back": "Paris",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "Define photosynthesis.",
        "back": "Process by which green plants convert light energy into chemical energy.",
        "source": "ai-complete",
        "model": "gpt-3.5-turbo",
        "generation_id": "gen-123"
      }
    ]
  }
  ```
- **Validation:**
  - The payload must include a non-empty `flashcards` array.
  - Each flashcard must have non-empty `front`, `back`, and `source` fields.
  - The `front` value must not exceed 200 characters.
  - The `back` value must not exceed 500 characters.
  - The `source` field must be one of the allowed values: `manual`, `ai-complete`, or `ai-with-updates`.
  - If `source` is `manual`, any provided `generation_id` must be `null`.
  - If `source` is `ai-complete` or `ai-with-updates`, the `model` field must be present and valid.
- **Response Example:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "What is the capital of France?",
        "back": "Paris",
        "source": "manual",
        "generation_id": null,
        "created_at": "2023-10-10T12:00:00Z",
        "updated_at": "2023-10-10T12:00:00Z"
      },
      {
        "id": 2,
        "front": "Define photosynthesis.",
        "back": "Process by which green plants convert light energy into chemical energy.",
        "source": "ai-complete",
        "generation_id": "gen-456",
        "created_at": "2023-10-10T12:05:00Z",
        "updated_at": "2023-10-10T12:05:00Z"
      }
    ]
  }
  ```
- **Success Codes:** 201 Created
- **Error Codes:** 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

#### Update a Flashcard

- **Method:** PUT
- **URL:** `/api/flashcards/{id}`
- **Description:** Updates an existing flashcard.
- **URL Parameter:**
  - `id`: Flashcard ID
- **Request Payload:**
  ```json
  {
    "front": "Updated question text",
    "back": "Updated answer text",
    "source": "manual"
  }
  ```
- **Validation:**
  - The flashcard ID in the URL must be valid and correspond to an existing record.
  - The payload must include at least one updatable field.
  - If provided, the `front` value must not exceed 200 characters and the `back` value must not exceed 500 characters.
  - If provided, the `source` field must be one of the allowed values: `manual`, or `ai-with-updates`.
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found

#### Delete a Flashcard

- **Method:** DELETE
- **URL:** `/api/flashcards/{id}`
- **Description:** Deletes a specific flashcard.
- **URL Parameter:**
  - `id`: Flashcard ID
- **Validation:**
  - The flashcard ID must be valid and correspond to an existing flashcard record.
- **Success Codes:** 204 No Content
- **Error Codes:** 401 Unauthorized, 404 Not Found

### 2.2 Generations (AI Flashcard Generation)

#### Initiate Flashcard Generation

- **Method:** POST
- **URL:** `/api/generations`
- **Description:** Submits source text for AI-based flashcard proposals generation.
- **Request Payload:**
  ```json
  {
    "source_text": "Input text between 1000 and 10000 characters",
    "model": "selected_model_identifier"
  }
  ```
- **Validation:**
  - The `source_text` must be a string with a length between 1000 and 10000 characters, as per the DB schema check.
  - If provided, the `model` field must be a valid, non-empty string.
- **Process:** Calls the external LLM API service, creates a generation record, and returns generated flashcard proposals.
- **Response Example:**
  ```json
  {
    "generation": {
      "id": 10,
      "start_date": "timestamp",
      "end_date": "timestamp",
      "generation_time": "duration",
      "source_text_hash": "hash_value",
      "source_text_length": 1500,
      "model": "selected_model_identifier",
      "ai_complete_count": 8
    },
    "flashcard_proposals": [
      {
        "id": 1,
        "front": "Generated question text",
        "back": "Generated answer text",
        "source": "ai-complete"
      }
    ]
  }
  ```
- **Success Codes:** 201 Created
- **Error Codes:** 400 Bad Request, 500 Internal Server Error

#### List Generation Events

- **Method:** GET
- **URL:** `/api/generations`
- **Description:** Retrieves a paginated list of generation events.
- **Query Parameters:** `page`, `limit`, `sort`
- **Validation:**
  - Query parameters, if provided, must be positive integers where applicable.
- **Success Codes:** 200 OK

#### Retrieve Generation Details

- **Method:** GET
- **URL:** `/api/generations/{id}`
- **Description:** Retrieves details of a specific generation event, including associated flashcard proposals.
- **URL Parameter:**
  - `id`: Generation event ID
- **Validation:**
  - The generation ID must be a valid integer and correspond to an existing generation record.
- **Success Codes:** 200 OK
- **Error Codes:** 404 Not Found

### 2.3 Generation Logs (Optional/Internal)

#### List Generation Logs

- **Method:** GET
- **URL:** `/api/generation_logs`
- **Description:** Retrieves a list of generation logs for debugging and tracking errors. This endpoint may be restricted to admin users.
- **Validation:**
  - No additional request body validations; access is controlled via authorization.
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized, 403 Forbidden

## 3. Authentication and Authorization

- The API will use JWT tokens issued by Supabase Auth.
- Users authenticate via the `auth/login` or`/auth/token` endpoint receiving a JWT token.
- Every request (except login/registration) must include an `Authorization: Bearer <token>` header.
- The backend validates the JWT and ensures the user identity.
- Database Row-Level Security (RLS) policies further restrict data access to the owner.
- Additional measures may include rate limiting to mitigate abuse.

## 4. Validation and Business Logic

- **Flashcards Validation:**
  - The `front` field must be no longer than 200 characters.
  - The `back` field must be no longer than 500 characters.
  - The `source` field must be one of the allowed values: `manual`, `ai-complete`, or `ai-with-updates`.
- **Generation Validation:**
  - The `source_text` must have a length between 1000 and 10000 characters.
  - The `source_text_hash` must be unique for each generation event. Computed for duplication detection.
- **Business Logic Implementation:**
  - For AI-based generation, the API interacts with an external LLM service.
  - On successful AI generation, a generation record is created along with metadata (model, ai-full-count, duration) and associated flashcard proposals.
  - Users review flashcard proposals and then manually accept or edit proposals to create final flashcards.
  - The learning session endpoints integrate an external spaced repetition algorithm.
- **Error Handling:**
  - Appropriate HTTP status codes and clear error messages for validation errors (400), authentication errors (401), authorization failures (403), and server errors (500).
