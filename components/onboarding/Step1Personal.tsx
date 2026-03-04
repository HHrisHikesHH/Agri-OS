'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Step1Props = {
  name: string
  phone: string
  language: string
  onChange: (partial: {
    name?: string
    phone?: string
    language?: string
  }) => void
}

export function Step1Personal({
  name,
  phone,
  language,
  onChange,
}: Step1Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-green-800">
        Let&apos;s start with a few quick details about you. This helps Agri OS
        speak to you in the right language and tone.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Bhimrao Ambedkar"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">WhatsApp number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="e.g. 98765 43210"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Preferred language</Label>
        <Select
          value={language}
          onValueChange={(value) => onChange({ language: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="kn">Kannada</SelectItem>
            <SelectItem value="hi">Hindi</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

