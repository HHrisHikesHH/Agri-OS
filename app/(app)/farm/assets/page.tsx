import { redirect } from "next/navigation"

import { AssetsList } from "@/components/farm/assets/AssetsList"
import { createClient } from "@/lib/supabase/server"

export default async function AssetsPage() {
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

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", userRow.id)
    .order("created_at", { ascending: true })

  return (
    <div className="max-w-4xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800">Farm assets</h1>
      <p className="mt-1 text-sm text-gray-600">
        Track tractors, storage, machinery and tools that power your farm.
      </p>

      <div className="mt-6">
        <AssetsList assets={assets ?? []} />
      </div>
    </div>
  )
}

