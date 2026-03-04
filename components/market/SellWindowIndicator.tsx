import { getSellWindowAdvice } from "@/lib/data/price-seasonality"

type Props = {
  commodityName: string
  advice?: ReturnType<typeof getSellWindowAdvice>
}

export function SellWindowIndicator({ commodityName, advice }: Props) {
  const month = new Date().getMonth() + 1
  const usedAdvice =
    advice ??
    getSellWindowAdvice(commodityName.toLowerCase(), month)

  const monthLabel = new Date().toLocaleString("en-IN", {
    month: "long",
  })

  return (
    <div className="space-y-2 text-xs">
      <p className="text-[11px] font-semibold text-green-800">
        Sell window analysis — {commodityName}
      </p>
      <div className="rounded-lg border border-green-100 bg-green-50 p-3">
        <p className="text-[11px] text-gray-700">
          Based on historical patterns for Kalaburagi region.
        </p>
        <p className="mt-1 text-[11px] text-gray-700">
          Current month: <strong>{monthLabel}</strong>
        </p>
        <p className="mt-1 text-[11px] text-gray-800">
          Advice: {usedAdvice.advice}
        </p>
        {usedAdvice.potentialGain && (
          <p className="mt-1 text-[11px] text-gray-700">
            Potential gain: {usedAdvice.potentialGain}
          </p>
        )}
      </div>
      <p className="text-[10px] text-gray-500">
        This is a simple rule-based hint, not financial advice. AI
        will refine it with more data in the next phase.
      </p>
    </div>
  )
}

