'use server'

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

// ─────────────────────────────────────────
// HELPER: get current user's DB id
// ─────────────────────────────────────────
async function getUserId(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single()

  const row = data as { id: string } | null
  return row?.id ?? null
}

// ─────────────────────────────────────────
// PLOTS
// ─────────────────────────────────────────
export async function addPlot(formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { data: farmProfile } = await supabase
    .from("farm_profiles")
    .select("id")
    .eq("user_id", userId)
    .single()

  const { error } = await supabase
    .from("plots")
    // @ts-expect-error Supabase client typing is narrower than our inferred insert payload.
    .insert({
      user_id: userId,
      farm_profile_id: (farmProfile as { id: string } | null)?.id ?? null,
      name: (formData.get("name") as string) ?? "",
      area_acres: parseFloat((formData.get("area_acres") as string) ?? "0"),
      ownership: (formData.get("ownership") as string) ?? "owned",
      soil_type: (formData.get("soil_type") as string) ?? null,
      terrain: (formData.get("terrain") as string) ?? null,
      irrigation_type: (formData.get("irrigation_type") as string) ?? null,
      notes: ((formData.get("notes") as string) || "").trim() || null,
    })

  if (error) return { error: error.message }
  revalidatePath("/farm/plots")
  revalidatePath("/farm")
  return { success: true }
}

