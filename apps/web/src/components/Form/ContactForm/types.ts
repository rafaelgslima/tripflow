export interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export interface ContactFormState {
  values: ContactFormValues;
  errors: ContactFormErrors;
  touched: Record<keyof ContactFormValues, boolean>;
  isSubmitting: boolean;
  isSuccess: boolean;
}
