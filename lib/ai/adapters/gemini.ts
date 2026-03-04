import type { AIMessage, AIResponse } from "../service"

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models"
const MODEL = "gemini-1.5-flash"

export async function geminiAdapter(
  messages: AIMessage[],
  options?: { maxTokens?: number },
): Promise<AIResponse> {
  const systemMessage = messages.find((m) => m.role === "system")
  const chatMessages = messages.filter((m) => m.role !== "system")

  const contents = chatMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }))

  const res = await fetch(
    `${GEMINI_BASE}/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: systemMessage
          ? { parts: [{ text: systemMessage.content }] }
          : undefined,
        contents,
        generationConfig: {
          maxOutputTokens: options?.maxTokens ?? 1000,
        },
      }),
    },
  )

  if (!res.ok) {
    throw new Error(`Gemini error: ${res.status}`)
  }
  const data = await res.json()

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
  const tokensUsed =
    data.usageMetadata?.totalTokenCount ??
    data.usageMetadata?.promptTokenCount ??
    0

  return {
    text,
    tokensUsed,
    costUsd: 0,
    provider: "gemini",
  }
}

export async function geminiStreamAdapter(
  messages: AIMessage[],
  options?: { maxTokens?: number },
) {
  const systemMessage = messages.find((m) => m.role === "system")
  const chatMessages = messages.filter((m) => m.role !== "system")

  const res = await fetch(
    `${GEMINI_BASE}/${MODEL}:streamGenerateContent?key=${process.env.GEMINI_API_KEY}&alt=sse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: systemMessage
          ? { parts: [{ text: systemMessage.content }] }
          : undefined,
        contents: chatMessages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: options?.maxTokens ?? 1000,
        },
      }),
    },
  )

  if (!res.ok || !res.body) {
    throw new Error(`Gemini stream error: ${res.status}`)
  }

  // For simplicity, return raw SSE stream; client will receive chunks.
  return { stream: res.body, provider: "gemini" as const }
}

