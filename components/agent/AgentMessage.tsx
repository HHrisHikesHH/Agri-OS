'use client'

type Props = {
  role: "user" | "assistant"
  content: string
}

export function AgentMessage({ role, content }: Props) {
  const isUser = role === "user"

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
          isUser
            ? "rounded-br-none bg-green-700 text-white"
            : "rounded-bl-none bg-gray-50 text-gray-900 border border-gray-100"
        }`}
      >
        {content.split("\n").map((line, idx) => (
          <p key={idx} className="whitespace-pre-wrap">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

