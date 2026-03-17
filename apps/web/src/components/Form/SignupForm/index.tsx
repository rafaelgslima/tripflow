import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { useSignupForm } from "@/hooks/useSignupForm";
import type { SignupFormProps } from "./types";

export function SignupForm({ onSuccess }: SignupFormProps) {
  const router = useRouter();
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isSuccess,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useSignupForm();

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const nextRaw = router.query.next;
  const nextUrl =
    typeof nextRaw === "string" && nextRaw.trim() ? nextRaw.trim() : null;
  const signInHref = nextUrl
    ? `/login?next=${encodeURIComponent(nextUrl)}`
    : "/login";

  // Password requirement checks
  const passwordRequirements = {
    minLength: values.password.length >= 8,
    hasUppercase: /[A-Z]/.test(values.password),
    hasLowercase: /[a-z]/.test(values.password),
    hasNumber: /\d/.test(values.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(values.password),
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit} noValidate>
      <div
        className="space-y-4"
        role="group"
        aria-labelledby="signup-form-title"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name{" "}
            <span className="text-red-600" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={touched.name && errors.name ? "true" : "false"}
            aria-describedby={
              touched.name && errors.name ? "name-error" : undefined
            }
            value={values.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            className={`appearance-none relative block w-full px-3 py-2 border ${
              touched.name && errors.name
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
            placeholder="John Doe"
          />
          {touched.name && errors.name && (
            <p
              id="name-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
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
            aria-required="true"
            aria-invalid={touched.email && errors.email ? "true" : "false"}
            aria-describedby={
              touched.email && errors.email ? "email-error" : undefined
            }
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={`appearance-none relative block w-full px-3 py-2 border ${
              touched.email && errors.email
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
            placeholder="you@example.com"
          />
          {touched.email && errors.email && (
            <p
              id="email-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password{" "}
            <span className="text-red-600" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-required="true"
            aria-invalid={
              touched.password && errors.password ? "true" : "false"
            }
            aria-describedby={
              touched.password && errors.password
                ? "password-error password-requirements"
                : "password-requirements"
            }
            value={values.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => {
              setIsPasswordFocused(false);
              handleBlur("password");
            }}
            className={`appearance-none relative block w-full px-3 py-2 border ${
              touched.password && errors.password
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
            placeholder="••••••••"
          />
          {touched.password && errors.password && (
            <p
              id="password-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.password}
            </p>
          )}
          {isPasswordFocused && (
            <div id="password-requirements" className="mt-2 text-xs space-y-1">
              <p className="font-medium text-gray-700 mb-1.5">
                Password must contain:
              </p>
              <div
                className={`flex items-center gap-2 transition-colors ${
                  passwordRequirements.minLength
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {passwordRequirements.minLength ? (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>At least 8 characters</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-colors ${
                  passwordRequirements.hasUppercase
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {passwordRequirements.hasUppercase ? (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>One uppercase letter</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-colors ${
                  passwordRequirements.hasLowercase
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {passwordRequirements.hasLowercase ? (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>One lowercase letter</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-colors ${
                  passwordRequirements.hasNumber
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {passwordRequirements.hasNumber ? (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>One number</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-colors ${
                  passwordRequirements.hasSpecialChar
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {passwordRequirements.hasSpecialChar ? (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>One special character</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Password{" "}
            <span className="text-red-600" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            aria-required="true"
            aria-invalid={
              touched.confirmPassword && errors.confirmPassword
                ? "true"
                : "false"
            }
            aria-describedby={
              touched.confirmPassword && errors.confirmPassword
                ? "confirm-password-error"
                : undefined
            }
            value={values.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            className={`appearance-none relative block w-full px-3 py-2 border ${
              touched.confirmPassword && errors.confirmPassword
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
            placeholder="••••••••"
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p
              id="confirm-password-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            aria-required="true"
            aria-invalid={
              touched.termsAccepted && errors.termsAccepted ? "true" : "false"
            }
            aria-describedby={
              touched.termsAccepted && errors.termsAccepted
                ? "terms-error"
                : "terms-description"
            }
            checked={values.termsAccepted}
            onChange={(e) => handleChange("termsAccepted", e.target.checked)}
            onBlur={() => handleBlur("termsAccepted")}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2 border-gray-300 rounded transition-colors"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="terms" className="text-gray-600">
            <span id="terms-description">
              I agree to the{" "}
              <a
                href="#"
                className="text-primary-600 hover:text-primary-700 font-medium underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-primary-600 hover:text-primary-700 font-medium underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
              >
                Privacy Policy
              </a>
            </span>
          </label>
          {touched.termsAccepted && errors.termsAccepted && (
            <p
              id="terms-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.termsAccepted}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          aria-live="polite"
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
        >
          {isSubmitting ? (
            <>
              <span className="sr-only">Submitting form, please wait</span>
              <span aria-hidden="true">Creating account...</span>
            </>
          ) : (
            "Create account"
          )}
        </button>

        {/* Success Message */}
        {isSuccess && (
          <div
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            role="alert"
          >
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Account created successfully!
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  We&apos;ve sent a confirmation email to your inbox. Please
                  check your email and click the confirmation link before
                  logging in.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Registration failed
                </h3>
                <p className="mt-1 text-sm text-red-700">{errors.general}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href={signInHref}
            className="font-medium text-primary-600 hover:text-primary-700 underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
