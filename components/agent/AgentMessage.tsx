'use client'

type Props = {
  role: "user" | "assistant"
  content: string
  toolsUsed?: string[]
}

export function AgentMessage({ role, content, toolsUsed }: Props) {
  const isUser = role === "user"

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div className="max-w-[80%] space-y-1">
        <div
          className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
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
        {!isUser && toolsUsed && toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1 pl-1">
            {toolsUsed.map((tool) => (
              <span
                key={tool}
                className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-800"
              >
                🔧 {tool.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

