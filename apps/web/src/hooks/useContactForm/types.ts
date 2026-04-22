import { ContactFormValues, ContactFormErrors } from '@/components/Form/ContactForm/types';

export interface UseContactFormReturn {
  values: ContactFormValues;
  errors: ContactFormErrors;
  touched: Record<keyof ContactFormValues, boolean>;
  isSubmitting: boolean;
  isSuccess: boolean;
  handleChange: (fieldName: keyof ContactFormValues, value: string) => void;
  handleBlur: (fieldName: keyof ContactFormValues) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}
