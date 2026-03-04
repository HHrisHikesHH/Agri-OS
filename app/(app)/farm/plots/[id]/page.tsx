import { redirect } from "next/navigation"

import { EditPlotForm } from "@/components/farm/plots/EditPlotForm"
import { WaterSourceForm } from "@/components/farm/plots/WaterSourceForm"
import { createClient } from "@/lib/supabase/server"
import type {
  PlotsRow,
  WaterSourcesRow,
} from "@/lib/types/database.types"

interface PlotWithSources extends PlotsRow {
  water_sources: WaterSourcesRow[] | null
}

interface PlotDetailPageProps {
  params: { id: string }
}

export default async function PlotDetailPage({ params }: PlotDetailPageProps) {
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

  const { data: plotRaw } = await supabase
    .from("plots")
    .select(
      `
      *,
      water_sources (*)
    `,
    )
    .eq("id", params.id)
    .eq("user_id", userRow.id)
    .single()

  if (!plotRaw) {
    redirect("/farm/plots")
  }

  const plot = plotRaw as unknown as PlotWithSources
  const waterSources = plot.water_sources ?? []

  return (
    <div className="max-w-4xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">{plot.name}</h1>
      <p className="mt-1 text-sm text-gray-600">
        {plot.area_acres} acres · {plot.soil_type || "Soil type not set"} ·{" "}
        {plot.irrigation_type || "Irrigation not set"}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
        {/* Section A — Plot details */}
        <section className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-green-800">
            Plot details
          </h2>
          <EditPlotForm plot={plot} />
        </section>

        {/* Section B — Water sources */}
        <section className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-green-800">
              Water sources
            </h2>
            {waterSources.length > 0 && (
              <p className="text-xs text-gray-500">
                {waterSources.length} source
                {waterSources.length > 1 ? "s" : ""} mapped
              </p>
            )}
          </div>

          <div className="space-y-3">
            {waterSources.length === 0 ? (
              <p className="text-sm text-gray-500">
                No water sources mapped yet. Add borewells, ponds, or canals so
                Agri OS can reason about water risk.
              </p>
            ) : (
              waterSources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-green-100 bg-green-50/60 p-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-green-900">
                      {source.type || "Water source"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      Reliability: {source.reliability || "Unknown"}
                    </p>
                    {(source.depth_ft || source.motor_hp) && (
                      <p className="mt-0.5 text-xs text-gray-600">
                        {source.depth_ft
                          ? `Depth: ${source.depth_ft} ft`
                          : null}
                        {source.depth_ft && source.motor_hp ? " · " : null}
                        {source.motor_hp ? `Motor: ${source.motor_hp} HP` : null}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-2 border-t border-green-100 pt-3">
            <WaterSourceForm plotId={plot.id} />
          </div>
        </section>
      </div>
    </div>
  )
}

