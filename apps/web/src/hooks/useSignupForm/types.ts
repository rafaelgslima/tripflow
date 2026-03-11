export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface SignupFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: string;
  general?: string;
}

export interface SignupFormTouched {
  name?: boolean;
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
  termsAccepted?: boolean;
}

export interface UseSignupFormReturn {
  values: SignupFormValues;
  errors: SignupFormErrors;
  touched: SignupFormTouched;
  isSubmitting: boolean;
  isSuccess: boolean;
  handleChange: (
    field: keyof SignupFormValues,
    value: string | boolean,
  ) => void;
  handleBlur: (field: keyof SignupFormValues) => void;
  handleSubmit: () => Promise<void>;
}
