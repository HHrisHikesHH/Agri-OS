'use client'

type Props = {
  onSelect: (text: string) => void
}

const SUGGESTIONS: string[] = [
  "How profitable is my tur this season?",
  "Should I sell my jowar now or wait?",
  "What business can I start with my mango trees?",
  "What should I grow next rabi season?",
  "Which government schemes do I qualify for?",
  "What are my biggest risks this season?",
]

export function AgentSuggestions({ onSelect }: Props) {
  return (
    <div className="mb-3 space-y-2 text-xs">
      <p className="text-[11px] text-gray-500">
        Ask one of these, or type your own question:
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSelect(s)}
            className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] text-green-900 hover:bg-green-100"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

