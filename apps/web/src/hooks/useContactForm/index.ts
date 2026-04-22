import { useState } from 'react';
import type { ContactFormValues, ContactFormErrors } from '@/components/Form/ContactForm/types';
import { UseContactFormReturn } from './types';
import { validateContactForm } from '@/utils/contactFormValidation';

export function useContactForm(): UseContactFormReturn {
  const [values, setValues] = useState<ContactFormValues>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [touched, setTouched] = useState<Record<keyof ContactFormValues, boolean>>({
    name: false,
    email: false,
    subject: false,
    message: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (fieldName: keyof ContactFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));

    if (touched[fieldName]) {
      const newErrors = validateContactForm({ ...values, [fieldName]: value });
      setErrors(newErrors);
    }
  };

  const handleBlur = (fieldName: keyof ContactFormValues) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    const newErrors = validateContactForm(values);
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = validateContactForm(values);
    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      setIsSuccess(true);
      setValues({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setErrors({
        ...errors,
        message: error instanceof Error ? error.message : 'Failed to send message',
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
