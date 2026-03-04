import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { streamAgent } from "@/lib/ai/service"
import {
  getFarmContext,
} from "@/lib/ai/context/builder"
import { detectSkill, getSkillLabel, getSkillPrompt } from "@/lib/ai/context/skills"
import { buildSystemPrompt } from "@/lib/ai/prompts/system"
import type {
  AgentInteractionsRow,
  UsersRow,
} from "@/lib/types/database.types"

export async function POST(request: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    )
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single()

  if (!userRow) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 },
    )
  }

  const u = userRow as UsersRow
  const body = (await request.json()) as {
    messages: { role: "user" | "assistant"; content: string }[]
    conversationHistory?: {
      role: "user" | "assistant"
      content: string
    }[]
  }

  const latestMessage =
    body.messages[body.messages.length - 1]?.content ?? ""

  const skill = detectSkill(latestMessage)
  const skillPrompt = getSkillPrompt(skill)

  const context = await getFarmContext(u.id)
  const systemPrompt =
    buildSystemPrompt(context.fullContext) +
    (skillPrompt ? `\n\n${skillPrompt}` : "")

  const fullMessages = [
    { role: "system" as const, content: systemPrompt },
    ...(body.conversationHistory ?? []),
    ...body.messages,
  ]

  const saveInteractionPromise = supabase
    .from("agent_interactions")
    // @ts-expect-error insert matches AgentInteractionsInsert
    .insert({
      user_id: u.id,
      input_type: "text",
      user_message: latestMessage,
      agent_response: "",
      context_used: skill,
      tokens_used: context.estimatedTokens,
    })
    .select("*")
    .single()

  try {
    const { stream } = await streamAgent(fullMessages, {
      // Allow longer, more complete answers while staying reasonable.
      maxTokens: 2048,
    })

    let fullResponse = ""
    const [clientStream, captureStream] = stream.tee()

    ;(async () => {
      const reader = captureStream.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullResponse += decoder.decode(value)
      }

      const { data: interaction } = await saveInteractionPromise
      const interactionRow =
        interaction as AgentInteractionsRow | null
      if (interactionRow) {
        await supabase
          .from("agent_interactions")
          // @ts-expect-error update matches AgentInteractionsUpdate
          .update({
            agent_response: fullResponse,
            tokens_used:
              Math.ceil(fullResponse.length / 4) +
              context.estimatedTokens,
          })
          .eq("id", interactionRow.id)

        const recMatch = fullResponse.match(
          /\[RECOMMENDATION: (.+?) \| EXPECTED_BENEFIT: ₹?(\d+) \| CONFIDENCE: (\w+)\]/,
        )
        if (recMatch) {
          await supabase
            .from("agent_recommendations")
            // @ts-expect-error insert matches AgentRecommendationsInsert
            .insert({
              user_id: u.id,
              interaction_id: interactionRow.id,
              category: skill,
              recommendation: recMatch[1],
              expected_benefit: parseFloat(recMatch[2]),
              confidence: recMatch[3],
              status: "pending",
            })
        }
      }
    })().catch(() => {
      // swallow background errors
    })

    return new Response(clientStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        // HTTP headers must be ASCII-only; use the skill id, not the emoji label.
        "X-Skill-Used": skill,
      },
    })
  } catch (error) {
    console.error("Agent error:", error)
    return NextResponse.json(
      { error: "Agent unavailable" },
      { status: 500 },
    )
  }
}

