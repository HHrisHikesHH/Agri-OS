export default function Loading() {
  return (
    <div className="p-4 md:p-8 space-y-4 animate-pulse max-w-6xl">
      <div className="h-20 bg-gray-100 rounded-2xl" />
      <div className="h-32 bg-gray-100 rounded-2xl" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  )
}

