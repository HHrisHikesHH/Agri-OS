'use server'

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type {
  CropCycleTasksRow,
  CropCyclesRow,
  PortfolioItemsRow,
  TransactionsRow,
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
// LOG A SALE
// ─────────────────────────────────────────
export async function logSale(formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const quantity = parseFloat((formData.get("quantity") as string) ?? "0")
  const pricePerUnit = parseFloat(
    (formData.get("price_per_unit") as string) ?? "0",
  )
  const totalAmount = quantity * pricePerUnit
  const saleDate = (formData.get("sale_date") as string) ?? ""
  const portfolioItemId = (formData.get("portfolio_item_id") as string) ?? ""
  const cropCycleId =
    ((formData.get("crop_cycle_id") as string) || "").trim() || null

  let marketPriceThatDay: number | null = null

  const { data: portfolioItemRaw } = await supabase
    .from("portfolio_items")
    .select("name, mandi_commodity_code")
    .eq("id", portfolioItemId)
    .single()

  const portfolioItem = portfolioItemRaw as
    | Pick<PortfolioItemsRow, "name" | "mandi_commodity_code">
    | null

  if (portfolioItem) {
    const { data: marketPriceRaw } = await supabase
      .from("market_prices")
      .select("modal_price")
      .ilike("commodity", portfolioItem.name)
      .eq("price_date", saleDate)
      .order("modal_price", { ascending: false })
      .limit(1)
      .maybeSingle()

    marketPriceThatDay =
      (marketPriceRaw as { modal_price: number } | null)?.modal_price ?? null
  }

  const priceVsMarket = marketPriceThatDay
    ? ((pricePerUnit - marketPriceThatDay) / marketPriceThatDay) * 100
    : null

  const { data: transactionRaw, error: txError } = await supabase
    .from("transactions")
    // @ts-expect-error insert payload conforms to TransactionsInsert
    .insert({
      user_id: userId,
      type: "income",
      category: "crop_sale",
      amount: totalAmount,
      date: saleDate,
      crop_cycle_id: cropCycleId,
      description: `Sale of ${
        portfolioItem?.name ?? "crop"
      } — ${quantity} ${formData.get("unit")} @ ₹${pricePerUnit}`,
      payment_method:
        ((formData.get("payment_method") as string) || "").trim() || "cash",
    })
    .select()
    .single()

  if (txError || !transactionRaw) return { error: txError?.message ?? "Error" }

  const transaction = transactionRaw as TransactionsRow

  const { error: saleError } = await supabase
    .from("sales")
    // @ts-expect-error insert payload conforms to SalesInsert
    .insert({
      user_id: userId,
      crop_cycle_id: cropCycleId,
      transaction_id: transaction.id,
      sale_date: saleDate,
      portfolio_item_id: portfolioItemId,
      quantity,
      unit: (formData.get("unit") as string) ?? "quintal",
      price_per_unit: pricePerUnit,
      total_amount: totalAmount,
      buyer_type:
        ((formData.get("buyer_type") as string) || "").trim() || "trader",
      buyer_name:
        ((formData.get("buyer_name") as string) || "").trim() || null,
      buyer_location:
        ((formData.get("buyer_location") as string) || "").trim() || null,
      channel:
        ((formData.get("channel") as string) || "").trim() || "local_mandi",
      market_price_that_day: marketPriceThatDay,
      price_vs_market: priceVsMarket,
      notes: ((formData.get("notes") as string) || "").trim() || null,
    })

  if (saleError) return { error: saleError.message }

  if (cropCycleId) {
    await updateCycleFinancials(cropCycleId)
  }

  revalidatePath("/finances")
  revalidatePath("/finances/sales")
  revalidatePath("/dashboard")

  return { success: true, totalAmount, priceVsMarket }
}

// ─────────────────────────────────────────
// LOG AN EXPENSE
// ─────────────────────────────────────────
export async function logExpense(formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const amount = parseFloat((formData.get("amount") as string) ?? "0")
  const cropCycleId =
    ((formData.get("crop_cycle_id") as string) || "").trim() || null
  const category = (formData.get("category") as string) ?? "other"
  const inputType = (formData.get("input_type") as string) ?? ""
  const isInputPurchase = ["seed", "fertilizer", "pesticide", "herbicide"].includes(
    inputType,
  )

  const { data: transactionRaw, error: txError } = await supabase
    .from("transactions")
    // @ts-expect-error insert payload conforms to TransactionsInsert
    .insert({
      user_id: userId,
      type: "expense",
      category,
      amount,
      date: (formData.get("date") as string) ?? "",
      crop_cycle_id: cropCycleId,
      description:
        ((formData.get("description") as string) || "").trim() || null,
      payment_method:
        ((formData.get("payment_method") as string) || "").trim() || "cash",
    })
    .select()
    .single()

  if (txError || !transactionRaw) {
    return { error: txError?.message ?? "Error" }
  }

  const transaction = transactionRaw as TransactionsRow

  if (isInputPurchase && cropCycleId) {
    const qty = formData.get("quantity")
      ? parseFloat((formData.get("quantity") as string) ?? "0")
      : null
    const pricePerUnit = qty ? amount / qty : null

    await supabase
      .from("input_purchases")
      // @ts-expect-error insert payload conforms to InputPurchasesInsert
      .insert({
        user_id: userId,
        crop_cycle_id: cropCycleId,
        transaction_id: transaction.id,
        input_type: inputType,
        product_name:
          ((formData.get("product_name") as string) || "").trim() || null,
        quantity: qty,
        unit: ((formData.get("unit") as string) || "").trim() || null,
        price_per_unit: pricePerUnit,
        total_cost: amount,
        supplier:
          ((formData.get("supplier") as string) || "").trim() || null,
        purchase_date: (formData.get("date") as string) ?? "",
      })
  }

  if (cropCycleId) {
    await updateCycleFinancials(cropCycleId)
  }

  revalidatePath("/finances")
  revalidatePath("/finances/expenses")
  revalidatePath("/dashboard")
  return { success: true }
}

// ─────────────────────────────────────────
// UPDATE SALE
// ─────────────────────────────────────────
export async function updateSale(saleId: string, formData: FormData) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const quantity = parseFloat((formData.get("quantity") as string) ?? "0")
  const pricePerUnit = parseFloat(
    (formData.get("price_per_unit") as string) ?? "0",
  )
  const totalAmount = quantity * pricePerUnit

  const { data: saleRaw, error: saleError } = await supabase
    .from("sales")
    // @ts-expect-error update payload conforms to SalesUpdate
    .update({
      quantity,
      price_per_unit: pricePerUnit,
      total_amount: totalAmount,
      buyer_type: (formData.get("buyer_type") as string) ?? "trader",
      buyer_name:
        ((formData.get("buyer_name") as string) || "").trim() || null,
      buyer_location:
        ((formData.get("buyer_location") as string) || "").trim() || null,
      channel: (formData.get("channel") as string) ?? "local_mandi",
      notes: ((formData.get("notes") as string) || "").trim() || null,
    })
    .eq("id", saleId)
    .eq("user_id", userId)
    .select("transaction_id, crop_cycle_id")
    .single()

  if (saleError || !saleRaw) return { error: saleError?.message ?? "Error" }

  const sale = saleRaw as { transaction_id: string | null; crop_cycle_id: string | null }

  if (sale.transaction_id) {
    await supabase
      .from("transactions")
      // @ts-expect-error update payload conforms to TransactionsUpdate
      .update({ amount: totalAmount })
      .eq("id", sale.transaction_id)
  }

  if (sale.crop_cycle_id) {
    await updateCycleFinancials(sale.crop_cycle_id)
  }

  revalidatePath("/finances")
  revalidatePath("/finances/sales")
  revalidatePath("/dashboard")
  return { success: true }
}

