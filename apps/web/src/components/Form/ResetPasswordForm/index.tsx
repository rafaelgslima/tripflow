import { useState } from "react";
import { useResetPasswordForm } from "@/hooks/useResetPasswordForm";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import type { ResetPasswordFormProps } from "./types";

const showHideBtnClass =
  "absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-xs font-medium text-tf-muted font-outfit p-1";

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
            className={`tf-input${touched.password && errors.password ? " tf-input--error" : ""}`}
            style={{ paddingRight: "56px" }}
            placeholder="Enter new password"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting || isSuccess} className={showHideBtnClass} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {touched.password && errors.password && (
          <p className="text-xs text-red-300 font-outfit mt-1" role="alert">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="tf-label">Confirm password</label>
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
            className={`tf-input${touched.confirmPassword && errors.confirmPassword ? " tf-input--error" : ""}`}
            style={{ paddingRight: "56px" }}
            placeholder="Confirm new password"
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isSubmitting || isSuccess} className={showHideBtnClass} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
        {touched.confirmPassword && errors.confirmPassword && (
          <p className="text-xs text-red-300 font-outfit mt-1" role="alert">{errors.confirmPassword}</p>
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
