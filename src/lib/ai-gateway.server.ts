import { createOpenAI } from "@ai-sdk/openai";

export function createLovableResponsesProvider(apiKey: string) {
  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
}

export function createPerceptionModel(apiKey: string) {
  return createLovableResponsesProvider(apiKey).responses("openai/gpt-6-astra");
}

export function createTrainingArchitectModel(apiKey: string) {
  return createLovableResponsesProvider(apiKey).responses("openai/gpt-6-astra");
}