import { useState, useCallback, useEffect } from "react";
import { validateName } from "@/utils/validation";
import { getSupabaseAccessToken } from "@/utils/getSupabaseAccessToken";
import type {
  EditProfileFormValues,
  EditProfileFormErrors,
  EditProfileFormTouched,
  UseEditProfileFormReturn,
} from "./types";

export function useEditProfileForm(initialName: string): UseEditProfileFormReturn {
  const [values, setValues] = useState<EditProfileFormValues>({
    name: initialName,
  });
  const [errors, setErrors] = useState<EditProfileFormErrors>({});
  const [touched, setTouched] = useState<EditProfileFormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Update name when the initialName prop changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (initialName && initialName !== values.name) {
      setValues((prev) => ({ ...prev, name: initialName }));
    }
  }, [initialName]);

  const handleChange = useCallback(
    (field: keyof EditProfileFormValues, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));

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
    (field: keyof EditProfileFormValues) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (field === "name") {
        const nameError = validateName(values.name);
        if (nameError) {
          setErrors((prev) => ({ ...prev, name: nameError }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.name;
            return newErrors;
          });
        }
      }
    },
    [values.name],
  );

  const handleSubmit = useCallback(async () => {
    const nameError = validateName(values.name);

    if (nameError) {
      setErrors({ name: nameError });
      setTouched({ name: true });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const token = await getSupabaseAccessToken();
      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: values.name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update profile");
      }

      const data = await response.json();
      setValues({ name: data.name });
      setIsSuccess(true);
      setErrors({});
    } catch (err) {
      setErrors({
        general:
          err instanceof Error ? err.message : "Failed to update profile",
      });
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [values.name]);

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
