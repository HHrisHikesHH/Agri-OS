import { redirect } from "next/navigation"

import { FinancialOverview } from "@/components/finances/FinancialOverview"
import { createClient } from "@/lib/supabase/server"
import type {
  CropCyclesRow,
  PortfolioItemsRow,
  SeasonsRow,
  TransactionsRow,
} from "@/lib/types/database.types"

export default async function FinancesPage() {
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
  const currentYear = new Date().getFullYear()
  const yearStart = `${currentYear}-01-01`

  const [
    { data: allTransactionsRaw },
    { data: recentSalesRaw },
    { data: activeCyclesRaw },
    { data: seasonsRaw },
    { data: portfolioItemsRaw },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("type, amount, date, category")
      .eq("user_id", user.id)
      .gte("date", yearStart),
    supabase
      .from("sales")
      .select<
        string
      >(`
        *,
        portfolio_items ( name )
      `)
      .eq("user_id", user.id)
      .order("sale_date", { ascending: false })
      .limit(5),
    supabase
      .from("crop_cycles")
      .select<
        string
      >(`
        id, status, net_profit, total_revenue,
        total_input_cost, profit_per_acre, area_acres,
        portfolio_items ( name )
      `)
      .eq("user_id", user.id)
      .in("status", ["growing", "harvested", "sowing"]),
    supabase
      .from("seasons")
      .select("id, name, type, year")
      .eq("user_id", user.id)
      .order("year", { ascending: false })
      .limit(4),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true),
  ])

  const allTransactions =
    (allTransactionsRaw as TransactionsRow[] | null) ?? []
  const recentSales = recentSalesRaw ?? []
  const activeCycles =
    (activeCyclesRaw as (CropCyclesRow & {
      portfolio_items: Pick<PortfolioItemsRow, "name"> | null
    })[] | null) ?? []
  const seasons = (seasonsRaw as SeasonsRow[] | null) ?? []
  const portfolioItems = (portfolioItemsRaw as PortfolioItemsRow[] | null) ?? []

  return (
    <div className="max-w-5xl p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      <FinancialOverview
        currentYear={currentYear}
        transactions={allTransactions}
        recentSales={recentSales}
        activeCycles={activeCycles}
        seasons={seasons}
        portfolioItems={portfolioItems}
      />
    </div>
  )
}