// ─────────────────────────────────────────
// DELETE TRANSACTION
// ─────────────────────────────────────────
export async function deleteTransaction(transactionId: string) {
  const supabase = createClient()
  const userId = await getUserId()
  if (!userId) return { error: "Not authenticated" }

  const { data: txRaw } = await supabase
    .from("transactions")
    .select("crop_cycle_id")
    .eq("id", transactionId)
    .single()

  const tx = txRaw as Pick<TransactionsRow, "crop_cycle_id"> | null

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId)

  if (error) return { error: error.message }

  if (tx?.crop_cycle_id) {
    await updateCycleFinancials(tx.crop_cycle_id)
  }

  revalidatePath("/finances")
  revalidatePath("/finances/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}

// ─────────────────────────────────────────
// INTERNAL: Recalculate crop cycle financials
// ─────────────────────────────────────────
async function updateCycleFinancials(cycleId: string) {
  const supabase = createClient()

  const { data: transactionsRaw } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("crop_cycle_id", cycleId)

  const transactions =
    (transactionsRaw as Pick<TransactionsRow, "type" | "amount">[] | null) ??
    []

  const totalRevenue =
    transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0

  const totalCostFromTransactions =
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0

  const { data: tasksRaw } = await supabase
    .from("crop_cycle_tasks")
    .select("cost")
    .eq("crop_cycle_id", cycleId)
    .eq("status", "done")

  const tasks =
    (tasksRaw as Pick<CropCycleTasksRow, "cost">[] | null) ?? []

  const taskCost =
    tasks.reduce((sum, t) => sum + (t.cost ?? 0), 0) ?? 0

  const totalInputCost = totalCostFromTransactions + taskCost
  const netProfit = totalRevenue - totalInputCost

  const { data: cycleRaw } = await supabase
    .from("crop_cycles")
    .select("area_acres")
    .eq("id", cycleId)
    .single()

  const cycle = cycleRaw as Pick<CropCyclesRow, "area_acres"> | null

  const profitPerAcre = cycle?.area_acres
    ? netProfit / cycle.area_acres
    : 0

  await supabase
    .from("crop_cycles")
    // @ts-expect-error update payload conforms to CropCyclesUpdate
    .update({
      total_revenue: totalRevenue,
      total_input_cost: totalInputCost,
      net_profit: netProfit,
      profit_per_acre: profitPerAcre,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cycleId)
}

