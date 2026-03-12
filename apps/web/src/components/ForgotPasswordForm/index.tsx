import Link from "next/link";
import { useForgotPasswordForm } from "@/hooks/useForgotPasswordForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { ForgotPasswordFormProps } from "./types";

export function ForgotPasswordForm(_props: ForgotPasswordFormProps) {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isSuccess,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForgotPasswordForm();

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {/* Success Message */}
      {isSuccess && (
        <div
          className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg"
          role="alert"
        >
          <p className="text-sm font-medium">
            Password reset email sent! Check your inbox for instructions.
          </p>
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
          role="alert"
        >
          <p className="text-sm">{errors.general}</p>
        </div>
      )}

      {/* Instructional Text */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email address{" "}
          <span className="text-red-600" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting || isSuccess}
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="you@example.com"
        />
        {touched.email && errors.email && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="-ml-1 mr-3 text-white" />
              Sending...
            </>
          ) : isSuccess ? (
            "Email sent"
          ) : (
            "Send reset link"
          )}
        </button>
      </div>

      {/* Back to Login Link */}
      <div className="text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
        >
          Back to login
        </Link>
      </div>
    </form>
  );
}
