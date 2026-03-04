import { SignupForm } from "@/components/auth/SignupForm"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-green-800">🌾 Agri OS</h1>
          <p className="mt-2 text-green-700">
            Create your personal farm OS account
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}

