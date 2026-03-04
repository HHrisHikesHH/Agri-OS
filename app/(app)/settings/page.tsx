import { ThemeSelector } from "@/components/ui/ThemeSelector"

export default function SettingsPage() {
  return (
    <div className="max-w-3xl p-4 md:p-8">
      <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">
        Settings
      </h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Configure how Agri OS looks and feels.
      </p>

      <section className="mt-6 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 p-6 shadow-sm dark:shadow-gray-950">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
          🎨 Appearance
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Choose how Agri OS looks. System follows your device setting.
        </p>
        <ThemeSelector />
      </section>
    </div>
  )
}

