'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <p className="mb-4 text-5xl">🌾</p>
      <h2 className="mb-2 text-xl font-semibold text-gray-800">
        Something went wrong
      </h2>
      <p className="mb-6 text-sm text-gray-500">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-green-700 px-6 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  )
}

