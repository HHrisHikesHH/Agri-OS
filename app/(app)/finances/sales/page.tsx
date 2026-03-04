import { redirect } from "next/navigation"

import { SaleCard } from "@/components/finances/SaleCard"
import { createClient } from "@/lib/supabase/server"
import { formatINR } from "@/lib/utils/currency"
import type {
  PortfolioItemsRow,
  SalesRow,
  UsersRow,
} from "@/lib/types/database.types"

export default async function SalesPage() {
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
  const u = userRow as UsersRow

  const { data: salesRaw } = await supabase
    .from("sales")
    .select<
      string
    >(`
      *,
      portfolio_items ( name )
    `)
    .eq("user_id", u.id)
    .order("sale_date", { ascending: false })

  const sales =
    (salesRaw as (SalesRow & {
      portfolio_items: Pick<PortfolioItemsRow, "name"> | null
    })[] | null) ?? []

  const totalSeasonSales =
    sales.reduce((sum, s) => sum + (s.total_amount ?? 0), 0) ?? 0

  const withMarket = sales.filter(
    (s) => typeof s.price_vs_market === "number",
  )
  const avgVsMarket =
    withMarket.length > 0
      ? withMarket.reduce((sum, s) => sum + (s.price_vs_market ?? 0), 0) /
        withMarket.length
      : null

  const bestSale =
    withMarket.length > 0
      ? withMarket.reduce((best, s) =>
          (s.price_vs_market ?? 0) > (best.price_vs_market ?? 0) ? s : best,
        withMarket[0])
      : null

  const worstSale =
    withMarket.length > 0
      ? withMarket.reduce((worst, s) =>
          (s.price_vs_market ?? 0) < (worst.price_vs_market ?? 0)
            ? s
            : worst,
        withMarket[0])
      : null

  return (
    <div className="max-w-5xl p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">
        📜 Sales log
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        See how your selling decisions compare to the market.
      </p>

      <section className="mt-6 grid gap-4 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 text-sm shadow-sm dark:shadow-gray-950 md:grid-cols-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Total sales recorded
          </p>
          <p className="mt-1 text-lg font-bold text-green-800 dark:text-green-400">
            {formatINR(totalSeasonSales)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Average vs market
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
            {avgVsMarket != null
              ? `${avgVsMarket >= 0 ? "+" : ""}${avgVsMarket.toFixed(1)}%`
              : "No market data"}
          </p>
        </div>
        <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
          {bestSale && (
            <p>
              Best sale:{" "}
              <strong>{bestSale.portfolio_items?.name ?? "Crop"}</strong> on{" "}
              {bestSale.sale_date} —{" "}
              {bestSale.price_vs_market?.toFixed(1)}% above market
            </p>
          )}
          {worstSale && (
            <p>
              Worst sale:{" "}
              <strong>{worstSale.portfolio_items?.name ?? "Crop"}</strong> on{" "}
              {worstSale.sale_date} —{" "}
              {worstSale.price_vs_market?.toFixed(1)}% below market
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold text-green-800 dark:text-green-400">
          All sales
        </h2>
        {sales.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
            No sales recorded yet.
          </p>
        ) : (
          sales.map((sale) => (
            <SaleCard key={sale.id} sale={sale} />
          ))
        )}
      </section>
    </div>
  )
}

