import { type SupabaseClient } from "../../db/supabase.client";

export interface ModelParameters {
  temperature: number;
  max_tokens: number;
  top_p: number;
}

export interface ModelConfig {
  name: string;
  parameters: ModelParameters;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface RequestPayload {
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  model: string;
  response_format?: {
    type: "json_schema";
    json_schema: Record<string, unknown>;
  };
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ApiResponse {
  message: string;
  tokens: number;
}

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string;
}

export interface OpenRouterModelParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

export interface OpenRouterServiceDependencies {
  supabase: SupabaseClient;
}

export interface ApiClient {
  supabase: SupabaseClient;
  execute: (payload: RequestPayload) => Promise<ApiResponse>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
