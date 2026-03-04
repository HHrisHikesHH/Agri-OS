'use client'

import { useState, useTransition } from "react"

import { addAsset, deleteAsset, updateAsset } from "@/app/(app)/farm/actions"
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
import type { AssetsRow } from "@/lib/types/database.types"

type AssetFormProps = {
  asset?: AssetsRow
}

type FormState = {
  error?: string
  success?: boolean
}

export function AssetForm({ asset }: AssetFormProps) {
  const [formState, setFormState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()

  const isEdit = Boolean(asset)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setFormState({})

    startTransition(async () => {
      const result = isEdit
        ? await updateAsset((asset as AssetsRow).id, formData)
        : await addAsset(formData)

      if (result?.error) {
        setFormState({ error: result.error })
        return
      }
      setFormState({ success: true })
    })
  }

  async function handleDelete() {
    if (!asset) return
    if (!window.confirm("Delete this asset? This cannot be undone.")) return
    setFormState({})
    startTransition(async () => {
      const result = await deleteAsset(asset.id)
      if (result?.error) {
        setFormState({ error: result.error })
        return
      }
      setFormState({ success: true })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      {formState.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {formState.error}
        </p>
      )}
      {formState.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800">
          Saved.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={asset?.name ?? ""}
            required
            placeholder="e.g. Mahindra 40 HP tractor"
          />
        </div>
        <div className="space-y-1.5">
          <Label>
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            name="category"
            defaultValue={asset?.category ?? "vehicle"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vehicle">Vehicle</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
              <SelectItem value="machinery">Machinery</SelectItem>
              <SelectItem value="tool">Tool</SelectItem>
              <SelectItem value="land_improvement">Land improvement</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Ownership</Label>
          <Select
            name="ownership"
            defaultValue={asset?.ownership ?? "owned"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ownership" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owned">Owned</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="purchase_year">Purchase year</Label>
          <Input
            id="purchase_year"
            name="purchase_year"
            type="number"
            min={1950}
            max={2100}
            defaultValue={asset?.purchase_year ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="purchase_cost">Purchase cost (₹)</Label>
          <Input
            id="purchase_cost"
            name="purchase_cost"
            type="number"
            min={0}
            step={1000}
            defaultValue={asset?.purchase_cost ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="current_value">Current value (₹)</Label>
          <Input
            id="current_value"
            name="current_value"
            type="number"
            min={0}
            step={1000}
            defaultValue={asset?.current_value ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Condition</Label>
          <Select
            name="condition"
            defaultValue={asset?.condition ?? "good"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Can rent out?</Label>
          <Select
            name="can_rent_out"
            defaultValue={asset?.can_rent_out ? "true" : "false"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">No</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="rental_rate">Rental rate (₹ per day/hour)</Label>
          <Input
            id="rental_rate"
            name="rental_rate"
            type="number"
            min={0}
            step={100}
            defaultValue={asset?.rental_rate ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={asset?.notes ?? ""}
          placeholder="Usage pattern, loan details, any issues..."
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="text-[11px] text-gray-500">
          Fields marked <span className="text-red-500">*</span> are required.
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-50"
              disabled={isPending}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            className="bg-green-700 text-white hover:bg-green-800"
            disabled={isPending}
          >
            {isPending ? "Saving..." : isEdit ? "Save changes" : "Add asset"}
          </Button>
        </div>
      </div>
    </form>
  )
}

