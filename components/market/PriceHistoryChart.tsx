'use client'

import { useState } from "react"
import { useTheme } from "next-themes"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { MarketPricesRow } from "@/lib/types/database.types"

type Props = {
  data: MarketPricesRow[]
}

export function PriceHistoryChart({ data }: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const chartColors = {
    text: isDark ? "#d1d5db" : "#6b7280",
    grid: isDark ? "#1f2937" : "#f3f4f6",
    tooltip: isDark ? "#111827" : "#ffffff",
    tooltipBorder: isDark ? "#374151" : "#e5e7eb",
    label: isDark ? "#f3f4f6" : "#111827",
    linePrimary: "#16a34a",
    lineSecondary: isDark ? "#6b7280" : "#9ca3af",
  }

  const [range, setRange] = useState<7 | 30 | 90>(30)

  const sliced = (() => {
    if (range === 90) return data
    const now = new Date()
    const cutoff = new Date(
      now.getTime() - range * 86400000,
    )
      .toISOString()
      .split("T")[0]
    return data.filter((d) => d.price_date >= cutoff)
  })()

  const chartData = sliced.map((p) => ({
    date: p.price_date,
    modal: p.modal_price ?? 0,
    min: p.min_price ?? 0,
    max: p.max_price ?? 0,
    mandi: p.mandi_name,
  }))

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-2 text-[11px]">
        <RangeButton
          label="7d"
          active={range === 7}
          onClick={() => setRange(7)}
        />
        <RangeButton
          label="30d"
          active={range === 30}
          onClick={() => setRange(30)}
        />
        <RangeButton
          label="90d"
          active={range === 90}
          onClick={() => setRange(90)}
        />
      </div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: chartColors.text }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: chartColors.text }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartColors.tooltip,
                border: `1px solid ${chartColors.tooltipBorder}`,
                borderRadius: 12,
                color: chartColors.label,
              }}
              formatter={(value, name) => {
                const numericValue = Number(value ?? 0)
                if (name === "modal") {
                  return [`₹${numericValue.toFixed(0)}`, "Modal"]
                }
                if (name === "min") {
                  return [`₹${numericValue.toFixed(0)}`, "Min"]
                }
                return [`₹${numericValue.toFixed(0)}`, "Max"]
              }}
              labelFormatter={(label) => `Date: ${label ?? ""}`}
            />
            <Line
              type="monotone"
              dataKey="modal"
              stroke={chartColors.linePrimary}
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="min"
              stroke={chartColors.lineSecondary}
              dot={false}
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="max"
              stroke={chartColors.lineSecondary}
              dot={false}
              strokeWidth={1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function RangeButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2 py-0.5 ${
        active
          ? "bg-green-700 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  )
}

