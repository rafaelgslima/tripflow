export interface ForgotPasswordFormValues {
  email: string;
}

export interface ForgotPasswordFormErrors {
  email?: string;
  general?: string;
}

export interface UseForgotPasswordFormReturn {
  values: ForgotPasswordFormValues;
  errors: ForgotPasswordFormErrors;
  touched: {
    email: boolean;
  };
  isSubmitting: boolean;
  isSuccess: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}
