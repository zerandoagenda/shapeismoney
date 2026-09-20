import { createOpenAI } from "@ai-sdk/openai";

export function createPerceptionModel(apiKey: string) {
  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  }).responses("openai/gpt-6-astra");
}