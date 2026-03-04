import { redirect } from "next/navigation"

import { CropCycleDetail } from "@/components/crops/CropCycleDetail"
import { createClient } from "@/lib/supabase/server"
import type {
  CropCycleTasksRow,
  CropCyclesRow,
  PlotsRow,
  PortfolioItemsRow,
  SeasonsRow,
  UsersRow,
} from "@/lib/types/database.types"

interface CycleWithRelations extends CropCyclesRow {
  plots: PlotsRow | null
  portfolio_items: PortfolioItemsRow | null
  seasons: SeasonsRow | null
  crop_cycle_tasks: CropCycleTasksRow[]
}

interface CropCycleDetailPageProps {
  params: { seasonId: string; cycleId: string }
}

export default async function CropCycleDetailPage({
  params,
}: CropCycleDetailPageProps) {
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

  const { data: cycleRaw } = await supabase
    .from("crop_cycles")
    .select<
      string
    >(`
      *,
      plots ( name, area_acres, soil_type, irrigation_type ),
      portfolio_items ( name, local_name, category, water_requirement, duration_days ),
      seasons ( name, type, year, start_date, end_date ),
      crop_cycle_tasks ( * )
    `)
    .eq("id", params.cycleId)
    .eq("user_id", u.id)
    .single()

  if (!cycleRaw) redirect(`/crops/${params.seasonId}`)

  const cycle = cycleRaw as unknown as CycleWithRelations

  return (
    <div className="max-w-5xl p-4 md:p-8">
      <CropCycleDetail cycle={cycle} />
    </div>
  )
}

