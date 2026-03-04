"use client"

import NumberFlow, { type Format } from "@number-flow/react"

interface AnimatedNumberProps {
  value: number
  prefix?: string
  suffix?: string
  format?: Format
  className?: string
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  format,
  className = "",
}: AnimatedNumberProps) {
  const defaultFormat: Format =
    format ??
    ({
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    } satisfies Format)

  return (
    <span className={`font-mono ${className}`}>
      {prefix}
      <NumberFlow
        value={value}
        format={defaultFormat}
        transformTiming={{ duration: 600, easing: "ease-out" }}
        spinTiming={{ duration: 500, easing: "ease-out" }}
        opacityTiming={{ duration: 300, easing: "ease-out" }}
      />
      {suffix}
    </span>
  )
}

export function AnimatedINR({
  value,
  className = "",
}: {
  value: number
  className?: string
}) {
  const display =
    value >= 10_00_000
      ? { val: value / 10_00_000, suffix: " Cr" }
      : value >= 1_00_000
        ? { val: value / 1_00_000, suffix: " L" }
        : value >= 1_000
          ? { val: value / 1_000, suffix: "K" }
          : { val: value, suffix: "" }

  return (
    <span className={`font-mono ${className}`}>
      ₹
      <NumberFlow
        value={display.val}
        format={
          {
            minimumFractionDigits: display.val >= 10 ? 0 : 1,
            maximumFractionDigits: 1,
          } satisfies Format
        }
        transformTiming={{ duration: 700, easing: "ease-out" }}
      />
      {display.suffix}
    </span>
  )
}

