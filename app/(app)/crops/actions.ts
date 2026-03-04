'use server'

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type {
  CropCycleTasksRow,
  CropCyclesRow,
  PortfolioItemsRow,
  SeasonsRow,
  UsersRow,
} from "@/lib/types/database.types"

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

// ─────────────────────────────────────────
// SEASONS
// ─────────────────────────────────────────
export async function addSeason(formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const insert: Partial<SeasonsRow> = {
    user_id: userId,
    name: (formData.get("name") as string) ?? "",
    type: (formData.get("type") as string) ?? "",
    year: parseInt((formData.get("year") as string) ?? "0", 10),
    start_date:
      ((formData.get("start_date") as string) || "").trim() || null,
    end_date: ((formData.get("end_date") as string) || "").trim() || null,
    notes: ((formData.get("notes") as string) || "").trim() || null,
  }

  const { error } = await supabase
    .from("seasons")
    // @ts-expect-error insert payload is compatible with SeasonsInsert
    .insert(insert)

  if (error) return { error: error.message }
  revalidatePath("/crops")
  return { success: true }
}

export async function updateSeasonRainfall(
  seasonId: string,
  rainfallMm: number,
) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("seasons")
    // @ts-expect-error update payload is compatible with SeasonsUpdate
    .update({ rainfall_mm: rainfallMm })
    .eq("id", seasonId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/crops")
  return { success: true }
}

// ─────────────────────────────────────────
// CROP CYCLES
// ─────────────────────────────────────────
export async function planCropCycle(formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const areaAcres = parseFloat((formData.get("area_acres") as string) ?? "0")
  const plotId = (formData.get("plot_id") as string) ?? ""
  const portfolioItemId = (formData.get("portfolio_item_id") as string) ?? ""
  const seasonId = (formData.get("season_id") as string) ?? ""
  const sowingDate = (formData.get("sowing_date") as string) ?? ""
  const durationDays = formData.get("duration_days")
    ? parseInt((formData.get("duration_days") as string) ?? "0", 10)
    : null

  let expectedHarvestDate =
    ((formData.get("expected_harvest_date") as string) || "").trim() || null

  if (!expectedHarvestDate && sowingDate && durationDays) {
    const sowing = new Date(sowingDate)
    sowing.setDate(sowing.getDate() + durationDays)
    expectedHarvestDate = sowing.toISOString().split("T")[0]
  }

  const insert: Partial<CropCyclesRow> = {
    user_id: userId,
    plot_id: plotId || null,
    season_id: seasonId,
    portfolio_item_id: portfolioItemId,
    area_acres: areaAcres,
    sowing_date: sowingDate || null,
    expected_harvest_date: expectedHarvestDate,
    seed_variety:
      ((formData.get("seed_variety") as string) || "").trim() || null,
    expected_yield_qtl: formData.get("expected_yield_qtl")
      ? parseFloat((formData.get("expected_yield_qtl") as string) ?? "0")
      : null,
    status: "planned",
  }

  const { data: cycleRaw, error } = await supabase
    .from("crop_cycles")
    // @ts-expect-error insert payload is compatible with CropCyclesInsert
    .insert(insert)
    .select()
    .single()

  if (error || !cycleRaw) return { error: error?.message ?? "Insert failed" }

  const cycle = cycleRaw as unknown as CropCyclesRow

  await generateStandardTasks(
    cycle.id,
    userId,
    portfolioItemId,
    sowingDate || null,
    durationDays,
  )

  revalidatePath(`/crops/${seasonId}`)
  return { success: true, cycleId: cycle.id }
}

export async function updateCropCycleStatus(
  cycleId: string,
  status: string,
  additionalData?: {
    actual_harvest_date?: string
    actual_yield_qtl?: number
  },
) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const update: Partial<CropCyclesRow> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (additionalData?.actual_harvest_date) {
    update.actual_harvest_date = additionalData.actual_harvest_date
  }
  if (typeof additionalData?.actual_yield_qtl === "number") {
    update.actual_yield_qtl = additionalData.actual_yield_qtl
  }

  const { error } = await supabase
    .from("crop_cycles")
    // @ts-expect-error update payload is compatible with CropCyclesUpdate
    .update(update)
    .eq("id", cycleId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/crops")
  return { success: true }
}

