import { redirect } from "next/navigation"

import { CropCyclesList } from "@/components/crops/CropCyclesList"
import { createClient } from "@/lib/supabase/server"
import type {
  CropCyclesRow,
  PlotsRow,
  PortfolioItemsRow,
  SeasonsRow,
} from "@/lib/types/database.types"

interface SeasonWithCycles extends SeasonsRow {
  crop_cycles: (CropCyclesRow & {
    plots: PlotsRow | null
    portfolio_items: PortfolioItemsRow | null
  })[]
}

interface SeasonDetailPageProps {
  params: { seasonId: string }
}

export default async function SeasonDetailPage({
  params,
}: SeasonDetailPageProps) {
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

  const { data: seasonRaw } = await supabase
    .from("seasons")
    .select<
      string
    >(`
      *,
      crop_cycles (
        *,
        plots ( name, area_acres, soil_type, irrigation_type ),
        portfolio_items ( name, local_name, category, sub_category, water_requirement )
      )
    `)
    .eq("id", params.seasonId)
    .eq("user_id", userRow.id)
    .single()

  if (!seasonRaw) redirect("/crops")

  const season = seasonRaw as unknown as SeasonWithCycles

  const cycles = season.crop_cycles ?? []
  const totalAcres =
    cycles.reduce((sum, c) => sum + (c.area_acres ?? 0), 0) ?? 0
  const totalRevenue =
    cycles.reduce((sum, c) => sum + (c.total_revenue ?? 0), 0) ?? 0
  const totalCost =
    cycles.reduce((sum, c) => sum + (c.total_input_cost ?? 0), 0) ?? 0
  const net = totalRevenue - totalCost

  const today = new Date().toISOString().split("T")[0]
  const isActive =
    !!season.start_date &&
    !!season.end_date &&
    season.start_date <= today &&
    today <= season.end_date

  return (
    <div className="max-w-5xl p-4 md:p-8">
      {/* Season summary bar */}
      <section className="space-y-2 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-green-800">
              {season.name}
            </h1>
            <p className="text-xs text-gray-600">
              {season.start_date} → {season.end_date}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-800">
              {totalAcres.toFixed(1)} acres planned
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-800">
              {cycles.length} crop cycles
            </span>
            <span className="rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800">
              P&L: ₹{(totalRevenue - totalCost).toFixed(0)}
            </span>
            <span
              className={`rounded-full px-3 py-1 font-medium ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {isActive ? "🟢 Active" : totalRevenue || totalCost ? "⚫ Completed" : "🔵 Upcoming"}
            </span>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-gray-700">
          <span>
            Revenue: <strong>₹{totalRevenue.toFixed(0)}</strong>
          </span>
          <span>
            Input cost: <strong>₹{totalCost.toFixed(0)}</strong>
          </span>
          <span>
            Net: <strong>₹{net.toFixed(0)}</strong>
          </span>
          {season.rainfall_mm != null && (
            <span>
              Rainfall: <strong>{season.rainfall_mm} mm</strong>
            </span>
          )}
        </div>
      </section>

      {/* Crop cycles grid */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-green-800">
            Crop cycles in this season
          </h2>
          <a
            href={`/crops/${season.id}/new`}
            className="rounded-lg bg-green-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-800"
          >
            + Plan new crop cycle
          </a>
        </div>
        <CropCyclesList season={season} />
      </section>
    </div>
  )
}

