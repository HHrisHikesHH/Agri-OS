import {
  claudeAdapter,
  claudeStreamAdapter,
  claudeAdapterWithTools,
} from "./adapters/claude"
import {
  openaiAdapter,
  openaiStreamAdapter,
} from "./adapters/openai"
import {
  geminiAdapter,
  geminiStreamAdapter,
  geminiAdapterWithTools,
} from "./adapters/gemini"
import {
  ollamaAdapter,
  ollamaStreamAdapter,
} from "./adapters/ollama"
import { AGENT_TOOLS } from "./tools/definitions"
import {
  executeTool,
  type ToolResult,
} from "./tools/executor"

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

export interface AgentRunResult {
  finalText: string
  toolsUsed: string[]
  toolResults: ToolResult[]
  totalCost: number
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

// ─────────────────────────────────────────────────────
// AGENTIC LOOP — runs tools then generates final response
// ─────────────────────────────────────────────────────

export async function runAgentWithTools(
  messages: AIMessage[],
  userId: string,
  options?: { maxIterations?: number; maxTokens?: number },
): Promise<AgentRunResult> {
  const provider = (process.env.AI_PROVIDER ?? "claude") as AIProvider
  const maxIterations = options?.maxIterations ?? 3

  let currentMessages = [...messages]
  const allToolResults: ToolResult[] = []
  const toolsUsed: string[] = []
  let totalCost = 0
  let finalText = ""

  for (let i = 0; i < maxIterations; i++) {
    let response:
      | {
          text: string
          toolCalls: Array<{
            name: string
            params: Record<string, unknown>
          }>
        }
      | null = null

    if (provider === "claude") {
      response = await claudeAdapterWithTools(
        currentMessages,
        AGENT_TOOLS,
        options,
      )
    } else if (provider === "gemini") {
      response = await geminiAdapterWithTools(
        currentMessages,
        AGENT_TOOLS,
        options,
      )
    } else {
      response = await simulateToolCalling(
        currentMessages,
        userId,
        options,
      )
    }

    finalText = response.text

    if (!response.toolCalls.length) break

    const results = await Promise.all(
      response.toolCalls.map((tc) =>
        executeTool(tc.name, tc.params, userId),
      ),
    )

    allToolResults.push(...results)
    toolsUsed.push(
      ...response.toolCalls.map((tc) => tc.name),
    )

    const toolResultsText = results
      .map((r) =>
        r.success
          ? `TOOL ${r.tool} RESULT:\n${JSON.stringify(
              r.data,
              null,
              2,
            )}`
          : `TOOL ${r.tool} ERROR: ${r.error}`,
      )
      .join("\n\n")

    currentMessages = [
      ...currentMessages,
      {
        role: "assistant",
        content: response.text || "Fetching data...",
      },
      {
        role: "user",
        content: `Tool results:\n${toolResultsText}\n\nNow provide your response using this real data.`,
      },
    ]
  }

  return {
    finalText,
    toolsUsed,
    toolResults: allToolResults,
    totalCost,
  }
}

// Fallback for providers without native tool-calling
async function simulateToolCalling(
  messages: AIMessage[],
  _userId: string,
  options?: { maxTokens?: number },
): Promise<{
  text: string
  toolCalls: Array<{ name: string; params: Record<string, unknown> }>
}> {
  const toolListText = AGENT_TOOLS.map(
    (t) => `- ${t.name}: ${t.description}`,
  ).join("\n")

  const detectionMessages: AIMessage[] = [
    ...messages,
    {
      role: "user",
      content: `Based on the user's last message, which tools (if any) should be called?

Available tools:
${toolListText}

Reply with ONLY a JSON array of tool calls, or empty array [] if no tools needed.
Format: [{"name": "tool_name", "params": {"key": "value"}}]
No explanation, just JSON.`,
    },
  ]

  const detectionRes = await askAgent(detectionMessages, {
    maxTokens: options?.maxTokens ?? 300,
  })

  let toolCalls: Array<{
    name: string
    params: Record<string, unknown>
  }> = []
  try {
    const cleaned = detectionRes.text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim()
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) {
      toolCalls = parsed as Array<{
        name: string
        params: Record<string, unknown>
      }>
    }
  } catch {
    toolCalls = []
  }

  return { text: "", toolCalls }
}

export type { AIMessage as Message }


