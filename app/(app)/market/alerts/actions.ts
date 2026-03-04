'use server'

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { UsersRow } from "@/lib/types/database.types"

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
  return (data as UsersRow | null)?.id ?? null
}

export async function addPriceAlert(formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const thresholdRaw = (formData.get(
    "threshold_value",
  ) as string) ?? "0"
  const threshold = parseFloat(thresholdRaw)

  const { error } = await supabase
    .from("price_alerts")
    // @ts-expect-error payload matches PriceAlertsInsert
    .insert({
      user_id: userId,
      portfolio_item_id: formData.get(
        "portfolio_item_id",
      ) as string,
      alert_type: formData.get("alert_type") as string,
      threshold_value: threshold,
      created_by: "user",
      is_active: true,
    })

  if (error) return { error: error.message }
  revalidatePath("/market/alerts")
  revalidatePath("/market")
  return { success: true }
}

export async function deletePriceAlert(alertId: string) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("price_alerts")
    // @ts-expect-error payload matches PriceAlertsUpdate
    .update({ is_active: false })
    .eq("id", alertId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/market/alerts")
  revalidatePath("/market")
  return { success: true }
}

export async function markAlertRead(alertId: string) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  await supabase
    .from("agent_alerts")
    // @ts-expect-error payload matches AgentAlertsUpdate
    .update({ is_read: true })
    .eq("id", alertId)
    .eq("user_id", userId)

  revalidatePath("/market")
  return { success: true }
}

