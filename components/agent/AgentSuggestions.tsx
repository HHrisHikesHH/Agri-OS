'use client'

type Props = {
  onSelect: (text: string) => void
}

const SUGGESTIONS: { text: string; icon: string }[] = [
  { text: "Aaj tur ka bhav kya hai?", icon: "📊" },
  { text: "Kal baarish aayegi kya?", icon: "🌧️" },
  { text: "Kon se tasks overdue hain?", icon: "⚠️" },
  {
    text: "Is season mein kitna profit hua?",
    icon: "💰",
  },
  {
    text: "Maine aaj 2 quintal tur ₹7200 mein becha",
    icon: "🌾",
  },
  {
    text: "Konsi government schemes ke liye main eligible hoon?",
    icon: "🏛️",
  },
  {
    text: "Mango ke liye koi business idea hai?",
    icon: "💡",
  },
  {
    text: "DAP fertilizer ka ₹1200 kharcha hua aaj",
    icon: "💸",
  },
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
            key={s.text}
            type="button"
            onClick={() => onSelect(s.text)}
            className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] text-green-900 hover:bg-green-100"
          >
            <span className="mr-1">{s.icon}</span>
            {s.text}
          </button>
        ))}
      </div>
    </div>
  )
}

