import { redirect } from "next/navigation"

import { PriceAlertsPanel } from "@/components/market/PriceAlertsPanel"
import { createClient } from "@/lib/supabase/server"
import type {
  AgentAlertsRow,
  PortfolioItemsRow,
  PriceAlertsRow,
  UsersRow,
} from "@/lib/types/database.types"

export default async function AlertsPage() {
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

  const [{ data: portfolioRaw }, { data: alertsRaw }, { data: agentAlertsRaw }] =
    await Promise.all([
      supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", u.id)
        .eq("is_active", true),
      supabase
        .from("price_alerts")
        .select<
          string
        >(`
          *,
          portfolio_items ( name )
        `)
        .eq("user_id", u.id)
        .eq("is_active", true),
      supabase
        .from("agent_alerts")
        .select("*")
        .eq("user_id", u.id)
        .eq("alert_type", "price")
        .order("created_at", { ascending: false })
        .limit(20),
    ])

  const portfolio =
    (portfolioRaw as PortfolioItemsRow[] | null) ?? []
  const alerts =
    (alertsRaw as (PriceAlertsRow & {
      portfolio_items: { name: string } | null
    })[] | null) ?? []
  const agentAlerts = (agentAlertsRaw as AgentAlertsRow[] | null) ?? []

  return (
    <div className="max-w-4xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">
        🔔 Price alerts
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Get notified when mandi prices cross your target.
      </p>
      <div className="mt-6">
        <PriceAlertsPanel
          portfolioItems={portfolio}
          alerts={alerts}
          agentAlerts={agentAlerts}
        />
      </div>
    </div>
  )
}

