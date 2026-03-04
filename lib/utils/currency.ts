export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "₹ —"

  const absAmount = Math.abs(amount)
  let formatted: string

  if (absAmount >= 10000000) {
    formatted = `₹ ${(absAmount / 10000000).toFixed(2)} Cr`
  } else if (absAmount >= 100000) {
    formatted = `₹ ${(absAmount / 100000).toFixed(2)} L`
  } else if (absAmount >= 1000) {
    formatted = `₹ ${(absAmount / 1000).toFixed(1)}K`
  } else {
    formatted = `₹ ${absAmount.toFixed(0)}`
  }

  return amount < 0 ? `-${formatted}` : formatted
}

export function formatINRFull(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "₹ —"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function profitColor(amount: number): string {
  if (amount > 0) return "text-green-600"
  if (amount < 0) return "text-red-600"
  return "text-gray-500"
}

export function profitBg(amount: number): string {
  if (amount > 0) return "bg-green-50 border-green-200"
  if (amount < 0) return "bg-red-50 border-red-200"
  return "bg-gray-50 border-gray-200"
}

