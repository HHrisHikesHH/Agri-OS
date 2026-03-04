import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type {
  AgentInteractionsRow,
  UsersRow,
} from "@/lib/types/database.types"

export default async function AgentHistoryPage() {
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

  const { data: interactionsRaw } = await supabase
    .from("agent_interactions")
    .select("*")
    .eq("user_id", u.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const interactions =
    (interactionsRaw as AgentInteractionsRow[] | null) ??
    []

  return (
    <div className="max-w-4xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">
        🕒 Agent history
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Recent conversations between you and Agri OS Agent.
      </p>
      <div className="mt-4 space-y-3 text-xs">
        {interactions.map((i) => (
          <div
            key={i.id}
            className="space-y-1 rounded-xl border bg-white p-3 shadow-sm"
          >
            <p className="text-[11px] text-gray-500">
              {i.created_at
                ? new Date(i.created_at).toLocaleString("en-IN")
                : "Unknown time"}
            </p>
            <p className="font-semibold text-gray-800">
              You: {i.user_message}
            </p>
            <p className="text-gray-700">
              Agent: {i.agent_response}
            </p>
          </div>
        ))}
        {interactions.length === 0 && (
          <p className="text-xs text-gray-500">
            No interactions recorded yet. Ask the agent a question
            to get started.
          </p>
        )}
      </div>
    </div>
  )
}

