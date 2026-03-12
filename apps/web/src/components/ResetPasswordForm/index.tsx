import { useState } from "react";
import { useResetPasswordForm } from "@/hooks/useResetPasswordForm";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { ResetPasswordFormProps } from "./types";

export function ResetPasswordForm(_props: ResetPasswordFormProps) {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isSuccess,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useResetPasswordForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {/* Success Message */}
      {isSuccess && (
        <div
          className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg"
          role="alert"
        >
          <p className="text-sm font-medium">
            Password reset successful! Redirecting to login...
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
          Enter your new password below. Make sure it&apos;s strong and secure.
        </p>
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          New Password{" "}
          <span className="text-red-600" aria-hidden="true">
            *
          </span>
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={values.password}
            onChange={handleChange}
            onBlur={() => handleBlur("password")}
            disabled={isSubmitting || isSuccess}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isSubmitting || isSuccess}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {touched.password && errors.password && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirm Password{" "}
          <span className="text-red-600" aria-hidden="true">
            *
          </span>
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={() => handleBlur("confirmPassword")}
            disabled={isSubmitting || isSuccess}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isSubmitting || isSuccess}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
        {touched.confirmPassword && errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.confirmPassword}
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
              Resetting password...
            </>
          ) : isSuccess ? (
            "Password reset"
          ) : (
            "Reset password"
          )}
        </button>
      </div>
    </form>
  );
}
