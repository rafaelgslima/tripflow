import { useResetPasswordForm } from "@/hooks/useResetPasswordForm";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { PasswordInput } from "@/components/Form/PasswordInput";
import type { ResetPasswordFormProps } from "./types";

export function ResetPasswordForm(_props: ResetPasswordFormProps) {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isSuccess,
    isSessionLoading,
    hasValidSession,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useResetPasswordForm();

  if (isSessionLoading) {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-center text-tf-muted">Verifying recovery link…</p>
        <LoadingSpinner />
      </div>
    );
  }

  if (!hasValidSession) {
    return (
      <div className="flex flex-col gap-5">
        <div className="tf-alert-error" role="alert">
          {errors.general || "Recovery link expired or invalid. Please request a new password reset."}
        </div>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      {isSuccess && (
        <div className="tf-alert-success" role="alert">
          Password reset successful! Redirecting to login…
        </div>
      )}
      {errors.general && (
        <div className="tf-alert-error" role="alert">{errors.general}</div>
      )}

      <p className="text-[13px] text-tf-muted font-outfit leading-relaxed text-center">
        Enter your new password below. Make sure it&apos;s strong and secure.
      </p>

      <div>
        <label htmlFor="password" className="tf-label">New password</label>
        <PasswordInput
          id="password"
          name="password"
          value={values.password}
          onChange={(value) => handleChange({ target: { name: "password", value } } as any)}
          onBlur={() => handleBlur("password")}
          autoComplete="new-password"
          disabled={isSubmitting || isSuccess}
          hasError={touched.password && !!errors.password}
          ariaInvalid={touched.password && !!errors.password}
          ariaDescribedBy={touched.password && errors.password ? "password-error" : undefined}
          placeholder="Enter new password"
        />
        {touched.password && errors.password && (
          <p id="password-error" className="text-xs text-red-300 font-outfit mt-1" role="alert">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="tf-label">Confirm password</label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={(value) => handleChange({ target: { name: "confirmPassword", value } } as any)}
          onBlur={() => handleBlur("confirmPassword")}
          autoComplete="new-password"
          disabled={isSubmitting || isSuccess}
          hasError={touched.confirmPassword && !!errors.confirmPassword}
          ariaInvalid={touched.confirmPassword && !!errors.confirmPassword}
          ariaDescribedBy={touched.confirmPassword && errors.confirmPassword ? "confirm-password-error" : undefined}
          placeholder="Confirm new password"
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <p id="confirm-password-error" className="text-xs text-red-300 font-outfit mt-1" role="alert">{errors.confirmPassword}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting || isSuccess} className="tf-btn-primary">
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="text-stone-900" />
            Resetting password…
          </>
        ) : isSuccess ? "Password reset" : "Reset password"}
      </button>
    </form>
  );
}
