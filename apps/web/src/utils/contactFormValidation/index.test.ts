import { describe, it, expect } from 'vitest';
import { validateContactForm } from './index';
import type { ContactFormValues } from '@/components/Form/ContactForm/types';

describe('validateContactForm', () => {
  const validForm: ContactFormValues = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Feature Request',
    message: 'This is a valid message with enough characters',
  };

  it('returns no errors for valid form', () => {
    const errors = validateContactForm(validForm);
    expect(errors).toEqual({});
  });

  it('validates required name field', () => {
    const errors = validateContactForm({
      ...validForm,
      name: '',
    });
    expect(errors.name).toBe('Name is required');
  });

  it('validates whitespace-only name', () => {
    const errors = validateContactForm({
      ...validForm,
      name: '   ',
    });
    expect(errors.name).toBe('Name is required');
  });

  it('validates required email field', () => {
    const errors = validateContactForm({
      ...validForm,
      email: '',
    });
    expect(errors.email).toBe('Email is required');
  });

  it('validates email format', () => {
    const errors = validateContactForm({
      ...validForm,
      email: 'invalid-email',
    });
    expect(errors.email).toBe('Please enter a valid email');
  });

  it('accepts valid email formats', () => {
    const validEmails = [
      'user@example.com',
      'test.user@domain.co.uk',
      'name+tag@example.org',
    ];

    validEmails.forEach((email) => {
      const errors = validateContactForm({
        ...validForm,
        email,
      });
      expect(errors.email).toBeUndefined();
    });
  });

  it('validates required subject field', () => {
    const errors = validateContactForm({
      ...validForm,
      subject: '',
    });
    expect(errors.subject).toBe('Subject is required');
  });

  it('validates required message field', () => {
    const errors = validateContactForm({
      ...validForm,
      message: '',
    });
    expect(errors.message).toBe('Message is required');
  });

  it('validates message minimum length', () => {
    const errors = validateContactForm({
      ...validForm,
      message: 'short',
    });
    expect(errors.message).toBe('Message must be at least 10 characters');
  });

  it('accepts message with exactly 10 characters', () => {
    const errors = validateContactForm({
      ...validForm,
      message: '1234567890',
    });
    expect(errors.message).toBeUndefined();
  });

  it('validates multiple fields at once', () => {
    const errors = validateContactForm({
      name: '',
      email: 'invalid',
      subject: '',
      message: 'short',
    });

    expect(errors.name).toBe('Name is required');
    expect(errors.email).toBe('Please enter a valid email');
    expect(errors.subject).toBe('Subject is required');
    expect(errors.message).toBe('Message must be at least 10 characters');
  });
});
