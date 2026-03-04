'use client'

import { useState } from "react"

import type {
  CropCyclesRow,
  PortfolioItemsRow,
  SeasonsRow,
  TransactionsRow,
} from "@/lib/types/database.types"
import { formatINR, profitBg, profitColor } from "@/lib/utils/currency"

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
  seasons,
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
      <h1 className="text-2xl font-bold text-green-800">💰 Finances</h1>
      <p className="mt-1 text-sm text-gray-500">
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
        <button
          type="button"
          className="inline-flex items-center rounded-lg bg-green-700 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-green-800"
          onClick={() => setShowSaleForm(true)}
        >
          + Log sale
        </button>
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-xs font-medium text-green-800 shadow-sm hover:bg-green-100"
          onClick={() => setShowExpenseForm(true)}
        >
          + Log expense
        </button>
      </div>

      {showSaleForm && (
        <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-green-800">Log a sale</h2>
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setShowSaleForm(false)}
            >
              Close
            </button>
          </div>
          <AddSaleForm
            portfolioItems={portfolioItems}
            cycles={activeCycles}
          />
        </div>
      )}

      {showExpenseForm && (
        <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-green-800">
              Log an expense
            </h2>
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setShowExpenseForm(false)}
            >
              Close
            </button>
          </div>
          <AddExpenseForm cycles={activeCycles} />
        </div>
      )}

      {/* Active cycles P&L */}
      {activeCycles.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold text-green-800">
            Active crop P&amp;L
          </h2>
          {activeCycles.map((cycle) => (
            <div
              key={cycle.id}
              className="flex items-center justify-between rounded-xl border bg-white p-3 text-xs shadow-sm"
            >
              <div>
                <p className="font-semibold text-green-900">
                  {cycle.portfolio_items?.name ?? "Crop"} ·{" "}
                  {cycle.area_acres ?? 0} acres
                </p>
                <p className="mt-0.5 text-[11px] text-gray-600">
                  Revenue {formatINR(cycle.total_revenue ?? 0)} · Cost{" "}
                  {formatINR(cycle.total_input_cost ?? 0)}
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
                  {formatINR(cycle.net_profit ?? 0)}
                </p>
                <p className="text-[10px] text-gray-600">
                  {cycle.profit_per_acre
                    ? `${formatINR(cycle.profit_per_acre)} / acre`
                    : "— / acre"}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Recent sales */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-green-800">Recent sales</h2>
          <a
            href="/finances/sales"
            className="text-xs font-medium text-green-700 hover:underline"
          >
            View all →
          </a>
        </div>
        {recentSales.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">
            No sales recorded yet — use &quot;Log sale&quot; to record your
            first sale.
          </p>
        ) : (
          <ul className="space-y-2 text-xs">
            {recentSales.map((sale) => (
              <li
                key={sale.id}
                className="flex items-center justify-between rounded-xl border bg-white p-3 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-green-900">
                    {sale.portfolio_items?.name ?? "Crop"} ·{" "}
                    {sale.quantity} {sale.unit}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-600">
                    {sale.sale_date} · {formatINR(sale.total_amount)}
                  </p>
                </div>
                {typeof sale.price_vs_market === "number" && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      sale.price_vs_market >= 0
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {sale.price_vs_market >= 0 ? "Above" : "Below"} market{" "}
                    {sale.price_vs_market.toFixed(1)}%
                  </span>
                )}
              </li>
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

