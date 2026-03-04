import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-8 text-center">
      <p className="mb-4 text-6xl">🌾</p>
      <h1 className="mb-2 text-2xl font-bold text-green-800">
        Page not found
      </h1>
      <p className="mb-8 text-gray-500">
        This page doesn&apos;t exist in Agri OS
      </p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-green-700 px-6 py-3 font-medium text-white"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}

