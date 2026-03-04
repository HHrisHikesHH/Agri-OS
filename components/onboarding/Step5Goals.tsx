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
import { Textarea } from "@/components/ui/textarea"

type Step5Props = {
  primary_goal: string
  risk_appetite: string
  year1_target_revenue?: number
  onChange: (partial: {
    primary_goal?: string
    risk_appetite?: string
    year1_target_revenue?: number | undefined
  }) => void
}

export function Step5Goals({
  primary_goal,
  risk_appetite,
  year1_target_revenue,
  onChange,
}: Step5Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-green-800">
        Finally, share what success looks like for you. Agri OS will use this to
        tailor its advice, not to judge you.
      </p>

      <div className="space-y-2">
        <Label>Your primary goal for the farm</Label>
        <Textarea
          value={primary_goal}
          onChange={(e) => onChange({ primary_goal: e.target.value })}
          placeholder="e.g. Turn the farm into a stable, profitable business that can support my family and allow selective risk-taking."
          rows={4}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Risk appetite</Label>
          <Select
            value={risk_appetite}
            onValueChange={(value) => onChange({ risk_appetite: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose risk level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low – protect capital first</SelectItem>
              <SelectItem value="medium">
                Medium – some calculated experiments
              </SelectItem>
              <SelectItem value="high">
                High – willing to take bold bets
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Year 1 target revenue (optional, in ₹)</Label>
          <Input
            type="number"
            min={0}
            step={10000}
            value={year1_target_revenue ?? ""}
            onChange={(e) =>
              onChange({
                year1_target_revenue: e.target.value
                  ? Number.parseFloat(e.target.value)
                  : undefined,
              })
            }
            placeholder="e.g. 500000"
          />
        </div>
      </div>
    </div>
  )
}

