'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const SOIL_TYPES = ["Black", "Red", "Sandy", "Loamy", "Laterite"]

type Step3Props = {
  total_acres: number
  soil_types: string[]
  water_status: string
  capital_status: string
  onChange: (partial: {
    total_acres?: number
    soil_types?: string[]
    water_status?: string
    capital_status?: string
  }) => void
}

export function Step3Land({
  total_acres,
  soil_types,
  water_status,
  capital_status,
  onChange,
}: Step3Props) {
  function toggleSoil(soil: string) {
    if (soil_types.includes(soil)) {
      onChange({ soil_types: soil_types.filter((s) => s !== soil) })
    } else {
      onChange({ soil_types: [...soil_types, soil] })
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-green-800">
        A quick snapshot of your land and resources so Agri OS can suggest
        realistic plans for Kalaburagi conditions.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="total_acres">Total land (in acres)</Label>
          <Input
            id="total_acres"
            type="number"
            min={0}
            step={0.1}
            value={total_acres || ""}
            onChange={(e) =>
              onChange({
                total_acres: Number.parseFloat(e.target.value || "0"),
              })
            }
            placeholder="e.g. 8.5"
          />
        </div>
        <div className="space-y-2">
          <Label>Soil types (select one or more)</Label>
          <div className="flex flex-wrap gap-2">
            {SOIL_TYPES.map((soil) => (
              <button
                key={soil}
                type="button"
                onClick={() => toggleSoil(soil)}
                className="focus-visible:outline-none"
              >
                <Badge
                  variant={soil_types.includes(soil) ? "default" : "outline"}
                  className={
                    soil_types.includes(soil)
                      ? "bg-green-700 text-white hover:bg-green-800"
                      : "border-green-300 text-green-800 hover:bg-green-50"
                  }
                >
                  {soil}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Water situation</Label>
          <Select
            value={water_status}
            onValueChange={(value) => onChange({ water_status: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose water status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scarce">Scarce / uncertain</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="good">Good, reliable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Available capital for experiments</Label>
          <Select
            value={capital_status}
            onValueChange={(value) => onChange({ capital_status: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose capital status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zero">Almost zero</SelectItem>
              <SelectItem value="limited">Limited</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

