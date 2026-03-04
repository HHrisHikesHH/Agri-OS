import { redirect } from "next/navigation"

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { createClient } from "@/lib/supabase/server"
import type { UsersRow } from "@/lib/types/database.types"

import { completeOnboarding } from "./actions"

export default async function OnboardingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: userDataRaw } = await supabase
    .from("users")
    .select("onboarding_done")
    .eq("auth_id", user.id)
    .maybeSingle()

  const userData = userDataRaw as UsersRow | null

  if (userData?.onboarding_done) {
    redirect("/dashboard")
  }

  return <OnboardingWizard onComplete={completeOnboarding} />
}

