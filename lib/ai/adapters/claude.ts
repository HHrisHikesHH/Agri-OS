import Anthropic from "@anthropic-ai/sdk"

import type { AIMessage, AIResponse } from "../service"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const COST_PER_INPUT_TOKEN = 0.000003
const COST_PER_OUTPUT_TOKEN = 0.000015

export async function claudeAdapter(
  messages: AIMessage[],
  options?: { maxTokens?: number },
): Promise<AIResponse> {
  const systemMessage = messages.find((m) => m.role === "system")
  const conversationMessages = messages.filter((m) => m.role !== "system")

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: options?.maxTokens ?? 1000,
    system: systemMessage?.content,
    messages: conversationMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  })

  const inputTokens = response.usage?.input_tokens ?? 0
  const outputTokens = response.usage?.output_tokens ?? 0
  const costUsd =
    inputTokens * COST_PER_INPUT_TOKEN +
    outputTokens * COST_PER_OUTPUT_TOKEN

  const content = response.content[0]
  const text =
    content.type === "text" ? content.text : ""

  return {
    text,
    tokensUsed: inputTokens + outputTokens,
    costUsd,
    provider: "claude",
  }
}

export async function claudeStreamAdapter(
  messages: AIMessage[],
  options?: { maxTokens?: number },
) {
  const systemMessage = messages.find((m) => m.role === "system")
  const conversationMessages = messages.filter((m) => m.role !== "system")

  const stream = await client.messages.stream({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: options?.maxTokens ?? 1000,
    system: systemMessage?.content,
    messages: conversationMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  })

  const readableStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(
            new TextEncoder().encode(chunk.delta.text),
          )
        }
      }
      controller.close()
    },
  })

  return { stream: readableStream, provider: "claude" as const }
}

