import { redirect } from "next/navigation"

import { AgentChat } from "@/components/agent/AgentChat"
import { createClient } from "@/lib/supabase/server"
import type {
  AgentAlertsRow,
  AgentInteractionsRow,
  AgentRecommendationsRow,
  UsersRow,
} from "@/lib/types/database.types"

export default async function AgentPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single()

  if (!userRow) redirect("/onboarding")
  const u = userRow as UsersRow

  const [
    { data: interactionsRaw },
    { data: alertsRaw },
    { data: recsRaw },
  ] = await Promise.all([
    supabase
      .from("agent_interactions")
      .select("*")
      .eq("user_id", u.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("agent_alerts")
      .select("*")
      .eq("user_id", u.id)
      .eq("is_read", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("agent_recommendations")
      .select("*")
      .eq("user_id", u.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  const interactions =
    (interactionsRaw as AgentInteractionsRow[] | null) ?? []
  const unreadAlerts =
    (alertsRaw as AgentAlertsRow[] | null) ?? []
  const recommendations =
    (recsRaw as AgentRecommendationsRow[] | null) ?? []

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col md:h-screen bg-white dark:bg-gray-950">
      <AgentChat
        recentInteractions={interactions}
        unreadAlerts={unreadAlerts}
        pendingRecommendations={recommendations}
      />
    </div>
  )
}

