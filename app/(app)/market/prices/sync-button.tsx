'use client'

import { useState, useTransition } from "react"

import { syncPrices } from "./syncPricesAction"

export function SyncPricesButton() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function handleClick() {
    setMessage(null)
    startTransition(async () => {
      const result = await syncPrices()
      if (result?.error) {
        setMessage(`Sync failed: ${result.error}`)
      } else {
        setMessage("Prices synced. Refreshing…")
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1 text-xs">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-medium text-green-800 hover:bg-green-100"
      >
        {isPending ? "Syncing…" : "Sync prices now"}
      </button>
      {message && (
        <p className="max-w-xs text-right text-[10px] text-gray-600">
          {message}
        </p>
      )}
    </div>
  )
}

