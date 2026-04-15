import { useState, useCallback } from "react";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePasswordMatch,
} from "@/utils/validation";
import type {
  SignupFormValues,
  SignupFormErrors,
  SignupFormTouched,
  UseSignupFormReturn,
} from "./types";

const initialValues: SignupFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
};

export function useSignupForm(
  onSubmit?: (values: SignupFormValues) => void | Promise<void>,
): UseSignupFormReturn {
  const [values, setValues] = useState<SignupFormValues>(initialValues);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [touched, setTouched] = useState<SignupFormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateField = useCallback(
    (
      field: keyof SignupFormValues,
      currentValues: SignupFormValues,
    ): string | null => {
      const validators: Record<
        keyof SignupFormValues,
        (values: SignupFormValues) => string | null
      > = {
        name: (v) => validateName(v.name),
        email: (v) => validateEmail(v.email),
        password: (v) => validatePassword(v.password),
        confirmPassword: (v) =>
          validatePasswordMatch(v.password, v.confirmPassword),
        termsAccepted: (v) =>
          v.termsAccepted ? null : "You must accept the terms and conditions",
      };

      return validators[field](currentValues);
    },
    [],
  );

  const handleChange = useCallback(
    (field: keyof SignupFormValues, value: string | boolean) => {
      setValues((prev) => {
        const newValues = { ...prev, [field]: value };

        // If field is touched, validate immediately
        setErrors((prevErrors) => {
          if (field in prevErrors) {
            const error = validateField(field, newValues);
            if (error) {
              return { ...prevErrors, [field]: error };
            } else {
              const { [field]: _, ...rest } = prevErrors;
              return rest;
            }
          }
          return prevErrors;
        });

        return newValues;
      });
    },
    [validateField],
  );

  const handleBlur = useCallback(
    (field: keyof SignupFormValues) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      setValues((currentValues) => {
        const error = validateField(field, currentValues);
        setErrors((prev) => {
          if (error) {
            return { ...prev, [field]: error };
          } else {
            const { [field]: _, ...rest } = prev;
            return rest;
          }
        });
        return currentValues;
      });
    },
    [validateField],
  );

  const validateAllFields = useCallback((): boolean => {
    const newErrors: SignupFormErrors = {};
    let isValid = true;

    const nameError = validateName(values.name);
    if (nameError) {
      newErrors.name = nameError;
      isValid = false;
    }

    const emailError = validateEmail(values.email);
    if (emailError) {
      newErrors.email = emailError;
      isValid = false;
    }

    const passwordError = validatePassword(values.password);
    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    }

    const confirmPasswordError = validatePasswordMatch(
      values.password,
      values.confirmPassword,
    );
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
      isValid = false;
    }

    if (!values.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [values]);

  const handleSubmit = useCallback(async () => {
    // Clear previous success/errors
    setIsSuccess(false);
    setErrors({});

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });

    const isValid = validateAllFields();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        setErrors((prev) => ({
          ...prev,
          general: errorData.message ?? "Failed to create account. Please try again.",
        }));
        return;
      }

      // Success!
      setIsSuccess(true);

      // Call optional onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: "An unexpected error occurred. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAllFields, onSubmit]);

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
