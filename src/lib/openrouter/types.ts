import { type SupabaseClient } from "@supabase/supabase-js";

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
    json_schema: any;
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
  modelName: string;
  modelParameters?: Partial<ModelParameters>;
  systemMessage?: string;
  endpoint?: string;
  timeout?: number;
  retries?: number;
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
