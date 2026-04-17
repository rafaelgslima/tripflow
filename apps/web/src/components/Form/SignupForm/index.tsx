import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { useSignupForm } from "@/hooks/useSignupForm";
import { PasswordInput } from "@/components/Form/PasswordInput";
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

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <div role="group" aria-labelledby="signup-form-title" className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="tf-label"
          >
            Full Name{" "}
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
            className={`tf-input${touched.name && errors.name ? " tf-input--error" : ""}`}
            placeholder="John Doe"
          />
          {touched.name && errors.name && (
            <p
              id="name-error"
              className="text-xs text-red-300 font-outfit mt-1"
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
            className="tf-label"
          >
            Email address{" "}
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
            className={`tf-input${touched.email && errors.email ? " tf-input--error" : ""}`}
            placeholder="you@example.com"
          />
          {touched.email && errors.email && (
            <p
              id="email-error"
              className="text-xs text-red-300 font-outfit mt-1"
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
            className="tf-label"
          >
            Password{" "}
          </label>
          <PasswordInput
            id="password"
            name="password"
            value={values.password}
            onChange={(value) => handleChange("password", value)}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => {
              setIsPasswordFocused(false);
              handleBlur("password");
            }}
            autoComplete="new-password"
            required
            hasError={touched.password && !!errors.password}
            ariaInvalid={touched.password && !!errors.password}
            ariaDescribedBy={
              touched.password && errors.password
                ? "password-error password-requirements"
                : "password-requirements"
            }
          />
          {touched.password && errors.password && (
            <p
              id="password-error"
              className="text-xs text-red-300 font-outfit mt-1"
              role="alert"
            >
              {errors.password}
            </p>
          )}
          {isPasswordFocused && (
            <div id="password-requirements" className="mt-[10px] flex flex-col gap-1.5">
              <p className="text-[11px] font-semibold text-tf-muted font-outfit uppercase tracking-[0.06em] mb-1">
                Password must contain:
              </p>
              <div className={`flex items-center gap-2 text-xs font-outfit ${passwordRequirements.minLength ? "text-green-400" : "text-tf-muted"}`}>
                {passwordRequirements.minLength ? (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-outfit ${passwordRequirements.hasUppercase ? "text-green-400" : "text-tf-muted"}`}>
                {passwordRequirements.hasUppercase ? (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span>One uppercase letter</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-outfit ${passwordRequirements.hasLowercase ? "text-green-400" : "text-tf-muted"}`}>
                {passwordRequirements.hasLowercase ? (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span>One lowercase letter</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-outfit ${passwordRequirements.hasNumber ? "text-green-400" : "text-tf-muted"}`}>
                {passwordRequirements.hasNumber ? (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span>One number</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-outfit ${passwordRequirements.hasSpecialChar ? "text-green-400" : "text-tf-muted"}`}>
                {passwordRequirements.hasSpecialChar ? (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
            className="tf-label"
          >
            Confirm Password{" "}
          </label>
          <PasswordInput
            id="confirm-password"
            name="confirm-password"
            value={values.confirmPassword}
            onChange={(value) => handleChange("confirmPassword", value)}
            onBlur={() => handleBlur("confirmPassword")}
            autoComplete="new-password"
            required
            hasError={touched.confirmPassword && !!errors.confirmPassword}
            ariaInvalid={touched.confirmPassword && !!errors.confirmPassword}
            ariaDescribedBy={
              touched.confirmPassword && errors.confirmPassword
                ? "confirm-password-error"
                : undefined
            }
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p
              id="confirm-password-error"
              className="text-xs text-red-300 font-outfit mt-1"
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
            className="tf-checkbox"
          />
        </div>
        <div>
          <label htmlFor="terms" className="text-[13px] text-tf-muted font-outfit cursor-pointer leading-[1.5]">
            <span id="terms-description">
              I agree to the{" "}
              <a href="#" className="text-tf-amber no-underline font-medium">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-tf-amber no-underline font-medium">Privacy Policy</a>
            </span>
          </label>
          {touched.termsAccepted && errors.termsAccepted && (
            <p
              id="terms-error"
              className="text-xs text-red-300 font-outfit mt-1"
              role="alert"
            >
              {errors.termsAccepted}
            </p>
          )}
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="tf-btn-primary">
        {isSubmitting ? (
          <><span className="sr-only">Submitting form, please wait</span><span aria-hidden="true">Creating account…</span></>
        ) : "Create account"}
      </button>

      {isSuccess && (
        <div className="tf-alert-success" role="alert">
          <strong>Account created!</strong> We&apos;ve sent a confirmation email to your inbox. Click the link to activate your account.
        </div>
      )}

      {errors.general && (
        <div className="tf-alert-error" role="alert">{errors.general}</div>
      )}

      <p className="text-center text-[13px] text-tf-muted font-outfit">
        Already have an account?{" "}
        <Link href={signInHref} className="text-tf-amber no-underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
