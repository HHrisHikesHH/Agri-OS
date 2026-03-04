'use client'

import { useState, useTransition } from "react"

import { addPriceAlert } from "@/app/(app)/market/alerts/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PortfolioItemsRow } from "@/lib/types/database.types"
import { formatINR } from "@/lib/utils/currency"

type Props = {
  portfolioItems: PortfolioItemsRow[]
  currentPrice?: number | null
}

type FormState = {
  error?: string
  success?: boolean
}

export function AddAlertForm({
  portfolioItems,
  currentPrice,
}: Props) {
  const [state, setState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()
  const [selectedItemId, setSelectedItemId] = useState<string>(
    portfolioItems[0]?.id ?? "",
  )
  const [alertType, setAlertType] = useState<"above" | "below">(
    "above",
  )

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setState({})

    if (selectedItemId) {
      formData.set("portfolio_item_id", selectedItemId)
    }
    formData.set("alert_type", alertType)

    startTransition(async () => {
      const result = await addPriceAlert(formData)
      if (result?.error) {
        setState({ error: result.error })
      } else {
        setState({ success: true })
      }
    })
  }

  const selectedItem = portfolioItems.find(
    (p) => p.id === selectedItemId,
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      {state.error && (
        <p className="rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-green-50 px-2 py-1 text-[11px] text-green-800">
          Alert created.
        </p>
      )}
      <div className="space-y-1.5">
        <Label>Crop</Label>
        <Select
          value={selectedItemId}
          onValueChange={setSelectedItemId}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select crop" />
          </SelectTrigger>
          <SelectContent>
            {portfolioItems.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
                {p.local_name ? ` (${p.local_name})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-1.5">
          <Label>Alert when price</Label>
          <Select
            value={alertType}
            onValueChange={(v) =>
              setAlertType(v as "above" | "below")
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="above">Goes above</SelectItem>
              <SelectItem value="below">Goes below</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="threshold_value">
            Threshold (₹/qtl)
          </Label>
          <Input
            id="threshold_value"
            name="threshold_value"
            type="number"
            min={0}
            step={1}
            className="h-8"
          />
        </div>
      </div>
      {typeof currentPrice === "number" && (
        <p className="text-[11px] text-gray-600">
          Current price:{" "}
          <span className="font-semibold">
            {formatINR(currentPrice)} / qtl
          </span>{" "}
          for {selectedItem?.name ?? "this crop"}
        </p>
      )}
      <Button
        type="submit"
        size="sm"
        className="mt-1 bg-green-700 text-white hover:bg-green-800"
        disabled={isPending}
      >
        {isPending ? "Adding..." : "Add alert"}
      </Button>
    </form>
  )
}

