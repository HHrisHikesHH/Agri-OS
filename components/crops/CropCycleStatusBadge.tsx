'use client'

type Props = {
  status: string | null
}

export function CropCycleStatusBadge({ status }: Props) {
  const value = (status ?? "planned").toLowerCase()
  let label = "Planned"
  let classes = "bg-blue-50 text-blue-800"

  if (value === "sowing") {
    label = "Sowing"
    classes = "bg-yellow-50 text-yellow-800"
  } else if (value === "growing") {
    label = "Growing"
    classes = "bg-green-50 text-green-800"
  } else if (value === "harvested") {
    label = "Harvested"
    classes = "bg-orange-50 text-orange-800"
  } else if (value === "closed" || value === "sold") {
    label = "Closed"
    classes = "bg-emerald-50 text-emerald-800"
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${classes}`}
    >
      {label}
    </span>
  )
}

