import Link from "next/link";
import { useRouter } from "next/router";
import { useLoginForm } from "@/hooks/useLoginForm";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import type { LoginFormProps } from "./types";

export function LoginForm(_props: LoginFormProps) {
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
  } = useLoginForm();

  const nextRaw = router.query.next;
  const nextUrl =
    typeof nextRaw === "string" && nextRaw.trim() ? nextRaw.trim() : null;
  const signupHref = nextUrl
    ? `/signup?next=${encodeURIComponent(nextUrl)}`
    : "/signup";

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="tf-label">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
            className={`tf-input${touched.email && errors.email ? " tf-input--error" : ""}`}
            placeholder="you@example.com"
          />
          {touched.email && errors.email && (
            <p className="text-xs text-red-300 font-outfit mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="tf-label" style={{ marginBottom: 0 }}>Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-tf-amber no-underline font-outfit"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={values.password}
            onChange={handleChange("password")}
            onBlur={handleBlur("password")}
            className={`tf-input${touched.email && errors.email ? " tf-input--error" : ""}`}
            placeholder="••••••••"
          />
          {touched.password && errors.password && (
            <p className="text-xs text-red-300 font-outfit mt-1">{errors.password}</p>
          )}
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          checked={values.rememberMe}
          onChange={handleChange("rememberMe")}
          className="tf-checkbox"
        />
        <label htmlFor="remember-me" className="text-[13px] text-tf-muted font-outfit cursor-pointer">
          Remember me
        </label>
      </div>

      {errors.general && (
        <div className="tf-alert-error" role="alert">{errors.general}</div>
      )}

      <button type="submit" disabled={isSubmitting || isSuccess} className="tf-btn-primary">
        {isSubmitting ? (
          <>
            <LoadingSpinner size="md" className="text-stone-900" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

      <p className="text-center text-[13px] text-tf-muted font-outfit">
        Don&apos;t have an account?{" "}
        <Link href={signupHref} className="text-tf-amber no-underline font-medium">
          Sign up
        </Link>
      </p>
    </form>
  );
}
