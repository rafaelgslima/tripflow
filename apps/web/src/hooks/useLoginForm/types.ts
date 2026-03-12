export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface UseLoginFormReturn {
  values: LoginFormValues;
  errors: LoginFormErrors;
  touched: {
    email: boolean;
    password: boolean;
  };
  isSubmitting: boolean;
  isSuccess: boolean;
  handleChange: (
    field: keyof LoginFormValues,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (field: keyof LoginFormValues) => () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}
