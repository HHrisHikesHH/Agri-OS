"use client"

import { useEffect, useMemo, useState, useTransition } from "react"

import { logSale } from "@/app/(app)/finances/actions"
import { triggerSaleConfetti } from "@/components/ui/SaleConfetti"
import { PressButton } from "@/components/ui/PressButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  CropCyclesRow,
  PortfolioItemsRow,
} from "@/lib/types/database.types"
import { formatINR } from "@/lib/utils/currency"

type CycleForSelect = Pick<
  CropCyclesRow,
  "id" | "status" | "area_acres"
> & {
  portfolio_items: { name: string } | null
}

type Props = {
  portfolioItems: PortfolioItemsRow[]
  cycles: CycleForSelect[]
  defaultPortfolioItemId?: string
  defaultCycleId?: string
}

type FormState = {
  error?: string
  success?: boolean
  summary?: {
    quantity: number
    unit: string
    totalAmount: number
    priceVsMarket: number | null
    cropName: string
  }
}

export function AddSaleForm({
  portfolioItems,
  cycles,
  defaultPortfolioItemId,
  defaultCycleId,
}: Props) {
  const [formState, setFormState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()
  const [quantity, setQuantity] = useState<string>("")
  const [pricePerUnit, setPricePerUnit] = useState<string>("")
  const [unit, setUnit] = useState<string>("quintal")
  const [portfolioItemId, setPortfolioItemId] = useState<string>(
    defaultPortfolioItemId ?? "",
  )
  const [cycleId, setCycleId] = useState<string>(defaultCycleId ?? "")

  const parsedQuantity = parseFloat(quantity || "0")
  const parsedPrice = parseFloat(pricePerUnit || "0")
  const totalAmount = Number.isFinite(parsedQuantity * parsedPrice)
    ? parsedQuantity * parsedPrice
    : 0

  const selectedCrop = useMemo(
    () => portfolioItems.find((p) => p.id === portfolioItemId) ?? null,
    [portfolioItems, portfolioItemId],
  )

  useEffect(() => {
    if (!portfolioItemId && portfolioItems.length === 1) {
      // Safe to ignore lint here because this effect simply initialises
      // default selection based on props and React will batch updates.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPortfolioItemId(portfolioItems[0].id)
    }
  }, [portfolioItems, portfolioItemId])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setFormState({})

    if (portfolioItemId) {
      formData.set("portfolio_item_id", portfolioItemId)
    }
    if (cycleId) {
      formData.set("crop_cycle_id", cycleId)
    }

    startTransition(async () => {
      const result = await logSale(formData)
      if (result?.error) {
        setFormState({ error: result.error })
        return
      }
      triggerSaleConfetti(totalAmount)
      setFormState({
        success: true,
        summary: {
          quantity: parsedQuantity,
          unit,
          totalAmount,
          priceVsMarket: result?.priceVsMarket ?? null,
          cropName: selectedCrop?.name ?? "crop",
        },
      })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {formState.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {formState.error}
        </p>
      )}
      {formState.success && formState.summary && (
        <div className="space-y-1 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-3 text-xs text-green-900 dark:text-green-300 glow-pulse">
          <p className="font-semibold">✅ Sale recorded!</p>
          <p>
            Sold: {formState.summary.quantity} {formState.summary.unit}{" "}
            {formState.summary.cropName}
          </p>
          <p>Amount: {formatINR(formState.summary.totalAmount)}</p>
          {typeof formState.summary.priceVsMarket === "number" && (
            <p className="mt-1">
              {formState.summary.priceVsMarket >= 0 ? "🟢" : "🔴"} vs market: You
              sold{" "}
              {Math.abs(formState.summary.priceVsMarket).toFixed(1)}
              %{" "}
              {formState.summary.priceVsMarket >= 0 ? "above" : "below"} today&apos;s
              mandi price.
            </p>
          )}
          {formState.summary.priceVsMarket == null && (
            <p className="mt-1 text-[11px] text-green-800 dark:text-green-400">
              No market data available for that day.
            </p>
          )}
        </div>
      )}

      {/* Step 1 */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-green-800">
          1. What did you sell?
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Crop / product</Label>
            <Select
              value={portfolioItemId}
              onValueChange={setPortfolioItemId}
            >
              <SelectTrigger>
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
          <div className="space-y-1.5">
            <Label>Link to crop cycle (optional)</Label>
            <Select value={cycleId} onValueChange={setCycleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not linked</SelectItem>
                {cycles.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.portfolio_items?.name ?? "Crop"} · {c.area_acres ?? 0}{" "}
                    acres ({c.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-0.5 text-[11px] text-gray-500">
              Linking helps track profit per crop accurately.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              step={0.01}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Select
              name="unit"
              value={unit}
              onValueChange={setUnit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quintal">Quintal</SelectItem>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="piece">Piece</SelectItem>
                <SelectItem value="dozen">Dozen</SelectItem>
                <SelectItem value="litre">Litre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price_per_unit">Price per unit (₹)</Label>
            <Input
              id="price_per_unit"
              name="price_per_unit"
              type="number"
              min={0}
              step={0.01}
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Total amount</Label>
            <div className="rounded-lg bg-green-50 dark:bg-green-950/20 px-2 py-1 text-xs font-semibold text-green-800 dark:text-green-300 font-mono">
              {totalAmount > 0
                ? `You'll receive ${formatINR(totalAmount)}`
                : "—"}
            </div>
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-green-800">
          2. Who bought it?
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Buyer type</Label>
            <Select name="buyer_type" defaultValue="trader">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trader">Local trader</SelectItem>
                <SelectItem value="mandi">Mandi</SelectItem>
                <SelectItem value="direct_shop">
                  Direct (hotel / shop)
                </SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="processor">Processor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="buyer_name">Buyer name</Label>
            <Input id="buyer_name" name="buyer_name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="buyer_location">Buyer location</Label>
            <Input id="buyer_location" name="buyer_location" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Payment method</Label>
            <Select name="payment_method" defaultValue="cash">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sale_date">Sale date</Label>
            <Input
              id="sale_date"
              name="sale_date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-green-800">
          3. Notes (optional)
        </h3>
        <Textarea
          name="notes"
          rows={3}
          placeholder="Any extra info about this sale."
        />
      </section>

      <PressButton
        type="submit"
        fullWidth
        loading={isPending}
        successMessage="Saved"
        className="md:w-auto"
      >
        Record sale
      </PressButton>
    </form>
  )
}

