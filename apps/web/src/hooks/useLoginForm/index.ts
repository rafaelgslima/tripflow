import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { validateEmail } from "@/utils/validation";
import type {
  LoginFormValues,
  LoginFormErrors,
  UseLoginFormReturn,
} from "./types";

const REMEMBERED_EMAIL_KEY = "tripflow_remembered_email";

export function useLoginForm(): UseLoginFormReturn {
  const router = useRouter();
  const [values, setValues] = useState<LoginFormValues>(() => {
    // Try to load remembered email from localStorage
    if (typeof window !== "undefined") {
      const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (rememberedEmail) {
        return {
          email: rememberedEmail,
          password: "",
          rememberMe: true,
        };
      }
    }
    return {
      email: "",
      password: "",
      rememberMe: false,
    };
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Save/remove email from localStorage when rememberMe changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (values.rememberMe && values.email) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, values.email);
      } else if (!values.rememberMe) {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    }
  }, [values.rememberMe, values.email]);

  const validators = {
    email: (v: LoginFormValues) => validateEmail(v.email),
    password: (v: LoginFormValues) =>
      v.password.trim() ? null : "Password is required",
  };

  const handleChange =
    (field: keyof LoginFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "rememberMe" ? e.target.checked : e.target.value;

      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error for this field when user starts typing
      if (errors[field as keyof LoginFormErrors]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as keyof LoginFormErrors];
          return newErrors;
        });
      }
    };

  const handleBlur = (field: keyof LoginFormValues) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    // Validate field on blur
    if (field === "email" || field === "password") {
      const validator = validators[field];
      const error = validator(values);

      setErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors and success state
    setErrors({});
    setIsSuccess(false);

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    // Validate all fields
    const emailError = validateEmail(values.email);
    const passwordError = values.password.trim()
      ? null
      : "Password is required";

    const newErrors: LoginFormErrors = {};
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        // Check for specific error types
        if (
          error.message.toLowerCase().includes("email not confirmed") ||
          error.message.toLowerCase().includes("email confirmation")
        ) {
          setErrors({
            general:
              "Please confirm your email address before logging in. Check your inbox for the confirmation link.",
          });
        } else if (
          error.message.toLowerCase().includes("invalid") ||
          error.message.toLowerCase().includes("credentials")
        ) {
          setErrors({
            general: "Invalid email or password. Please try again.",
          });
        } else {
          setErrors({
            general:
              error.message ||
              "An error occurred during login. Please try again.",
          });
        }
        return;
      }

      if (data.user && data.session) {
        // Login successful
        setIsSuccess(true);
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push("/home");
        }, 500);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Login error:", error);
      }
      setErrors({
        general: "An error occurred during login. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
