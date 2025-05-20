import { type SupabaseClient } from "@supabase/supabase-js";
import {
  type ApiClient,
  type ApiError,
  type Message,
  type ModelConfig,
  type ModelParameters,
  type OpenRouterConfig,
  type RequestPayload,
  type ApiResponse,
} from "./types";
import { apiErrorSchema, modelConfigSchema, openRouterConfigSchema, requestPayloadSchema } from "./schemas";
import { OpenRouterLogger } from "./logger";

export class OpenRouterService {
  private readonly apiClient: ApiClient;
  private readonly defaultEndpoint = "https://openrouter.ai/api/v1/chat/completions";
  private readonly defaultTimeout = 30000;
  private readonly defaultRetries = 1;
  private readonly logger = new OpenRouterLogger();

  private _modelName: string;
  private _modelParameters: ModelParameters;

  private currentSystemMessage?: string;
  private currentUserMessage?: string;
  private currentResponseFormat: RequestPayload["response_format"];

  constructor(supabase: SupabaseClient, config: OpenRouterConfig) {
    this.logger.debug("Initializing OpenRouter service", { config });

    try {
      // Validate config
      const validatedConfig = openRouterConfigSchema.parse(config);

      // Initialize API client
      this.apiClient = {
        supabase,
        execute: this.executeRequest.bind(this),
      };

      // Set model configuration
      this._modelName = validatedConfig.modelName;
      this._modelParameters = {
        temperature: validatedConfig.modelParameters?.temperature ?? 0.7,
        max_tokens: validatedConfig.modelParameters?.max_tokens ?? 256,
        top_p: validatedConfig.modelParameters?.top_p ?? 1.0,
      };

      // Set initial system message if provided
      if (validatedConfig.systemMessage) {
        this.currentSystemMessage = validatedConfig.systemMessage;
      }

      // Set default response format
      this.currentResponseFormat = {
        type: "json_schema",
        json_schema: {
          name: "chat_response",
          strict: true,
          schema: {
            message: "string",
            tokens: "number",
          },
        },
      };

      // Validate API key exists
      this.validateApiKey();

      this.logger.info("OpenRouter service initialized successfully", {
        model: this._modelName,
        parameters: this._modelParameters,
      });
    } catch (error) {
      this.logger.error("Failed to initialize OpenRouter service", this.handleError(error));
      throw error;
    }
  }

  // Public getters for model configuration
  public get modelName(): string {
    return this._modelName;
  }

  public get modelParameters(): ModelParameters {
    return { ...this._modelParameters };
  }

