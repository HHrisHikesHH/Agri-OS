type FarmSummaryCardProps = {
  label: string
  value: string | number
  accent?: "water" | "goal"
}

export function FarmSummaryCard({ label, value, accent }: FarmSummaryCardProps) {
  let valueClass = "text-green-700"
  if (accent === "water") valueClass = "text-orange-600 capitalize"
  if (accent === "goal") valueClass = "text-blue-700 capitalize"

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  )
}

