import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type {
  AgentRecommendationsRow,
  UsersRow,
} from "@/lib/types/database.types"
import { RecommendationCard } from "@/components/agent/RecommendationCard"

export default async function RecommendationsPage() {
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

  const { data: recsRaw } = await supabase
    .from("agent_recommendations")
    .select("*")
    .eq("user_id", u.id)
    .order("created_at", { ascending: false })

  const recs =
    (recsRaw as AgentRecommendationsRow[] | null) ?? []

  return (
    <div className="max-w-4xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">
        📋 Agent recommendations
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        All recommendations made by the agent, with space to track
        what happened when you followed them.
      </p>
      <div className="mt-4 space-y-3">
        {recs.map((r) => (
          <RecommendationCard key={r.id} recommendation={r} />
        ))}
        {recs.length === 0 && (
          <p className="text-xs text-gray-500">
            No recommendations yet. Ask the agent for advice on
            crops, prices, or business ideas.
          </p>
        )}
      </div>
    </div>
  )
}

