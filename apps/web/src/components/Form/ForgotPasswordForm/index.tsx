import Link from "next/link";
import { useForgotPasswordForm } from "@/hooks/useForgotPasswordForm";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
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
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      {isSuccess && (
        <div className="tf-alert-success" role="alert">
          Password reset email sent! Check your inbox for instructions.
        </div>
      )}
      {errors.general && (
        <div className="tf-alert-error" role="alert">{errors.general}</div>
      )}

      <p className="text-[13px] text-tf-muted font-outfit leading-relaxed text-center">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      <div>
        <label htmlFor="email" className="tf-label">Email address</label>
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
          className={`tf-input${touched.email && errors.email ? " tf-input--error" : ""}`}
          placeholder="you@example.com"
        />
        {touched.email && errors.email && (
          <p className="text-xs text-red-300 font-outfit mt-1" role="alert">{errors.email}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting || isSuccess} className="tf-btn-primary">
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="text-stone-900" />
            Sending…
          </>
        ) : isSuccess ? "Email sent" : "Send reset link"}
      </button>

      <p className="text-center">
        <Link href="/login" className="text-[13px] text-tf-amber no-underline font-outfit">
          Back to login
        </Link>
      </p>
    </form>
  );
}
