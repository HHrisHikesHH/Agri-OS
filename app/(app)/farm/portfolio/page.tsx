import { redirect } from "next/navigation"

import { PortfolioList } from "@/components/farm/portfolio/PortfolioList"
import { createClient } from "@/lib/supabase/server"

export default async function PortfolioPage() {
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

  const { data: portfolio } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("user_id", userRow.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  return (
    <div className="max-w-4xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">Crop & tree portfolio</h1>
      <p className="mt-1 text-sm text-gray-600">
        Tell Agri OS everything you grow so it can reason about seasons, risk,
        and market opportunities.
      </p>
      <div className="mt-6">
        <PortfolioList items={portfolio ?? []} />
      </div>
    </div>
  )
}

