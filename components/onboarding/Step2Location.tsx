'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Step2Props = {
  village: string
  taluk: string
  district: string
  state: string
  onChange: (partial: {
    village?: string
    taluk?: string
    district?: string
    state?: string
  }) => void
}

export function Step2Location({
  village,
  taluk,
  district,
  state,
  onChange,
}: Step2Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-green-800">
        Tell Agri OS where your main farm is. This helps it match local weather,
        mandi prices, and nearby schemes.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="village">Village</Label>
          <Input
            id="village"
            value={village}
            onChange={(e) => onChange({ village: e.target.value })}
            placeholder="e.g. Kamalapur"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taluk">Taluk</Label>
          <Input
            id="taluk"
            value={taluk}
            onChange={(e) => onChange({ taluk: e.target.value })}
            placeholder="e.g. Kalaburagi"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            value={district}
            onChange={(e) => onChange({ district: e.target.value })}
            placeholder="e.g. Kalaburagi"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => onChange({ state: e.target.value })}
            placeholder="e.g. Karnataka"
          />
        </div>
      </div>
    </div>
  )
}

