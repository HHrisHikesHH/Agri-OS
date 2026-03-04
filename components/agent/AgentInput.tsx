'use client'

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  onSend: (text: string) => void
  disabled?: boolean
}

export function AgentInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSend(value)
    setValue("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2"
    >
      <Input
        placeholder="Ask about crops, prices, profits, or schemes…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        className="flex-1 border-green-200 text-xs"
      />
      <Button
        type="submit"
        size="sm"
        disabled={disabled}
        className="bg-green-700 text-xs text-white hover:bg-green-800"
      >
        Send
      </Button>
    </form>
  )
}

