'use client'

import { useState } from "react"
import Link from "next/link"

import { signUp } from "@/app/(auth)/signup/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AuthActionState = {
  error?: string | null
}

function SubmitButton({ pending }: { pending: boolean }) {

  return (
    <Button
      type="submit"
      className="w-full bg-green-700 text-white hover:bg-green-800"
      disabled={pending}
    >
      {pending ? "Creating account..." : "Sign up"}
    </Button>
  )
}

export function SignupForm() {
  const [state, setState] = useState<AuthActionState | undefined>(undefined)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setPending(true)
    setState(undefined)

    const result = await signUp(formData)
    if (result && "error" in result && result.error) {
      setState({ error: result.error })
      setPending(false)
    }
    // On success, the server action will redirect to /onboarding.
  }

  return (
    <Card className="border-green-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-green-900">
          Create your Agri OS account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          {state?.error ? (
            <p className="text-sm text-red-600">{state.error}</p>
          ) : null}

          <SubmitButton pending={pending} />
        </form>

        <p className="pt-2 text-center text-sm text-gray-600">
          Already using Agri OS?{" "}
          <Link
            href="/login"
            className="font-medium text-green-700 underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

