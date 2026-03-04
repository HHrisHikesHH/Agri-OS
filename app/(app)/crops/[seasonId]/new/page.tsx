import { redirect } from "next/navigation"

import { PlanCropCycleForm } from "@/components/crops/PlanCropCycleForm"
import { createClient } from "@/lib/supabase/server"
import type { UsersRow } from "@/lib/types/database.types"

interface NewCyclePageProps {
  params: { seasonId: string }
}

export default async function NewCropCyclePage({
  params,
}: NewCyclePageProps) {
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

  const [{ data: plots }, { data: portfolioItems }] = await Promise.all([
    supabase
      .from("plots")
      .select("id, name, area_acres, soil_type")
      .eq("user_id", u.id)
      .eq("is_active", true),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", u.id)
      .eq("is_active", true),
  ])

  return (
    <div className="max-w-4xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">
        Plan a new crop cycle
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Choose what to grow, where to grow it, and how you expect the season to
        go.
      </p>
      <div className="mt-6">
        <PlanCropCycleForm
          seasonId={params.seasonId}
          plots={plots ?? []}
          portfolioItems={portfolioItems ?? []}
        />
      </div>
    </div>
  )
}

