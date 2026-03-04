'use client'

import { useState, useTransition } from "react"

import { addWaterSource } from "@/app/(app)/farm/actions"
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

type WaterSourceFormProps = {
  plotId: string
}

type FormState = {
  error?: string
  success?: boolean
}

export function WaterSourceForm({ plotId }: WaterSourceFormProps) {
  const [formState, setFormState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    setFormState({})
    startTransition(async () => {
      const result = await addWaterSource(plotId, formData)
      if (result?.error) {
        setFormState({ error: result.error })
        return
      }
      setFormState({ success: true })
      event.currentTarget.reset()
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
          Water source added.
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>
            Type <span className="text-red-500">*</span>
          </Label>
          <Select name="type" defaultValue="Borewell">
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Borewell">Borewell</SelectItem>
              <SelectItem value="Rainwater">Rainwater</SelectItem>
              <SelectItem value="Farm pond">Farm pond</SelectItem>
              <SelectItem value="Canal">Canal</SelectItem>
              <SelectItem value="Tanker">Tanker</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>
            Reliability <span className="text-red-500">*</span>
          </Label>
          <Select name="reliability" defaultValue="Seasonal">
            <SelectTrigger>
              <SelectValue placeholder="Select reliability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Reliable year-round">
                Reliable year-round
              </SelectItem>
              <SelectItem value="Seasonal (monsoon only)">
                Seasonal (monsoon only)
              </SelectItem>
              <SelectItem value="Unreliable">Unreliable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="depth_ft">Depth (ft, for borewell)</Label>
          <Input id="depth_ft" name="depth_ft" type="number" min={0} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="motor_hp">Motor HP (for borewell)</Label>
          <Input id="motor_hp" name="motor_hp" type="number" min={0} step={0.1} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="availability_months">
          Available months (enter month numbers, e.g. 6,7,8 for Jun–Aug)
        </Label>
        <Input
          id="availability_months"
          name="availability_months"
          placeholder="1,2,3,4,5,6,7,8,9,10,11,12"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Any special behaviour or issues with this source..."
        />
      </div>

      <Button
        type="submit"
        size="sm"
        className="bg-green-700 text-white hover:bg-green-800"
        disabled={isPending}
      >
        {isPending ? "Adding..." : "Add water source"}
      </Button>
    </form>
  )
}

