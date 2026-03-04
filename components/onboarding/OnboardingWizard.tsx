'use client'

import { useMemo, useState } from "react"

import type { OnboardingData } from "@/app/(app)/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

import { Step1Personal } from "./Step1Personal"
import { Step2Location } from "./Step2Location"
import { Step3Land } from "./Step3Land"
import { Step4Portfolio } from "./Step4Portfolio"
import { Step5Goals } from "./Step5Goals"

type OnboardingWizardProps = {
  onComplete: (data: OnboardingData) => Promise<{ error?: string } | void>
}

const initialData: OnboardingData = {
  name: "",
  phone: "",
  language: "en",
  village: "",
  taluk: "",
  district: "",
  state: "Karnataka",
  total_acres: 0,
  soil_types: [],
  water_status: "scarce",
  capital_status: "zero",
  portfolio: [],
  primary_goal: "",
  risk_appetite: "low",
  year1_target_revenue: undefined,
}

const TOTAL_STEPS = 5

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const progress = useMemo(
    () => (step / TOTAL_STEPS) * 100,
    [step],
  )

  function update<K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K],
  ) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function validateStep(currentStep: number): string | null {
    if (currentStep === 1) {
      if (!data.name.trim()) return "Please enter your name."
      if (!data.phone.trim()) return "Please enter your phone number."
      if (!data.language) return "Please select a preferred language."
    }
    if (currentStep === 2) {
      if (!data.village.trim()) return "Please enter your village."
      if (!data.taluk.trim()) return "Please enter your taluk."
      if (!data.district.trim()) return "Please enter your district."
      if (!data.state.trim()) return "Please enter your state."
    }
    if (currentStep === 3) {
      if (!data.total_acres || data.total_acres <= 0) {
        return "Please enter your total land in acres."
      }
      if (!data.soil_types || data.soil_types.length === 0) {
        return "Please select at least one soil type."
      }
      if (!data.water_status) return "Please select your water status."
      if (!data.capital_status) return "Please select your capital status."
    }
    if (currentStep === 4) {
      if (!data.portfolio || data.portfolio.length === 0) {
        return "Please add at least one crop, tree, or enterprise."
      }
    }
    if (currentStep === 5) {
      if (!data.primary_goal.trim()) {
        return "Please describe your primary farming goal."
      }
      if (!data.risk_appetite) {
        return "Please choose your risk appetite."
      }
    }
    return null
  }

  async function handleNext() {
    const validationError = validateStep(step)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setStep((prev) => Math.min(TOTAL_STEPS, prev + 1))
  }

  function handleBack() {
    setError(null)
    setStep((prev) => Math.max(1, prev - 1))
  }

  async function handleComplete() {
    const validationError = validateStep(5)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const result = await onComplete(data)
      if (result && "error" in result && result.error) {
        setIsSubmitting(false)
        setError(result.error)
      }
      // On success the server action will redirect.
    } catch (e) {
      setIsSubmitting(false)
      setError("Something went wrong while saving your details.")
      console.error(e)
    }
  }

  const stepLabel = useMemo(() => {
    switch (step) {
      case 1:
        return "About you"
      case 2:
        return "Your location"
      case 3:
        return "Your land & resources"
      case 4:
        return "Your current portfolio"
      case 5:
        return "Your goals"
      default:
        return ""
    }
  }, [step])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-green-50 p-4">
      {isSubmitting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-green-900/20 backdrop-blur-sm">
          <Card className="border-green-200 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-900">
                Setting up your Agri OS…
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={90} />
              <p className="text-sm text-green-800">
                We are creating your farm profile, seasons, and starting
                intelligence. This only takes a moment.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="relative w-full max-w-3xl">
        <Card className="border-green-100 bg-white/90 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                  Step {step} of {TOTAL_STEPS}
                </p>
                <CardTitle className="mt-1 text-xl text-green-900">
                  {stepLabel}
                </CardTitle>
              </div>
              <div className="hidden text-right text-xs text-green-700 sm:block">
                <p>Warm, friendly setup. No government-form vibes.</p>
              </div>
            </div>
            <div>
              <Progress value={progress} />
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-6 pt-6">
            {error ? (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {step === 1 && (
              <Step1Personal
                name={data.name}
                phone={data.phone}
                language={data.language}
                onChange={(partial) => setData((prev) => ({ ...prev, ...partial }))}
              />
            )}
            {step === 2 && (
              <Step2Location
                village={data.village}
                taluk={data.taluk}
                district={data.district}
                state={data.state}
                onChange={(partial) => setData((prev) => ({ ...prev, ...partial }))}
              />
            )}
            {step === 3 && (
              <Step3Land
                total_acres={data.total_acres}
                soil_types={data.soil_types}
                water_status={data.water_status}
                capital_status={data.capital_status}
                onChange={(partial) => setData((prev) => ({ ...prev, ...partial }))}
              />
            )}
            {step === 4 && (
              <Step4Portfolio
                portfolio={data.portfolio}
                onChange={(portfolio) => update("portfolio", portfolio)}
              />
            )}
            {step === 5 && (
              <Step5Goals
                primary_goal={data.primary_goal}
                risk_appetite={data.risk_appetite}
                year1_target_revenue={data.year1_target_revenue}
                onChange={(partial) => setData((prev) => ({ ...prev, ...partial }))}
              />
            )}

            <div className="mt-4 flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-green-800 hover:bg-green-100"
                disabled={step === 1}
                onClick={handleBack}
              >
                Back
              </Button>

              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  className="bg-green-700 text-white hover:bg-green-800"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  className="bg-green-700 text-white hover:bg-green-800"
                  onClick={handleComplete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Finishing setup..." : "Complete setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-xs text-green-800">
          You can change all these details later inside Agri OS.
        </div>
      </div>
    </div>
  )
}

