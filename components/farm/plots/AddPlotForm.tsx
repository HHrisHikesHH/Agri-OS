'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { addPlot } from "@/app/(app)/farm/actions"
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

type FormState = {
  error?: string
  success?: boolean
}

export function AddPlotForm() {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    setFormState({})
    startTransition(async () => {
      const result = await addPlot(formData)
      if (result?.error) {
        setFormState({ error: result.error })
        return
      }
      setFormState({ success: true })
      router.push("/farm/plots")
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formState.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formState.error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Plot name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="e.g. East Tur Field"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area_acres">
            Area (acres) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="area_acres"
            name="area_acres"
            type="number"
            min={0.1}
            step={0.1}
            required
            placeholder="e.g. 2.5"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>
            Ownership <span className="text-red-500">*</span>
          </Label>
          <Select name="ownership" defaultValue="owned">
            <SelectTrigger>
              <SelectValue placeholder="Select ownership" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owned">Owned</SelectItem>
              <SelectItem value="family_shared">Family shared</SelectItem>
              <SelectItem value="leased_in">Leased in</SelectItem>
              <SelectItem value="leased_out">Leased out</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Soil type</Label>
          <Select name="soil_type" defaultValue="Black">
            <SelectTrigger>
              <SelectValue placeholder="Select soil type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Black">Black</SelectItem>
              <SelectItem value="Red">Red</SelectItem>
              <SelectItem value="Mixed">Mixed</SelectItem>
              <SelectItem value="Sandy">Sandy</SelectItem>
              <SelectItem value="Unknown">Don&apos;t know</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Terrain</Label>
          <Select name="terrain" defaultValue="Flat">
            <SelectTrigger>
              <SelectValue placeholder="Select terrain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Flat">Flat</SelectItem>
              <SelectItem value="Slight slope">Slight slope</SelectItem>
              <SelectItem value="Low-lying">Low-lying (flood prone)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Irrigation type</Label>
        <Select name="irrigation_type" defaultValue="Rainfed only">
          <SelectTrigger>
            <SelectValue placeholder="Select irrigation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Rainfed only">Rainfed only</SelectItem>
            <SelectItem value="Borewell">Borewell</SelectItem>
            <SelectItem value="Drip">Drip</SelectItem>
            <SelectItem value="Flood">Flood</SelectItem>
            <SelectItem value="Mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Landmarks, special conditions, soil behaviour..."
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-700 text-white hover:bg-green-800 md:w-auto"
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Save plot"}
      </Button>
    </form>
  )
}

