'use client'

import { useState, useTransition } from "react"

import { addTask } from "@/app/(app)/crops/actions"
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

type Props = {
  cycleId: string
}

type FormState = {
  error?: string
  success?: boolean
}

export function AddTaskForm({ cycleId }: Props) {
  const [formState, setFormState] = useState<FormState>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setFormState({})

    startTransition(async () => {
      const result = await addTask(cycleId, formData)
      if (result?.error) {
        setFormState({ error: result.error })
        return
      }
      setFormState({ success: true })
      ;(event.currentTarget as HTMLFormElement).reset()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-xs">
      {formState.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {formState.error}
        </p>
      )}
      {formState.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-[11px] text-green-800">
          Task added.
        </p>
      )}

      <div className="grid gap-2 md:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-[11px]">Type</Label>
          <Select name="task_type" defaultValue="other">
            <SelectTrigger className="h-7 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sowing">Sowing</SelectItem>
              <SelectItem value="irrigation">Irrigation</SelectItem>
              <SelectItem value="spraying">Spraying</SelectItem>
              <SelectItem value="fertilizing">Fertilizing</SelectItem>
              <SelectItem value="harvesting">Harvesting</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-[11px]" htmlFor="title">
            Title
          </Label>
          <Input
            id="title"
            name="title"
            className="h-7 text-[11px]"
            placeholder="e.g. Extra weeding near bund"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px]" htmlFor="scheduled_date">
            Date
          </Label>
          <Input
            id="scheduled_date"
            name="scheduled_date"
            type="date"
            className="h-7 text-[11px]"
          />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <div className="space-y-1.5 md:col-span-1">
          <Label className="text-[11px]" htmlFor="cost">
            Est. cost (₹)
          </Label>
          <Input
            id="cost"
            name="cost"
            type="number"
            min={0}
            step={10}
            className="h-7 text-[11px]"
          />
        </div>
        <div className="space-y-1.5 md:col-span-3">
          <Label className="text-[11px]" htmlFor="notes">
            Notes
          </Label>
          <Textarea
            id="notes"
            name="notes"
            rows={2}
            className="resize-none text-[11px]"
          />
        </div>
      </div>

      <Button
        type="submit"
        size="xs"
        className="bg-green-700 text-[11px] text-white hover:bg-green-800"
        disabled={isPending}
      >
        {isPending ? "Adding..." : "Add custom task"}
      </Button>
    </form>
  )
}

