"use client"

import confetti from "canvas-confetti"

export function triggerSaleConfetti(amount: number) {
  const intensity =
    amount > 50_000 ? "big" : amount > 10_000 ? "medium" : "small"

  const colors = ["#16a34a", "#22c55e", "#86efac", "#fbbf24", "#f59e0b"]

  if (intensity === "big") {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors,
      shapes: ["circle", "square"],
    })
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors,
      })
    }, 200)
  } else if (intensity === "medium") {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors,
    })
  } else {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors,
      gravity: 1.5,
    })
  }
}

