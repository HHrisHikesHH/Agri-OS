"use client"

import { useState } from "react"

import type {
  CropCyclesRow,
  PortfolioItemsRow,
  SeasonsRow,
  TransactionsRow,
} from "@/lib/types/database.types"
import { formatINR, profitBg, profitColor } from "@/lib/utils/currency"
import { AnimatedINR, AnimatedNumber } from "@/components/ui/AnimatedNumber"
import { PressButton } from "@/components/ui/PressButton"
import { SpringCard } from "@/components/ui/SpringCard"

import { AddExpenseForm } from "./AddExpenseForm"
import { AddSaleForm } from "./AddSaleForm"

type FinancialOverviewProps = {
  currentYear: number
  transactions: TransactionsRow[]
  recentSales: {
    id: string
    sale_date: string
    quantity: number | null
    unit: string | null
    total_amount: number | null
    price_vs_market: number | null
    portfolio_items?: { name: string } | null
  }[]
  activeCycles: (CropCyclesRow & { portfolio_items: { name: string } | null })[]
  seasons: SeasonsRow[]
  portfolioItems: PortfolioItemsRow[]
}

export function FinancialOverview({
  currentYear,
  transactions,
  recentSales,
  activeCycles,
  portfolioItems,
}: FinancialOverviewProps) {
  const [showSaleForm, setShowSaleForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const totalRevenue =
    transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0

  const totalExpenses =
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0

  const netProfit = totalRevenue - totalExpenses

  return (
    <>
      <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">
        💰 Finances
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Track every rupee in and out of your farm.
      </p>

      {/* Year summary bar */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard
          label={`${currentYear} Revenue`}
          value={totalRevenue}
          color="green"
          icon="📈"
        />
        <SummaryCard
          label={`${currentYear} Expenses`}
          value={totalExpenses}
          color="red"
          icon="📉"
        />
        <SummaryCard
          label="Net profit"
          value={netProfit}
          color={netProfit >= 0 ? "green" : "red"}
          icon={netProfit >= 0 ? "✅" : "⚠️"}
        />
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <PressButton
          size="sm"
          variant="primary"
          onClick={() => setShowSaleForm(true)}
          className="font-mono"
        >
          + Log sale
        </PressButton>
        <PressButton
          size="sm"
          variant="secondary"
          onClick={() => setShowExpenseForm(true)}
          className="font-mono"
        >
          + Log expense
        </PressButton>
      </div>

      {showSaleForm && (
        <SpringCard className="mt-6 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-green-800 dark:text-green-400">
              Log a sale
            </h2>
            <button
              type="button"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setShowSaleForm(false)}
            >
              Close
            </button>
          </div>
          <AddSaleForm
            portfolioItems={portfolioItems}
            cycles={activeCycles}
          />
        </SpringCard>
      )}

      {showExpenseForm && (
        <SpringCard className="mt-6 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-green-800 dark:text-green-400">
              Log an expense
            </h2>
            <button
              type="button"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setShowExpenseForm(false)}
            >
              Close
            </button>
          </div>
          <AddExpenseForm cycles={activeCycles} />
        </SpringCard>
      )}

      {/* Active cycles P&L */}
      {activeCycles.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold text-green-800 dark:text-green-400">
            Active crop P&amp;L
          </h2>
          {activeCycles.map((cycle) => (
            <SpringCard
              key={cycle.id}
              className="flex items-center justify-between p-3 text-xs"
            >
              <div>
                <p className="font-semibold text-green-900 dark:text-green-300">
                  {cycle.portfolio_items?.name ?? "Crop"} ·{" "}
                  {cycle.area_acres ?? 0} acres
                </p>
                <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                  Revenue{" "}
                  <AnimatedINR
                    value={cycle.total_revenue ?? 0}
                    className="text-xs"
                  />{" "}
                  · Cost{" "}
                  <AnimatedINR
                    value={cycle.total_input_cost ?? 0}
                    className="text-xs"
                  />
                </p>
              </div>
              <div
                className={`rounded-lg border px-3 py-1 text-right ${profitBg(
                  cycle.net_profit ?? 0,
                )}`}
              >
                <p
                  className={`text-xs font-semibold ${profitColor(
                    cycle.net_profit ?? 0,
                  )}`}
                >
                  <AnimatedINR value={cycle.net_profit ?? 0} />
                </p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  {cycle.profit_per_acre ? (
                    <>
                      <AnimatedINR value={cycle.profit_per_acre} /> / acre
                    </>
                  ) : (
                    "— / acre"
                  )}
                </p>
              </div>
            </SpringCard>
          ))}
        </section>
      )}

      {/* Recent sales */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-green-800 dark:text-green-400">
            Recent sales
          </h2>
          <a
            href="/finances/sales"
            className="text-xs font-medium text-green-700 dark:text-green-400 hover:underline"
          >
            View all →
          </a>
        </div>
        {recentSales.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
            No sales recorded yet — use &quot;Log sale&quot; to record your
            first sale.
          </p>
        ) : (
          <ul className="space-y-2 text-xs">
            {recentSales.map((sale) => (
              <SpringCard
                key={sale.id}
                className="flex items-center justify-between p-3"
              >
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-300">
                    {sale.portfolio_items?.name ?? "Crop"} ·{" "}
                    {sale.quantity} {sale.unit}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                    <span className="font-mono">{sale.sale_date}</span> ·{" "}
                    <AnimatedINR
                      value={sale.total_amount ?? 0}
                      className="text-[11px]"
                    />
                  </p>
                </div>
                {typeof sale.price_vs_market === "number" && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      sale.price_vs_market >= 0
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {sale.price_vs_market >= 0 ? "Above" : "Below"} market{" "}
                    {sale.price_vs_market.toFixed(1)}%
                  </span>
                )}
              </SpringCard>
            ))}
          </ul>
        )}
      </section>

      {/* Navigation links */}
      <section className="mt-8 grid gap-3 md:grid-cols-3">
        <NavCard href="/finances/transactions" icon="📋" label="All transactions" />
        <NavCard href="/finances/expenses" icon="💸" label="Expenses" />
        <NavCard href="/finances/pnl" icon="📊" label="P&L report" />
      </section>
    </>
  )
}

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number
  color: "green" | "red"
  icon: string
}) {
  const colorClass =
    color === "green" ? "text-green-700" : "text-red-700"

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className={`mt-1 text-lg font-bold ${colorClass}`}>
            {formatINR(value)}
          </p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

function NavCard({
  href,
  icon,
  label,
}: {
  href: string
  icon: string
  label: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-xl border bg-white p-4 text-sm shadow-sm hover:border-green-400 hover:shadow-md"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold text-gray-800">{label}</span>
    </a>
  )
}

