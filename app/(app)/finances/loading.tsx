export default function Loading() {
  return (
    <div className="p-4 md:p-8 space-y-4 max-w-6xl">
      <div className="h-20 skeleton" />
      <div className="h-32 skeleton" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-48 skeleton" />
        <div className="h-48 skeleton" />
      </div>
    </div>
  )
}

