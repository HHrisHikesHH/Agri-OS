'use client'

import { useState, useTransition } from "react"

import { logExpense } from "@/app/(app)/finances/actions"
import { Button } from "@/components/ui/button"
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
import type { CropCyclesRow } from "@/lib/types/database.types"

type CycleForSelect = Pick<
  CropCyclesRow,
  "id" | "status" | "area_acres"
> & {
  portfolio_items: { name: string } | null
}

type Props = {
  cycles: CycleForSelect[]
}

type FormState = {
  error?: string
  success?: boolean
}

export function AddExpenseForm({ cycles }: Props) {
  const [formState, setFormState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()
  const [category, setCategory] = useState<string>("seeds")

  const isInput =
    category === "seeds" ||
    category === "fertilizer" ||
    category === "pesticide"

  function mapCategoryToInternal(c: string): string {
    if (c === "seeds") return "seeds"
    if (c === "fertilizer") return "fertilizer"
    if (c === "pesticide") return "pesticide"
    if (c === "labor") return "labor"
    if (c === "fuel") return "fuel_transport"
    if (c === "equipment") return "equipment_repair"
    if (c === "water") return "water_irrigation"
    if (c === "storage") return "storage"
    return "other"
  }

  function mapCategoryToInputType(c: string): string {
    if (c === "seeds") return "seed"
    if (c === "fertilizer") return "fertilizer"
    if (c === "pesticide") return "pesticide"
    return ""
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setFormState({})

    formData.set("category", mapCategoryToInternal(category))
    formData.set("input_type", mapCategoryToInputType(category))

    startTransition(async () => {
      const result = await logExpense(formData)
      if (result?.error) {
        setFormState({ error: result.error })
        return
      }
      setFormState({ success: true })
      ;(event.currentTarget as HTMLFormElement).reset()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {formState.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {formState.error}
        </p>
      )}
      {formState.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800">
          Expense recorded.
        </p>
      )}

      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-green-800">
          1. What did you spend on?
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Expense category</Label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seeds">🌱 Seeds</SelectItem>
                <SelectItem value="fertilizer">🧪 Fertilizer</SelectItem>
                <SelectItem value="pesticide">
                  💊 Pesticide / Herbicide
                </SelectItem>
                <SelectItem value="labor">👷 Labor</SelectItem>
                <SelectItem value="fuel">⛽ Fuel / Transport</SelectItem>
                <SelectItem value="equipment">
                  🔧 Equipment / Repair
                </SelectItem>
                <SelectItem value="water">💧 Water / Irrigation</SelectItem>
                <SelectItem value="storage">📦 Storage</SelectItem>
                <SelectItem value="other">🏛️ Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min={0}
              step={1}
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-green-800">
          2. When &amp; for which crop?
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Link to crop cycle (optional)</Label>
            <Select name="crop_cycle_id" defaultValue="">
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
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {isInput && (
          <>
            <h3 className="text-xs font-semibold text-green-800">
              3. Input purchase details
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="product_name">Product name</Label>
                <Input
                  id="product_name"
                  name="product_name"
                  placeholder="e.g. Seed variety, DAP, Urea, Neem-based spray"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  name="supplier"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={0}
                  step={0.1}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Select name="unit">
                  <SelectTrigger>
                    <SelectValue placeholder="kg / litre / bag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="litre">Litre</SelectItem>
                    <SelectItem value="bag">Bag</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {!isInput && (
          <>
            <h3 className="text-xs font-semibold text-green-800">
              3. Description (optional)
            </h3>
          </>
        )}
        <Textarea
          name="description"
          rows={3}
          placeholder="Short note about this expense."
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-green-800">
          4. Payment method
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Payment method</Label>
            <Select name="payment_method" defaultValue="cash">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Button
        type="submit"
        className="w-full bg-green-700 text-white hover:bg-green-800 md:w-auto"
        disabled={isPending}
      >
        {isPending ? "Recording..." : "Record expense"}
      </Button>
    </form>
  )
}

