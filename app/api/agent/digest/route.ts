import { NextRequest, NextResponse } from "next/server"

import { askAgent } from "@/lib/ai/service"
import { buildFarmContext } from "@/lib/ai/context/builder"
import { createClient } from "@/lib/supabase/server"
import type {
  AgentAlertsInsert,
  UsersRow,
} from "@/lib/types/database.types"

const CRON_SECRET = process.env.CRON_SECRET

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization")
  if (!auth || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    )
  }

  const supabase = createClient()

  const { data: usersRaw } = await supabase
    .from("users")
    .select("id")
    .eq("onboarding_done", true)

  const users = (usersRaw as UsersRow[] | null) ?? []
  if (users.length === 0) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  let processed = 0

  for (const user of users) {
    try {
      const context = await buildFarmContext(user.id)

      const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      const digestPrompt = `
Today is ${today}.

Based on this farmer's complete profile and current situation, generate a daily digest with:

1. ONE most important action for today (specific, actionable)
2. ONE market insight (price trend or sell/hold recommendation)
3. ONE upcoming task reminder (if any tasks due in next 3 days)
4. ONE financial insight or warning (if anything notable)
5. ONE opportunity or scheme worth exploring this week

Keep each point to 1-2 sentences. Be specific with ₹ amounts and dates.
Format as JSON with keys: today_action, market_insight, task_reminder, financial_insight, opportunity.
Respond with ONLY the JSON object, no other text.
`

      const response = await askAgent(
        [
          {
            role: "system",
            content: `You are Agri OS Agent. Farmer context:\n${context.fullContext}`,
          },
          { role: "user", content: digestPrompt },
        ],
        { maxTokens: 500 },
      )

      let digest: Record<string, string>
      try {
        const cleaned = response.text
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim()
        digest = JSON.parse(cleaned) as Record<string, string>
      } catch {
        // skip user if parsing fails
        continue
      }

      const alerts = [
        {
          alert_type: "task",
          priority: "high" as const,
          title: "📋 Today's Priority",
          body: digest.today_action ?? "",
        },
        {
          alert_type: "price",
          priority: "medium" as const,
          title: "📊 Market Insight",
          body: digest.market_insight ?? "",
        },
        {
          alert_type: "task",
          priority: "medium" as const,
          title: "⏰ Upcoming Task",
          body: digest.task_reminder ?? "",
        },
        {
          alert_type: "business",
          priority: "low" as const,
          title: "💡 Opportunity",
          body: digest.opportunity ?? "",
        },
      ].filter((a) => a.body)

      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString()

      if (alerts.length > 0) {
        const rows: AgentAlertsInsert[] = alerts.map((a) => ({
          user_id: user.id,
          ...a,
          is_delivered: false,
          is_read: false,
          expires_at: expiresAt,
        }))

        await supabase
          .from("agent_alerts")
          // @ts-expect-error Supabase client typing is narrower than our insert payload here.
          .insert(rows)
      }

      processed += 1

      if (process.env.AI_PROVIDER === "gemini") {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error("Digest failed for user", user.id, error)
    }
  }

  return NextResponse.json({ success: true, processed })
}

