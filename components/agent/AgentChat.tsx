'use client'

import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"

import type {
  AgentAlertsRow,
  AgentInteractionsRow,
  AgentRecommendationsRow,
} from "@/lib/types/database.types"

import { getSkillLabel } from "@/lib/ai/context/skills"
import { AgentInput } from "./AgentInput"
import { AgentMessage } from "./AgentMessage"
import { AgentSuggestions } from "./AgentSuggestions"
import { ContextSummaryCard } from "./ContextSummaryCard"
import { RecommendationCard } from "./RecommendationCard"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
  toolsUsed?: string[]
}

type Props = {
  recentInteractions: AgentInteractionsRow[]
  unreadAlerts: AgentAlertsRow[]
  pendingRecommendations: AgentRecommendationsRow[]
}

export function AgentChat({
  recentInteractions,
  unreadAlerts,
  pendingRecommendations,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (recentInteractions.length === 0) return []

    const ordered = [...recentInteractions].sort((a, b) => {
      const aTime = a.created_at ?? ""
      const bTime = b.created_at ?? ""
      return aTime.localeCompare(bTime)
    })

    const initial: ChatMessage[] = []
    for (const i of ordered) {
      if (i.user_message) {
        initial.push({
          role: "user",
          content: i.user_message,
        })
      }
      if (i.agent_response) {
        initial.push({
          role: "assistant",
          content: i.agent_response,
        })
      }
    }
    return initial
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [skillLabel, setSkillLabel] = useState<string>("")
  const [isRefreshingContext, startRefresh] = useTransition()
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef =
    useRef<HTMLDivElement | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] =
    useState(false)
  const [hasMoreHistory, setHasMoreHistory] = useState(
    recentInteractions.length >= 20,
  )
  const [oldestCreatedAt, setOldestCreatedAt] = useState<
    string | null
  >(() => {
    if (recentInteractions.length === 0) return null
    return recentInteractions.reduce<string | null>(
      (min, i) => {
        if (!i.created_at) return min
        if (!min || i.created_at < min) return i.created_at
        return min
      },
      null,
    )
  })

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isStreaming])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    function onScroll() {
      if (isLoadingHistory || !hasMoreHistory) return
      if (el.scrollTop <= 40) {
        void loadMoreHistory()
      }
    }

    el.addEventListener("scroll", onScroll)
    return () => {
      el.removeEventListener("scroll", onScroll)
    }
  }, [isLoadingHistory, hasMoreHistory, oldestCreatedAt])

  async function loadMoreHistory() {
    if (!oldestCreatedAt || isLoadingHistory) return
    setIsLoadingHistory(true)
    const el = scrollContainerRef.current
    const prevScrollHeight = el?.scrollHeight ?? 0
    const prevScrollTop = el?.scrollTop ?? 0

    try {
      const res = await fetch(
        `/api/agent/history?before=${encodeURIComponent(
          oldestCreatedAt,
        )}`,
      )
      const data = (await res.json()) as {
        interactions?: AgentInteractionsRow[]
        hasMore?: boolean
      }

      if (!res.ok || !data.interactions) {
        setHasMoreHistory(false)
        return
      }

      if (data.interactions.length === 0) {
        setHasMoreHistory(false)
        return
      }

      const ordered = [...data.interactions].sort(
        (a, b) => {
          const aTime = a.created_at ?? ""
          const bTime = b.created_at ?? ""
          return aTime.localeCompare(bTime)
        },
      )

      const olderMessages: ChatMessage[] = []
      for (const i of ordered) {
        if (i.user_message) {
          olderMessages.push({
            role: "user",
            content: i.user_message,
          })
        }
        if (i.agent_response) {
          olderMessages.push({
            role: "assistant",
            content: i.agent_response,
          })
        }
      }

      setMessages((prev) => [...olderMessages, ...prev])

      const newOldest = ordered.reduce<string | null>(
        (min, i) => {
          if (!i.created_at) return min
          if (!min || i.created_at < min) return i.created_at
          return min
        },
        oldestCreatedAt,
      )
      setOldestCreatedAt(newOldest)
      setHasMoreHistory(Boolean(data.hasMore))

      // Preserve scroll position so loading feels seamless.
      requestAnimationFrame(() => {
        const container = scrollContainerRef.current
        if (!container) return
        const newScrollHeight = container.scrollHeight
        const heightDiff =
          newScrollHeight - prevScrollHeight
        container.scrollTop = prevScrollTop + heightDiff
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim()) return
    setIsStreaming(true)
    const userMsg: ChatMessage = {
      role: "user",
      content: text.trim(),
    }
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        role: "assistant",
        content: "",
        toolsUsed: [],
      },
    ])

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [userMsg],
          conversationHistory: messages,
        }),
      })

      const data = (await res.json()) as {
        text?: string
        tools_used?: string[]
        skill?: string
        error?: string
      }

      if (data.skill) {
        setSkillLabel(data.skill)
      }

      if (!res.ok || data.error) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content:
              data.error ??
              "Sorry, something went wrong. Please try again.",
          },
        ])
        setIsStreaming(false)
        return
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: data.text ?? "",
          toolsUsed: data.tools_used ?? [],
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please check your connection and try again.",
        },
      ])
    } finally {
      setIsStreaming(false)
    }
  }

  function handleSuggestionClick(text: string) {
    void sendMessage(text)
  }

  function refreshContext() {
    startRefresh(async () => {
      await fetch("/api/agent/context", { method: "POST" })
    })
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      <aside className="hidden w-80 flex-shrink-0 flex-col gap-3 border-r border-green-100 bg-green-50/60 p-4 md:flex">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-green-900">
            🌾 Agri OS Agent
          </h2>
          {skillLabel && (
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-green-800">
              {skillLabel}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={refreshContext}
          disabled={isRefreshingContext}
          className="mb-2 inline-flex items-center justify-center rounded-full border border-green-300 bg-white px-3 py-1 text-[11px] font-medium text-green-800 hover:bg-green-100"
        >
          {isRefreshingContext ? "Refreshing…" : "Refresh farm context"}
        </button>
        <ContextSummaryCard unreadAlerts={unreadAlerts} />
        {pendingRecommendations.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-[11px] font-semibold text-green-800">
              Pending recommendations
            </p>
            {pendingRecommendations.map((r) => (
              <RecommendationCard key={r.id} recommendation={r} />
            ))}
          </div>
        )}
      </aside>

      <main className="flex flex-1 flex-col bg-white">
        <div className="flex items-center justify-between border-b border-green-100 px-4 py-2 md:hidden">
          <div>
            <p className="text-sm font-semibold text-green-900">
              🌾 Agri OS Agent
            </p>
            {skillLabel && (
              <p className="text-[11px] text-gray-600">
                {skillLabel}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={refreshContext}
            disabled={isRefreshingContext}
            className="rounded-full border border-green-300 bg-green-50 px-3 py-1 text-[11px] font-medium text-green-800"
          >
            {isRefreshingContext ? "Refreshing…" : "Refresh context"}
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-3"
        >
          {messages.length === 0 && !isLoadingHistory && (
            <AgentSuggestions onSelect={handleSuggestionClick} />
          )}
          <div className="space-y-3">
            {isLoadingHistory && (
              <p className="text-[11px] text-gray-400">
                Loading earlier messages…
              </p>
            )}
            {messages.map((m, idx) => (
              <AgentMessage
                key={idx}
                role={m.role}
                content={m.content}
                toolsUsed={m.toolsUsed}
              />
            ))}
            {isStreaming && (
              <p className="text-[11px] text-gray-400">
                Agent is thinking…
              </p>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="border-t border-green-100 px-4 py-3">
          <AgentInput
            onSend={sendMessage}
            disabled={isStreaming}
          />
        </div>
      </main>
    </div>
  )
}