  /**
   * Send a chat request to the OpenRouter API
   */
  public async sendChatRequest(message: string): Promise<ApiResponse> {
    this.logger.debug("Sending chat request", { message });

    try {
      // Set the user message
      this.setUserMessage(message);

      // Build and validate the request payload
      const payload = this.buildRequestPayload();
      this.logger.debug("Request payload built", { payload });

      // Execute the request
      const response = await this.apiClient.execute(payload);
      this.logger.info("Chat request completed successfully", { tokens: response.tokens });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        switch (error.name) {
          case "ValidationError": {
            const validationError = this.handleError({
              code: "VALIDATION_ERROR",
              message: "Invalid request format",
              details: error,
            });
            this.logger.error("Validation error in chat request", validationError);
            throw validationError;
          }
          case "AbortError": {
            const timeoutError = this.handleError({
              code: "TIMEOUT_ERROR",
              message: "Request timed out",
              details: error,
            });
            this.logger.error("Timeout error in chat request", timeoutError);
            throw timeoutError;
          }
          default: {
            const unknownError = this.handleError(error);
            this.logger.error("Unknown error in chat request", unknownError);
            throw unknownError;
          }
        }
      }
      const genericError = this.handleError(error);
      this.logger.error("Generic error in chat request", genericError);
      throw genericError;
    }
  }

  /**
   * Set the system message for future requests
   */
  public setSystemMessage(message: string): void {
    this.logger.debug("Setting system message", { message });

    if (!message.trim()) {
      const error = this.handleError({
        code: "INVALID_INPUT",
        message: "System message cannot be empty",
      });
      this.logger.error("Invalid system message", error);
      throw error;
    }
    this.currentSystemMessage = message;
  }

  /**
   * Set the user message for the next request
   */
  public setUserMessage(message: string): void {
    this.logger.debug("Setting user message", { message });

    if (!message.trim()) {
      const error = this.handleError({
        code: "INVALID_INPUT",
        message: "User message cannot be empty",
      });
      this.logger.error("Invalid user message", error);
      throw error;
    }
    this.currentUserMessage = message;
  }

  /**
   * Update the model configuration
   */
  public setModelConfig(config: ModelConfig): void {
    this.logger.debug("Setting model configuration", { config });

    try {
      // Validate the config
      const validatedConfig = modelConfigSchema.parse(config);

      // Update the configuration
      this._modelName = validatedConfig.name;
      this._modelParameters = validatedConfig.parameters;

      this.logger.info("Model configuration updated", {
        model: this._modelName,
        parameters: this._modelParameters,
      });
    } catch (error) {
      const validationError = this.handleError({
        code: "VALIDATION_ERROR",
        message: "Invalid model configuration",
        details: error,
      });
      this.logger.error("Failed to update model configuration", validationError);
      throw validationError;
    }
  }

  /**
   * Build the request payload from current state
   */
  private buildRequestPayload(): RequestPayload {
    this.logger.debug("Building request payload");

    try {
      // Prepare messages array
      const messages: Message[] = [];

      // Add system message if present
      if (this.currentSystemMessage) {
        messages.push({
          role: "system",
          content: this.currentSystemMessage,
        });
      }

      // Add user message if present
      if (!this.currentUserMessage) {
        throw {
          code: "INVALID_STATE",
          message: "User message must be set before sending a request",
        };
      }

      messages.push({
        role: "user",
        content: this.currentUserMessage,
      });

      // Build the payload
      const payload: RequestPayload = {
        model: this._modelName,
        messages: messages,
        temperature: this._modelParameters.temperature,
        top_p: this._modelParameters.top_p,
      };

      // Add response format if set
      if (this.currentResponseFormat) {
        payload.response_format = this.currentResponseFormat;
      }

      // Validate the payload
      const validatedPayload = requestPayloadSchema.parse(payload);
      this.logger.debug("Request payload built successfully", { payload: validatedPayload });
      return validatedPayload;
    } catch (error) {
      const validationError = this.handleError({
        code: "VALIDATION_ERROR",
        message: "Failed to build request payload",
        details: error,
      });
      this.logger.error("Failed to build request payload", validationError);
      throw validationError;
    }
  }

  private async executeRequest(payload: RequestPayload): Promise<ApiResponse> {
    let lastError: unknown;
    const maxRetries = this.defaultRetries;
    const timeout = this.defaultTimeout;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      this.logger.debug("Executing request", {
        attempt: attempt + 1,
        maxRetries,
        model: payload.model,
      });

      try {
        const response = await fetch(this.defaultEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getApiKey()}`,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(timeout),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const apiError = {
            code: "API_ERROR",
            message: `OpenRouter API error: ${response.status} ${response.statusText}`,
            details: {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
              attempt: attempt + 1,
              maxRetries,
            },
          };
          this.logger.warn("API request failed", apiError.details);
          throw apiError;
        }

        const data = await response.json();
        if (!data.choices?.[0]?.message?.content) {
          const responseError = {
            code: "API_RESPONSE_ERROR",
            message: "Invalid API response format",
            details: data,
          };
          this.logger.error("Invalid API response format", responseError);
          throw responseError;
        }

        const result = {
          message: data.choices[0].message.content,
          tokens: data.usage?.total_tokens ?? 0,
        };

        this.logger.info("Request executed successfully", {
          tokens: result.tokens,
          attempt: attempt + 1,
        });

        return result;
      } catch (error) {
        lastError = error;

        // Don't retry on validation errors
        if (error instanceof Error && error.name === "ValidationError") {
          this.logger.warn("Not retrying validation error", { error });
          break;
        }

        // Don't retry on 4xx errors (except 429 - rate limit)
        if (error && typeof error === "object" && "details" in error) {
          const details = error.details as { status?: number };
          if (details.status && details.status >= 400 && details.status < 500 && details.status !== 429) {
            this.logger.warn("Not retrying client error", { status: details.status });
            break;
          }
        }

        // If we've run out of retries, give up
        if (attempt === maxRetries - 1) {
          this.logger.warn("Max retries reached", { maxRetries });
          break;
        }

        const backoffTime = Math.pow(2, attempt) * 1000;
        this.logger.debug("Retrying request after backoff", {
          attempt: attempt + 1,
          backoffMs: backoffTime,
        });

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      }
    }

    const finalError = this.handleError(lastError);
    this.logger.error("Request failed after all retries", finalError);
    throw finalError;
  }

  private getApiKey(): string {
    try {
      const apiKey = import.meta.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        const error = this.handleError({
          code: "CONFIG_ERROR",
          message: "OpenRouter API key not found in environment variables",
        });
        this.logger.error("API key not found", error);
        throw error;
      }
      return apiKey;
    } catch (error) {
      const configError = this.handleError(error);
      this.logger.error("Failed to get API key", configError);
      throw configError;
    }
  }

  private validateApiKey(): void {
    try {
      this.getApiKey();
      this.logger.debug("API key validated successfully");
    } catch (error) {
      const initError = this.handleError({
        code: "INITIALIZATION_ERROR",
        message: "Failed to initialize OpenRouter service: API key not found",
        details: error,
      });
      this.logger.error("API key validation failed", initError);
      throw initError;
    }
  }

  private handleError(error: unknown): ApiError {
    // Convert unknown error to typed ApiError
    const apiError: ApiError = {
      code: error && typeof error === "object" && "code" in error ? String(error.code) : "UNKNOWN_ERROR",
      message:
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "An unexpected error occurred",
      details: error,
    };

    // Validate and return the error
    return apiErrorSchema.parse(apiError);
  }
}
