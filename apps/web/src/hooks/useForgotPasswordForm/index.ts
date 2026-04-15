import { useState, useCallback, type FormEvent } from "react";
import { validateEmail } from "@/utils/validation";
import type {
  ForgotPasswordFormValues,
  ForgotPasswordFormErrors,
  UseForgotPasswordFormReturn,
} from "./types";

export function useForgotPasswordForm(): UseForgotPasswordFormReturn {
  const [values, setValues] = useState<ForgotPasswordFormValues>({
    email: "",
  });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [touched, setTouched] = useState({ email: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setValues({ email: value });

      // Clear errors when typing
      if (errors.email) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    },
    [errors.email],
  );

  const handleBlur = useCallback(() => {
    setTouched({ email: true });

    // Validate email on blur
    const emailError = validateEmail(values.email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  }, [values.email]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Validate email
      const emailError = validateEmail(values.email);
      if (emailError) {
        setErrors({ email: emailError });
        setTouched({ email: true });
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        });

        if (!response.ok) {
          setErrors({ general: "Failed to send reset email. Please try again." });
          setIsSuccess(false);
        } else {
          setIsSuccess(true);
          setErrors({});
        }
      } catch (err) {
        setErrors({ general: "Failed to send reset email. Please try again." });
        setIsSuccess(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values.email],
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isSuccess,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
