import Link from "next/link"
import { redirect } from "next/navigation"

import { MarketOverview } from "@/components/market/MarketOverview"
import { WeatherWidget } from "@/components/market/WeatherWidget"
import { createClient } from "@/lib/supabase/server"
import { getCommodityName } from "@/lib/api/agmarknet"
import type {
  AgentAlertsRow,
  MarketPricesRow,
  PortfolioItemsRow,
  PriceAlertsRow,
  UsersRow,
} from "@/lib/types/database.types"

function startOfYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split("T")[0]
}

export default async function MarketPage() {
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

  const { data: portfolioRaw } = await supabase
    .from("portfolio_items")
    .select("id, name, category, price_unit")
    .eq("user_id", u.id)
    .eq("is_active", true)

  const portfolio =
    (portfolioRaw as PortfolioItemsRow[] | null) ?? []

  const today = new Date().toISOString().split("T")[0]
  const yesterday = startOfYesterday()

  const commodityNames = portfolio.map((i) => getCommodityName(i.name))

  const [{ data: pricesRaw }, { data: alertsRaw }, { data: agentAlertsRaw }] =
    await Promise.all([
      supabase
        .from("market_prices")
        .select("*")
        .in("commodity", commodityNames)
        .gte("price_date", yesterday)
        .order("price_date", { ascending: false }),
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
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  const prices = (pricesRaw as MarketPricesRow[] | null) ?? []
  const alerts =
    (alertsRaw as (PriceAlertsRow & {
      portfolio_items: { name: string } | null
    })[] | null) ?? []
  const triggered = (agentAlertsRaw as AgentAlertsRow[] | null) ?? []

  return (
    <div className="max-w-5xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">
        📊 Market Intelligence
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Live prices, trends and alerts for your crops.
      </p>

      {triggered.length > 0 && (
        <section className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-900">
          <p className="mb-1 font-semibold">
            Price alerts triggered today
          </p>
          <ul className="space-y-1">
            {triggered.map((a) => (
              <li key={a.id}>
                <span className="font-medium">{a.title}</span>:{" "}
                {a.body}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-green-800">
            Your crops — latest mandi prices
          </h2>
          <Link
            href="/market/prices"
            className="text-xs font-medium text-green-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        <MarketOverview
          portfolioItems={portfolio}
          prices={prices}
          alerts={alerts}
          today={today}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-green-800">
          🌤️ Weather — Kalaburagi region
        </h2>
        <WeatherWidget />
      </section>

      <section className="mt-8 grid gap-3 md:grid-cols-4">
        <NavCard href="/market/prices" icon="💹" label="All prices" />
        <NavCard
          href="/market/alerts"
          icon="🔔"
          label="My alerts"
          count={alerts.length}
        />
        <NavCard href="/market/weather" icon="🌦️" label="Weather" />
        <NavCard href="/finances/pnl" icon="📈" label="My P&L" />
      </section>
    </div>
  )
}

function NavCard({
  href,
  icon,
  label,
  count,
}: {
  href: string
  icon: string
  label: string
  count?: number
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-xl border bg-white p-3 text-xs shadow-sm hover:border-green-400 hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="font-semibold text-gray-800">{label}</span>
      </div>
      {typeof count === "number" && (
        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-800">
          {count}
        </span>
      )}
    </a>
  )
}

