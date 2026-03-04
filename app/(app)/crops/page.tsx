import { redirect } from "next/navigation"

import { SeasonsOverview } from "@/components/crops/SeasonsOverview"
import { createClient } from "@/lib/supabase/server"
import type { UsersRow } from "@/lib/types/database.types"

export default async function CropsPage() {
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

  const { data: seasonsRaw } = await supabase
    .from("seasons")
    .select<
      string
    >(`
      *,
      crop_cycles (
        id,
        status,
        area_acres,
        net_profit,
        portfolio_items ( name, category )
      )
    `)
    .eq("user_id", u.id)
    .order("year", { ascending: false })
    .order("type", { ascending: true })

  return (
    <div className="max-w-4xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-800">🌾 Crop seasons</h1>
          <p className="mt-1 text-gray-500">
            Plan and track your crop cycles season by season.
          </p>
        </div>
      </div>
      <SeasonsOverview seasons={seasonsRaw ?? []} />
    </div>
  )
}