export async function updateCropCycle(cycleId: string, formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const update: Partial<CropCyclesRow> = {
    area_acres: parseFloat((formData.get("area_acres") as string) ?? "0"),
    sowing_date:
      ((formData.get("sowing_date") as string) || "").trim() || null,
    expected_harvest_date:
      ((formData.get("expected_harvest_date") as string) || "").trim() || null,
    actual_harvest_date:
      ((formData.get("actual_harvest_date") as string) || "").trim() || null,
    seed_variety:
      ((formData.get("seed_variety") as string) || "").trim() || null,
    expected_yield_qtl: formData.get("expected_yield_qtl")
      ? parseFloat((formData.get("expected_yield_qtl") as string) ?? "0")
      : null,
    actual_yield_qtl: formData.get("actual_yield_qtl")
      ? parseFloat((formData.get("actual_yield_qtl") as string) ?? "0")
      : null,
    notes: ((formData.get("notes") as string) || "").trim() || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("crop_cycles")
    // @ts-expect-error update payload is compatible with CropCyclesUpdate
    .update(update)
    .eq("id", cycleId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/crops")
  return { success: true }
}

export async function deleteCropCycle(cycleId: string, seasonId: string) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { data: cycleRaw } = await supabase
    .from("crop_cycles")
    .select("status, total_revenue")
    .eq("id", cycleId)
    .single()

  const cycle = cycleRaw as Pick<CropCyclesRow, "status" | "total_revenue"> | null

  if (cycle?.total_revenue && cycle.total_revenue > 0) {
    return { error: "Cannot delete a cycle that has recorded sales" }
  }

  const { error } = await supabase
    .from("crop_cycles")
    .delete()
    .eq("id", cycleId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath(`/crops/${seasonId}`)
  return { success: true }
}

// ─────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────
export async function addTask(cycleId: string, formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const insert: Partial<CropCycleTasksRow> = {
    crop_cycle_id: cycleId,
    user_id: userId,
    task_type: (formData.get("task_type") as string) ?? "",
    title: (formData.get("title") as string) ?? "",
    scheduled_date:
      ((formData.get("scheduled_date") as string) || "").trim() || null,
    cost: formData.get("cost")
      ? parseFloat((formData.get("cost") as string) ?? "0")
      : 0,
    notes: ((formData.get("notes") as string) || "").trim() || null,
    status: "pending",
  }

  const { error } = await supabase
    .from("crop_cycle_tasks")
    // @ts-expect-error insert payload is compatible with CropCycleTasksInsert
    .insert(insert)

  if (error) return { error: error.message }
  revalidatePath("/crops")
  return { success: true }
}

export async function completeTask(
  taskId: string,
  cycleId: string,
  actualCost?: number,
) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const update: Partial<CropCycleTasksRow> = {
    status: "done",
    completed_date: new Date().toISOString().split("T")[0],
  }
  if (typeof actualCost === "number") {
    update.cost = actualCost
  }

  const { error } = await supabase
    .from("crop_cycle_tasks")
    // @ts-expect-error update payload is compatible with CropCycleTasksUpdate
    .update(update)
    .eq("id", taskId)
    .eq("user_id", userId)

  if (error) return { error: error.message }

  await recalculateCycleCost(cycleId)

  revalidatePath("/crops")
  return { success: true }
}

export async function skipTask(taskId: string) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("crop_cycle_tasks")
    // @ts-expect-error update payload is compatible with CropCycleTasksUpdate
    .update({ status: "skipped" })
    .eq("id", taskId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/crops")
  return { success: true }
}

export async function deleteTask(taskId: string) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("crop_cycle_tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  revalidatePath("/crops")
  return { success: true }
}

// ─────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────

// Recalculate total input cost from all completed tasks
async function recalculateCycleCost(cycleId: string) {
  const supabase = createClient()

  const { data: tasksRaw } = await supabase
    .from("crop_cycle_tasks")
    .select("cost")
    .eq("crop_cycle_id", cycleId)
    .eq("status", "done")

  const tasks = (tasksRaw as Pick<CropCycleTasksRow, "cost">[] | null) ?? []

  const totalCost =
    tasks.reduce((sum, t) => sum + (t.cost ?? 0), 0) ?? 0

  await supabase
    .from("crop_cycles")
    // @ts-expect-error update payload is compatible with CropCyclesUpdate
    .update({
      total_input_cost: totalCost,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cycleId)
}

// Auto-generate standard farming tasks based on crop type
async function generateStandardTasks(
  cycleId: string,
  userId: string,
  portfolioItemId: string,
  sowingDate: string | null,
  durationDays: number | null,
) {
  const supabase = createClient()

  const { data: itemRaw } = await supabase
    .from("portfolio_items")
    .select("name, category, sub_category, duration_days")
    .eq("id", portfolioItemId)
    .single()

  if (!itemRaw || !sowingDate) return

  const item = itemRaw as Pick<
    PortfolioItemsRow,
    "name" | "category" | "sub_category" | "duration_days"
  >

  const sowing = new Date(sowingDate)
  const duration = durationDays || item.duration_days || 120

  const taskTemplates: Array<{
    task_type: string
    title: string
    offset_days: number
    notes?: string
  }> = []

  if (item.category === "crop") {
    const name = item.name.toLowerCase()

    taskTemplates.push(
      {
        task_type: "sowing",
        title: "Sowing / Planting",
        offset_days: 0,
        notes: "Record seed variety and seed rate",
      },
      {
        task_type: "other",
        title: "Germination check",
        offset_days: 10,
      },
      {
        task_type: "harvesting",
        title: "Harvest",
        offset_days: duration,
        notes: "Record actual yield in quintals",
      },
    )

    if (name.includes("tur") || name.includes("arhar")) {
      taskTemplates.push(
        {
          task_type: "fertilizing",
          title: "Basal fertilizer (DAP)",
          offset_days: 0,
        },
        {
          task_type: "spraying",
          title: "Weed control (first)",
          offset_days: 21,
        },
        {
          task_type: "spraying",
          title: "Pest spray — pod borer check",
          offset_days: 75,
        },
        {
          task_type: "fertilizing",
          title: "Top dressing — urea",
          offset_days: 30,
        },
        {
          task_type: "other",
          title: "Flower initiation check",
          offset_days: 60,
        },
      )
    }

    if (name.includes("wheat") || name.includes("gehu")) {
      taskTemplates.push(
        {
          task_type: "irrigation",
          title: "Crown root irrigation",
          offset_days: 21,
        },
        {
          task_type: "irrigation",
          title: "Tillering irrigation",
          offset_days: 42,
        },
        {
          task_type: "fertilizing",
          title: "Urea top dressing",
          offset_days: 21,
        },
        {
          task_type: "spraying",
          title: "Rust disease check + spray",
          offset_days: 60,
        },
      )
    }

    if (name.includes("jowar")) {
      taskTemplates.push(
        {
          task_type: "other",
          title: "Thinning",
          offset_days: 15,
        },
        {
          task_type: "fertilizing",
          title: "Nitrogen top dressing",
          offset_days: 30,
        },
        {
          task_type: "spraying",
          title: "Stem borer check",
          offset_days: 45,
        },
      )
    }

    if (name.includes("chana") || name.includes("gram")) {
      taskTemplates.push(
        {
          task_type: "spraying",
          title: "Wilt disease check",
          offset_days: 30,
        },
        {
          task_type: "spraying",
          title: "Pod borer spray",
          offset_days: 60,
        },
        {
          task_type: "other",
          title: "Moisture stress check",
          offset_days: 45,
        },
      )
    }

    if (name.includes("bajra")) {
      taskTemplates.push(
        {
          task_type: "other",
          title: "Thinning + gap filling",
          offset_days: 15,
        },
        {
          task_type: "fertilizing",
          title: "Urea top dressing",
          offset_days: 25,
        },
        {
          task_type: "spraying",
          title: "Downy mildew check",
          offset_days: 20,
        },
      )
    }
  }

  if (item.category === "horticulture") {
    taskTemplates.push(
      {
        task_type: "fertilizing",
        title: "Fertilizer application",
        offset_days: 0,
      },
      {
        task_type: "spraying",
        title: "Pest & disease spray",
        offset_days: 30,
      },
      {
        task_type: "other",
        title: "Pruning / training",
        offset_days: 60,
      },
      {
        task_type: "irrigation",
        title: "Irrigation check",
        offset_days: 14,
      },
      {
        task_type: "harvesting",
        title: "Harvest readiness check",
        offset_days: duration,
      },
    )
  }

  if (taskTemplates.length === 0) return

  const tasks: Partial<CropCycleTasksRow>[] = taskTemplates.map((t) => {
    const taskDate = new Date(sowing)
    taskDate.setDate(taskDate.getDate() + t.offset_days)
    return {
      crop_cycle_id: cycleId,
      user_id: userId,
      task_type: t.task_type,
      title: t.title,
      scheduled_date: taskDate.toISOString().split("T")[0],
      notes: t.notes ?? null,
      status: "pending",
      cost: 0,
    }
  })

  await supabase
    .from("crop_cycle_tasks")
    // @ts-expect-error insert payload is compatible with CropCycleTasksInsert
    .insert(tasks)
}

