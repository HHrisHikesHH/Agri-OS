'use client'

import { useTransition } from "react"

import {
  deletePriceAlert,
  markAlertRead,
} from "@/app/(app)/market/alerts/actions"
import { Button } from "@/components/ui/button"
import type {
  AgentAlertsRow,
  PortfolioItemsRow,
  PriceAlertsRow,
} from "@/lib/types/database.types"
import { formatINR } from "@/lib/utils/currency"

import { AddAlertForm } from "./AddAlertForm"

type AlertWithItem = PriceAlertsRow & {
  portfolio_items: { name: string } | null
}

type Props = {
  portfolioItems: PortfolioItemsRow[]
  alerts: AlertWithItem[]
  agentAlerts: AgentAlertsRow[]
}

export function PriceAlertsPanel({
  portfolioItems,
  alerts,
  agentAlerts,
}: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="space-y-6 text-xs">
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-green-800">
          Create new alert
        </h2>
        <p className="mt-1 text-[11px] text-gray-600">
          Choose a crop and price threshold. We&apos;ll create an
          in-app alert when mandi prices cross your target.
        </p>
        <div className="mt-3">
          <AddAlertForm portfolioItems={portfolioItems} />
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-green-800">
            Active alerts
          </h2>
          <span className="text-[11px] text-gray-500">
            {alerts.length} alert{alerts.length === 1 ? "" : "s"}
          </span>
        </div>
        {alerts.length === 0 ? (
          <p className="py-3 text-xs text-gray-500">
            You don&apos;t have any active alerts yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {a.portfolio_items?.name ?? "Crop"}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Alert when price{" "}
                    <span className="font-semibold">
                      {a.alert_type === "above"
                        ? "goes above"
                        : "falls below"}
                    </span>{" "}
                    {formatINR(a.threshold_value ?? 0)} / qtl
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 border-red-200 text-[11px] text-red-700 hover:bg-red-50"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await deletePriceAlert(a.id)
                    })
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-green-800">
            Recent triggered alerts
          </h2>
          <span className="text-[11px] text-gray-500">
            {agentAlerts.filter((a) => !a.is_read).length} unread
          </span>
        </div>
        {agentAlerts.length === 0 ? (
          <p className="py-3 text-xs text-gray-500">
            No alerts have been triggered yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {agentAlerts.map((a) => (
              <li
                key={a.id}
                className={`flex items-center justify-between rounded-lg border px-2 py-1.5 text-[11px] ${
                  a.is_read
                    ? "border-gray-100 bg-gray-50"
                    : "border-yellow-200 bg-yellow-50"
                }`}
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {a.title}
                  </p>
                  <p className="text-gray-700">{a.body}</p>
                </div>
                {!a.is_read && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 border-green-200 text-[11px] text-green-800 hover:bg-green-50"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await markAlertRead(a.id)
                      })
                    }
                  >
                    Mark read
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

