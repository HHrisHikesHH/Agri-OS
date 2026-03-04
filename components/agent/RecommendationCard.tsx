'use client'

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { AgentRecommendationsRow } from "@/lib/types/database.types"
import { formatINR } from "@/lib/utils/currency"

type Props = {
  recommendation: AgentRecommendationsRow
}

export function RecommendationCard({ recommendation }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState<string>(
    recommendation.status ?? "pending",
  )
  const [notes, setNotes] = useState(
    recommendation.actual_outcome ?? "",
  )
  const [isPending, startTransition] = useTransition()

  function saveOutcome() {
    startTransition(async () => {
      await fetch("/api/agent/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: recommendation.id,
          status,
          notes,
        }),
      })
      setShowForm(false)
    })
  }

  return (
    <div className="space-y-1 rounded-lg border border-green-100 bg-white p-2 text-[11px] shadow-sm">
      <p className="font-semibold text-gray-800">
        {recommendation.recommendation}
      </p>
      <p className="text-gray-600">
        Expected benefit:{" "}
        {formatINR(recommendation.expected_benefit ?? 0)}
      </p>
      <p className="text-gray-500">
        Status:{" "}
        <span className="capitalize">
          {recommendation.status}
        </span>{" "}
        · Confidence: {recommendation.confidence}
      </p>
      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-800 hover:bg-green-100"
        >
          Update outcome
        </button>
      )}
      {showForm && (
        <div className="mt-2 space-y-1">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px]"
          >
            <option value="pending">Pending</option>
            <option value="followed">Followed</option>
            <option value="ignored">Ignored</option>
            <option value="partial">Partial</option>
          </select>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What happened when you followed/ignored this?"
            className="text-[11px]"
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 border-gray-200 text-[11px]"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 bg-green-700 text-[11px] text-white hover:bg-green-800"
              disabled={isPending}
              onClick={saveOutcome}
            >
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

