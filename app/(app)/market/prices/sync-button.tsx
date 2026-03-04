'use client'

import { useState } from "react"

export function SyncPricesButton() {
  const [status, setStatus] = useState<
    "idle" | "syncing" | "done" | "error"
  >("idle")
  const [result, setResult] = useState<{
    synced: number
    skipped?: number
    results?: { item: string; variant: string; records: number }[]
    errors?: string[]
  } | null>(null)

  async function handleClick() {
    setStatus("syncing")
    setResult(null)

    try {
      const res = await fetch("/api/market/sync-manual", {
        method: "POST",
      })
      const data = (await res.json()) as typeof result
      setResult(data)
      setStatus("done")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 text-xs">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "syncing"}
        className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-medium text-green-800 hover:bg-green-100"
      >
        {status === "syncing" ? "Syncing…" : "Sync prices now"}
      </button>
      {status === "done" && result && (
        <div className="max-w-xs space-y-1 text-right text-[10px] text-gray-600">
          <p>
            Synced {result.synced ?? 0} records
            {typeof result.skipped === "number"
              ? `, ${result.skipped} crops had no data`
              : ""}
            .
          </p>
          {Array.isArray(result.results) &&
            result.results.length > 0 && (
              <div className="space-y-0.5">
                {result.results.map((r, idx) => (
                  <p key={`${r.item}-${idx}`}>
                    ✓ {r.item} → "{r.variant}" ({r.records})
                  </p>
                ))}
              </div>
            )}
          {Array.isArray(result.errors) &&
            result.errors.length > 0 && (
              <div className="space-y-0.5 text-red-600">
                {result.errors.map((e, idx) => (
                  <p key={`${e}-${idx}`}>✗ {e}</p>
                ))}
              </div>
            )}
        </div>
      )}
      {status === "error" && (
        <p className="max-w-xs text-right text-[10px] text-red-600">
          Sync failed — please try again.
        </p>
      )}
    </div>
  )
}

