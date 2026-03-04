'use server'

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export interface OnboardingData {
  // Step 1
  name: string
  phone: string
  language: string
  // Step 2
  village: string
  taluk: string
  district: string
  state: string
  // Step 3
  total_acres: number
  soil_types: string[]
  water_status: string
  capital_status: string
  // Step 4
  portfolio: Array<{
    name: string
    local_name?: string
    category: string
    sub_category?: string
    tree_count?: number
    tree_age_years?: number
    bearing_status?: boolean
    water_requirement?: string
    typical_season?: string[]
  }>
  // Step 5
  primary_goal: string
  risk_appetite: string
  year1_target_revenue?: number
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = createClient()

  const {
    data: { user },
    error: userErrorAuth,
  } = await supabase.auth.getUser()

  if (userErrorAuth || !user) {
    return { error: "Not authenticated" }
  }

  const {
    data: newUser,
    error: userError,
  } = await supabase
    .from("users")
    // @ts-expect-error Supabase client is correctly typed; inference from @supabase/ssr is too narrow here
    .insert({
      auth_id: user.id,
      name: data.name,
      phone: data.phone,
      email: user.email ?? null,
      language: data.language,
      onboarding_done: false,
    })
    .select()
    .single()

  if (userError || !newUser) {
    return { error: userError?.message ?? "Failed to create user profile" }
  }

  const createdUser = newUser as unknown as { id: string }

  const { data: farmProfile, error: profileError } = await supabase
    .from("farm_profiles")
    // @ts-expect-error Supabase client is correctly typed; inference from @supabase/ssr is too narrow here
    .insert({
      user_id: createdUser.id,
      village: data.village,
      taluk: data.taluk,
      district: data.district,
      state: data.state,
      total_acres: data.total_acres,
      soil_types: data.soil_types,
      water_status: data.water_status,
      capital_status: data.capital_status,
      primary_goal: data.primary_goal,
      risk_appetite: data.risk_appetite,
      year1_target_revenue: data.year1_target_revenue ?? null,
    })
    .select()
    .single()

  if (profileError || !farmProfile) {
    return { error: profileError?.message ?? "Failed to create farm profile" }
  }

  if (data.portfolio.length > 0) {
    const portfolioRows = data.portfolio.map((item) => ({
      user_id: createdUser.id,
      ...item,
    }))
    const { error: portfolioError } = await supabase
      .from("portfolio_items")
      // @ts-expect-error Supabase client is correctly typed; inference from @supabase/ssr is too narrow here
      .insert(portfolioRows)

    if (portfolioError) {
      return { error: portfolioError.message }
    }
  }

  const currentYear = new Date().getFullYear()

  await supabase
    .from("seasons")
    // @ts-expect-error Supabase client is correctly typed; inference from @supabase/ssr is too narrow here
    .insert([
      {
        user_id: createdUser.id,
        name: `Kharif ${currentYear}`,
        type: "kharif",
        year: currentYear,
        start_date: `${currentYear}-06-01`,
        end_date: `${currentYear}-10-31`,
      },
      {
        user_id: createdUser.id,
        name: `Rabi ${currentYear}-${currentYear + 1}`,
        type: "rabi",
        year: currentYear,
        start_date: `${currentYear}-11-01`,
        end_date: `${currentYear + 1}-03-31`,
      },
    ])

  await supabase
    .from("assets")
    // @ts-expect-error Supabase client is correctly typed; inference from @supabase/ssr is too narrow here
    .insert([
      {
        user_id: createdUser.id,
        name: "Tractor",
        category: "vehicle",
        ownership: "owned",
        condition: "good",
        can_rent_out: true,
      },
      {
        user_id: createdUser.id,
        name: "Storage Shed",
        category: "storage",
        ownership: "owned",
        condition: "good",
      },
    ])

  await supabase
    .from("agent_context_cache")
    // @ts-expect-error Supabase client is correctly typed; inference from @supabase/ssr is too narrow here
    .insert({
      user_id: createdUser.id,
    })

  await supabase
    .from("users")
    // @ts-expect-error Supabase client is correctly typed; inference from @supabase/ssr is too narrow here
    .update({ onboarding_done: true })
    .eq("id", createdUser.id)

  redirect("/dashboard")
}

