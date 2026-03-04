import type { AIMessage, AIResponse } from "../service"

const OPENAI_BASE = "https://api.openai.com/v1/chat/completions"
const COST_PER_INPUT_TOKEN = 0.0000025
const COST_PER_OUTPUT_TOKEN = 0.00001

export async function openaiAdapter(
  messages: AIMessage[],
  options?: { maxTokens?: number },
): Promise<AIResponse> {
  const res = await fetch(OPENAI_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: options?.maxTokens ?? 1000,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!res.ok) {
    throw new Error(`OpenAI error: ${res.status}`)
  }
  const data = await res.json()

  const inputTokens = data.usage?.prompt_tokens ?? 0
  const outputTokens = data.usage?.completion_tokens ?? 0
  const costUsd =
    inputTokens * COST_PER_INPUT_TOKEN +
    outputTokens * COST_PER_OUTPUT_TOKEN

  return {
    text: data.choices[0]?.message?.content ?? "",
    tokensUsed: inputTokens + outputTokens,
    costUsd,
    provider: "openai",
  }
}

export async function openaiStreamAdapter(
  messages: AIMessage[],
  options?: { maxTokens?: number },
) {
  const res = await fetch(OPENAI_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: options?.maxTokens ?? 1000,
      stream: true,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`OpenAI error: ${res.status}`)
  }

  return { stream: res.body, provider: "openai" as const }
}

