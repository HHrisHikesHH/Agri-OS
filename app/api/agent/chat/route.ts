import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { runAgentWithTools } from "@/lib/ai/service"
import {
  getFarmContext,
} from "@/lib/ai/context/builder"
import {
  detectSkill,
  getSkillLabel,
  getSkillPrompt,
} from "@/lib/ai/context/skills"
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
    (skillPrompt ? `\n\n${skillPrompt}` : "") +
    `

TOOL USAGE RULES:
- Use tools to get LIVE data when the user asks about prices, weather, tasks, finances, etc.
- Always use get_mandi_prices when asked about crop rates or bhav
- Always use get_weather when asked about rain, irrigation timing, spray timing
- Always use get_active_crop_cycles or get_overdue_tasks for crop/farm status questions
- For write tools (log_sale, log_expense, complete_task): only call after user confirms the details
- After calling tools, use the REAL data in your response — don't use cached context numbers
- Keep responses concise: 100-200 words maximum unless user asks for detail`

  const fullMessages = [
    { role: "system" as const, content: systemPrompt },
    ...(body.conversationHistory ?? []),
    ...body.messages,
  ]

  try {
    const result = await runAgentWithTools(fullMessages, u.id, {
      maxIterations: 3,
      maxTokens: 1000,
    })

    // Save interaction to DB
    await supabase
      .from("agent_interactions")
      // @ts-expect-error insert matches AgentInteractionsInsert
      .insert({
        user_id: u.id,
        input_type: "text",
        user_message: latestMessage,
        agent_response: result.finalText,
        context_used:
          result.toolsUsed.length > 0
            ? `${skill} | tools: ${result.toolsUsed.join(", ")}`
            : skill,
        tokens_used:
          Math.ceil(result.finalText.length / 4) +
          context.estimatedTokens,
        cost_usd: result.totalCost,
      })

    const recMatch = result.finalText.match(
      /\[RECOMMENDATION: (.+?) \| EXPECTED_BENEFIT: ₹?(\d+) \| CONFIDENCE: (\w+)\]/,
    )
    if (recMatch) {
      await supabase
        .from("agent_recommendations")
        // @ts-expect-error insert matches AgentRecommendationsInsert
        .insert({
          user_id: u.id,
          category: skill,
          recommendation: recMatch[1],
          expected_benefit: parseFloat(recMatch[2]),
          confidence: recMatch[3],
          status: "pending",
        })
    }

    return NextResponse.json({
      text: result.finalText,
      tools_used: result.toolsUsed,
      skill: getSkillLabel(skill),
    })
  } catch (err) {
    console.error("Agent error:", err)
    return NextResponse.json(
      { error: "Agent unavailable" },
      { status: 500 },
    )
  }
}

