import { useState, useCallback, useEffect, type FormEvent } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { validatePassword } from "@/utils/validation";
import type {
  ResetPasswordFormValues,
  ResetPasswordFormErrors,
  UseResetPasswordFormReturn,
} from "./types";

export function useResetPasswordForm(): UseResetPasswordFormReturn {
  const router = useRouter();
  const [values, setValues] = useState<ResetPasswordFormValues>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    const verifyRecoveryToken = async () => {
      try {
        const { token, type, email } = router.query;

        if (!token || type !== "recovery" || !email) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setHasValidSession(true);
          } else {
            setErrors({ general: "Recovery link expired or invalid. Please request a new password reset." });
          }
          setIsSessionLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.verifyOtp({
          email: email as string,
          token: token as string,
          type: "recovery",
        });

        if (error || !data?.session) {
          setErrors({ general: "Recovery link expired or invalid. Please request a new password reset." });
          setHasValidSession(false);
        } else {
          setHasValidSession(true);
        }
      } catch (err) {
        setErrors({ general: "Failed to verify recovery session." });
        setHasValidSession(false);
      } finally {
        setIsSessionLoading(false);
      }
    };

    if (router.isReady) {
      verifyRecoveryToken();
    }
  }, [router.isReady, router.query]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const field = name as keyof ResetPasswordFormValues;

      setValues((prev) => ({ ...prev, [field]: value }));

      // Clear errors when typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors],
  );

  const handleBlur = useCallback(
    (field: keyof ResetPasswordFormValues) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validate field on blur
      if (field === "password") {
        const passwordError = validatePassword(values.password);
        if (passwordError) {
          setErrors((prev) => ({ ...prev, password: passwordError }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.password;
            return newErrors;
          });
        }
      } else if (field === "confirmPassword") {
        if (values.password !== values.confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match",
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.confirmPassword;
            return newErrors;
          });
        }
      }
    },
    [values.password, values.confirmPassword],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!hasValidSession) {
        setErrors({ general: "No valid recovery session. Please request a new password reset." });
        return;
      }

      // Validate all fields
      const passwordError = validatePassword(values.password);
      const confirmPasswordError =
        values.password !== values.confirmPassword
          ? "Passwords do not match"
          : null;

      if (passwordError || confirmPasswordError) {
        setErrors({
          password: passwordError || undefined,
          confirmPassword: confirmPasswordError || undefined,
        });
        setTouched({ password: true, confirmPassword: true });
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        const { error } = await supabase.auth.updateUser({
          password: values.password,
        });

        if (error) {
          setErrors({
            general:
              "Failed to reset password. Please try again or request a new reset link.",
          });
          setIsSuccess(false);
        } else {
          setIsSuccess(true);
          setErrors({});
          // Redirect to login after successful password reset
          setTimeout(() => {
            router.push("/login");
          }, 500);
        }
      } catch (err) {
        setErrors({
          general:
            "Failed to reset password. Please try again or request a new reset link.",
        });
        setIsSuccess(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values.password, values.confirmPassword, router, hasValidSession],
  );

  return {
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
  };
}
