import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignupForm } from "@/components/SignupForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="relative mb-2">
            <Link
              href="/"
              className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Link>
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start planning your perfect trip today
          </p>
        </div>

        {/* Sign Up Form */}
        <SignupForm />
      </div>
    </div>
  );
}
