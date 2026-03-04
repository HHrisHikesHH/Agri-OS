import { redirect } from "next/navigation"

import { PnLReport } from "@/components/finances/PnLReport"
import { createClient } from "@/lib/supabase/server"
import type {
  CropCyclesRow,
  PlotsRow,
  PortfolioItemsRow,
  SeasonsRow,
  UsersRow,
} from "@/lib/types/database.types"

export default async function PnlPage() {
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

  const { data: cyclesRaw } = await supabase
    .from("crop_cycles")
    .select<
      string
    >(`
      *,
      portfolio_items ( name, category ),
      plots ( name ),
      seasons ( id, name, type, year )
    `)
    .eq("user_id", u.id)
    .in("status", ["harvested", "closed", "sold"])
    .order("actual_harvest_date", { ascending: false })

  const cycles =
    (cyclesRaw as (CropCyclesRow & {
      portfolio_items: Pick<PortfolioItemsRow, "name" | "category"> | null
      plots: Pick<PlotsRow, "name"> | null
      seasons: Pick<SeasonsRow, "id" | "name" | "type" | "year"> | null
    })[] | null) ?? []

  return (
    <div className="max-w-5xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">📊 P&L report</h1>
      <p className="mt-1 text-sm text-gray-500">
        Season-wise and crop-wise profit and loss across your farm.
      </p>
      <div className="mt-6">
        <PnLReport cycles={cycles} />
      </div>
    </div>
  )
}

