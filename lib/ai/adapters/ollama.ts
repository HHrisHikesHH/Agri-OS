import type { AIMessage, AIResponse } from "../service"

const OLLAMA_BASE =
  process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"

export async function ollamaAdapter(
  messages: AIMessage[],
  options?: { maxTokens?: number },
): Promise<AIResponse> {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "llama3.2",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: false,
      options: { num_predict: options?.maxTokens ?? 1000 },
    }),
  })

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status}`)
  }
  const data = await res.json()

  const tokensUsed =
    (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0)

  return {
    text: data.message?.content ?? "",
    tokensUsed,
    costUsd: 0,
    provider: "ollama",
  }
}

export async function ollamaStreamAdapter(
  messages: AIMessage[],
  options?: { maxTokens?: number },
) {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "llama3.2",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
      options: { num_predict: options?.maxTokens ?? 1000 },
    }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`Ollama stream error: ${res.status}`)
  }

  const readableStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split("\n").filter(Boolean)
        for (const line of lines) {
          try {
            const json = JSON.parse(line)
            if (json.message?.content) {
              controller.enqueue(
                new TextEncoder().encode(json.message.content),
              )
            }
          } catch {
            // ignore bad json chunks
          }
        }
      }
      controller.close()
    },
  })

  return { stream: readableStream, provider: "ollama" as const }
}

