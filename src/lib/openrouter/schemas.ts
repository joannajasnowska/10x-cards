import { z } from "zod";

export const modelParametersSchema = z.object({
  temperature: z.number().min(0).max(1),
  max_tokens: z.number().int().positive(),
  top_p: z.number().min(0).max(1),
});

export const modelConfigSchema = z.object({
  name: z.string().min(1),
  parameters: modelParametersSchema,
});

export const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});

export const requestPayloadSchema = z.object({
  messages: z.array(messageSchema).min(1),
  model: z.string().min(1),
  response_format: z
    .object({
      type: z.literal("json_schema"),
      json_schema: z.object({
        name: z.string(),
        schema: z.object({
          type: z.literal("object"),
          properties: z.record(z.unknown()),
          required: z.array(z.string()),
        }),
      }),
    })
    .optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
});

export const apiResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string(),
        role: z.string(),
      }),
    })
  ),
});

export const openRouterConfigSchema = z.object({
  apiKey: z.string().min(1),
  modelName: z.string().min(1),
  modelParameters: modelParametersSchema.partial().optional(),
  systemMessage: z.string().optional(),
  endpoint: z.string().url().optional(),
  timeout: z.number().int().positive().optional(),
  retries: z.number().int().nonnegative().optional(),
});

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
