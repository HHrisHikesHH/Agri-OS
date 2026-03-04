import { claudeAdapter, claudeStreamAdapter } from "./adapters/claude"
import { openaiAdapter, openaiStreamAdapter } from "./adapters/openai"
import { geminiAdapter, geminiStreamAdapter } from "./adapters/gemini"
import { ollamaAdapter, ollamaStreamAdapter } from "./adapters/ollama"

export type AIProvider = "claude" | "openai" | "gemini" | "ollama"

export interface AIMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface AIResponse {
  text: string
  tokensUsed: number
  costUsd: number
  provider: AIProvider
}

export interface StreamingAIResponse {
  stream: ReadableStream<Uint8Array>
  provider: AIProvider
}

export async function askAgent(
  messages: AIMessage[],
  options?: { stream?: boolean; maxTokens?: number },
): Promise<AIResponse> {
  const provider = (process.env.AI_PROVIDER ?? "claude") as AIProvider

  switch (provider) {
    case "claude":
      return claudeAdapter(messages, options)
    case "openai":
      return openaiAdapter(messages, options)
    case "gemini":
      return geminiAdapter(messages, options)
    case "ollama":
      return ollamaAdapter(messages, options)
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

export async function streamAgent(
  messages: AIMessage[],
  options?: { maxTokens?: number },
): Promise<StreamingAIResponse> {
  const provider = (process.env.AI_PROVIDER ?? "claude") as AIProvider

  switch (provider) {
    case "claude":
      return claudeStreamAdapter(messages, options)
    case "openai":
      return openaiStreamAdapter(messages, options)
    case "gemini":
      return geminiStreamAdapter(messages, options)
    case "ollama":
      return ollamaStreamAdapter(messages, options)
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

export type { AIMessage as Message }

