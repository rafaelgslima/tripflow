export interface EditProfileFormValues {
  name: string;
}

export interface EditProfileFormErrors {
  name?: string;
  general?: string;
}

export interface EditProfileFormTouched {
  name?: boolean;
}

export interface UseEditProfileFormReturn {
  values: EditProfileFormValues;
  errors: EditProfileFormErrors;
  touched: EditProfileFormTouched;
  isSubmitting: boolean;
  isSuccess: boolean;
  handleChange: (field: keyof EditProfileFormValues, value: string) => void;
  handleBlur: (field: keyof EditProfileFormValues) => void;
  handleSubmit: () => Promise<void>;
}
