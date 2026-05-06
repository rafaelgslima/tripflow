export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export interface UseResetPasswordFormReturn {
  values: ResetPasswordFormValues;
  errors: ResetPasswordFormErrors;
  touched: {
    password: boolean;
    confirmPassword: boolean;
  };
  isSubmitting: boolean;
  isSuccess: boolean;
  isSessionLoading: boolean;
  hasValidSession: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (field: keyof ResetPasswordFormValues) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}
