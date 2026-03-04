import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { PlotsList } from "@/components/farm/plots/PlotsList"
import type { UsersRow } from "@/lib/types/database.types"

export default async function PlotsPage() {
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

  const { data: plots } = await supabase
    .from("plots")
    .select(
      `
      *,
      water_sources (*)
    `,
    )
    .eq("user_id", u.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  return (
    <div className="max-w-4xl p-4 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Land plots</h1>
          <p className="mt-1 text-sm text-gray-600">
            Map each distinct land parcel so Agri OS can reason per plot.
          </p>
        </div>
        <Link
          href="/farm/plots/new"
          className="hidden rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-800 md:inline-flex"
        >
          + Add plot
        </Link>
      </div>

      <div className="mt-4 md:hidden">
        <Link
          href="/farm/plots/new"
          className="flex w-full items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-800"
        >
          + Add plot
        </Link>
      </div>

      <div className="mt-6">
        <PlotsList plots={plots ?? []} />
      </div>
    </div>
  )
}

