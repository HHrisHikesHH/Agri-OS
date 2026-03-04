import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { UsersRow } from "@/lib/types/database.types"

export default async function Home() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userDataRaw } = await supabase
    .from("users")
    .select("onboarding_done")
    .eq("auth_id", user.id)
    .maybeSingle()

  const userData = userDataRaw as UsersRow | null

  if (!userData || !userData.onboarding_done) {
    redirect("/onboarding")
  }

  redirect("/dashboard")
}