export async function updatePlot(plotId: string, formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("plots")
    // @ts-expect-error Supabase client typing is narrower than our inferred update payload.
    .update({
      name: (formData.get("name") as string) ?? "",
      area_acres: parseFloat((formData.get("area_acres") as string) ?? "0"),
      ownership: (formData.get("ownership") as string) ?? "owned",
      soil_type: (formData.get("soil_type") as string) ?? null,
      terrain: (formData.get("terrain") as string) ?? null,
      irrigation_type: (formData.get("irrigation_type") as string) ?? null,
      notes: ((formData.get("notes") as string) || "").trim() || null,
    })
    .eq("id", plotId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/farm/plots")
  revalidatePath(`/farm/plots/${plotId}`)
  revalidatePath("/farm")
  return { success: true }
}

export async function deletePlot(plotId: string) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("plots")
    // Soft delete
    // @ts-expect-error Supabase client typing is narrower than our inferred update payload.
    .update({ is_active: false })
    .eq("id", plotId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/farm/plots")
  revalidatePath("/farm")
  return { success: true }
}

// ─────────────────────────────────────────
// WATER SOURCES
// ─────────────────────────────────────────
export async function addWaterSource(plotId: string, formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const monthsRaw = (formData.get("availability_months") as string) ?? ""
  const availabilityMonths =
    monthsRaw.trim().length > 0
      ? monthsRaw
          .split(",")
          .map((m) => parseInt(m.trim(), 10))
          .filter((n) => !Number.isNaN(n))
      : null

  const { error } = await supabase
    .from("water_sources")
    // @ts-expect-error Supabase client typing is narrower than our inferred insert payload.
    .insert({
      user_id: userId,
      plot_id: plotId,
      type: (formData.get("type") as string) ?? null,
      reliability: (formData.get("reliability") as string) ?? null,
      depth_ft: formData.get("depth_ft")
        ? parseInt(formData.get("depth_ft") as string, 10)
        : null,
      motor_hp: formData.get("motor_hp")
        ? parseFloat(formData.get("motor_hp") as string)
        : null,
      availability_months: availabilityMonths,
      notes: ((formData.get("notes") as string) || "").trim() || null,
    })

  if (error) return { error: error.message }
  revalidatePath(`/farm/plots/${plotId}`)
  return { success: true }
}

export async function deleteWaterSource(sourceId: string, plotId: string) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("water_sources")
    .delete()
    .eq("id", sourceId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath(`/farm/plots/${plotId}`)
  return { success: true }
}

// ─────────────────────────────────────────
// ASSETS
// ─────────────────────────────────────────
export async function addAsset(formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("assets")
    // @ts-expect-error Supabase client typing is narrower than our inferred insert payload.
    .insert({
      user_id: userId,
      name: (formData.get("name") as string) ?? "",
      category: (formData.get("category") as string) ?? "",
      ownership: (formData.get("ownership") as string) ?? "owned",
      purchase_year: formData.get("purchase_year")
        ? parseInt(formData.get("purchase_year") as string, 10)
        : null,
      purchase_cost: formData.get("purchase_cost")
        ? parseFloat(formData.get("purchase_cost") as string)
        : null,
      current_value: formData.get("current_value")
        ? parseFloat(formData.get("current_value") as string)
        : null,
      condition: (formData.get("condition") as string) ?? "good",
      can_rent_out: (formData.get("can_rent_out") as string) === "true",
      rental_rate: formData.get("rental_rate")
        ? parseFloat(formData.get("rental_rate") as string)
        : null,
      notes: ((formData.get("notes") as string) || "").trim() || null,
    })

  if (error) return { error: error.message }
  revalidatePath("/farm/assets")
  revalidatePath("/farm")
  return { success: true }
}

export async function updateAsset(assetId: string, formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("assets")
    // @ts-expect-error Supabase client typing is narrower than our inferred update payload.
    .update({
      name: (formData.get("name") as string) ?? "",
      category: (formData.get("category") as string) ?? "",
      ownership: (formData.get("ownership") as string) ?? "owned",
      condition: (formData.get("condition") as string) ?? "good",
      current_value: formData.get("current_value")
        ? parseFloat(formData.get("current_value") as string)
        : null,
      can_rent_out: (formData.get("can_rent_out") as string) === "true",
      rental_rate: formData.get("rental_rate")
        ? parseFloat(formData.get("rental_rate") as string)
        : null,
      notes: ((formData.get("notes") as string) || "").trim() || null,
    })
    .eq("id", assetId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/farm/assets")
  revalidatePath("/farm")
  return { success: true }
}

export async function deleteAsset(assetId: string) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("assets")
    .delete()
    .eq("id", assetId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/farm/assets")
  revalidatePath("/farm")
  return { success: true }
}

// ─────────────────────────────────────────
// PORTFOLIO ITEMS
// ─────────────────────────────────────────
export async function addPortfolioItem(formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const seasonsRaw = (formData.get("typical_season") as string) ?? ""
  const typicalSeason =
    seasonsRaw.trim().length > 0
      ? seasonsRaw.split(",").map((s) => s.trim())
      : null

  const { error } = await supabase
    .from("portfolio_items")
    // @ts-expect-error Supabase client typing is narrower than our inferred insert payload.
    .insert({
      user_id: userId,
      name: (formData.get("name") as string) ?? "",
      local_name: ((formData.get("local_name") as string) || "").trim() || null,
      category: (formData.get("category") as string) ?? "crop",
      sub_category:
        ((formData.get("sub_category") as string) || "").trim() || null,
      typical_season: typicalSeason,
      duration_days: formData.get("duration_days")
        ? parseInt(formData.get("duration_days") as string, 10)
        : null,
      water_requirement:
        ((formData.get("water_requirement") as string) || "").trim() || null,
      tree_count: formData.get("tree_count")
        ? parseInt(formData.get("tree_count") as string, 10)
        : null,
      tree_age_years: formData.get("tree_age_years")
        ? parseInt(formData.get("tree_age_years") as string, 10)
        : null,
      bearing_status: (formData.get("bearing_status") as string) === "true",
      price_unit:
        ((formData.get("price_unit") as string) || "").trim() || "quintal",
    })

  if (error) return { error: error.message }
  revalidatePath("/farm/portfolio")
  revalidatePath("/farm")
  return { success: true }
}

export async function updatePortfolioItem(itemId: string, formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const seasonsRaw = (formData.get("typical_season") as string) ?? ""
  const typicalSeason =
    seasonsRaw.trim().length > 0
      ? seasonsRaw.split(",").map((s) => s.trim())
      : null

  const { error } = await supabase
    .from("portfolio_items")
    // @ts-expect-error Supabase client typing is narrower than our inferred update payload.
    .update({
      name: (formData.get("name") as string) ?? "",
      local_name: ((formData.get("local_name") as string) || "").trim() || null,
      category: (formData.get("category") as string) ?? "crop",
      sub_category:
        ((formData.get("sub_category") as string) || "").trim() || null,
      typical_season: typicalSeason,
      duration_days: formData.get("duration_days")
        ? parseInt(formData.get("duration_days") as string, 10)
        : null,
      water_requirement:
        ((formData.get("water_requirement") as string) || "").trim() || null,
      tree_count: formData.get("tree_count")
        ? parseInt(formData.get("tree_count") as string, 10)
        : null,
      tree_age_years: formData.get("tree_age_years")
        ? parseInt(formData.get("tree_age_years") as string, 10)
        : null,
      bearing_status: (formData.get("bearing_status") as string) === "true",
      price_unit:
        ((formData.get("price_unit") as string) || "").trim() || "quintal",
      is_active: (formData.get("is_active") as string) !== "false",
    })
    .eq("id", itemId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/farm/portfolio")
  revalidatePath("/farm")
  return { success: true }
}

export async function deletePortfolioItem(itemId: string) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("portfolio_items")
    // Soft delete
    // @ts-expect-error Supabase client typing is narrower than our inferred update payload.
    .update({ is_active: false })
    .eq("id", itemId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/farm/portfolio")
  revalidatePath("/farm")
  return { success: true }
}

