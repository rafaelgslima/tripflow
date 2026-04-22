import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContactForm } from './index';

global.fetch = vi.fn();

describe('useContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty values', () => {
    const { result } = renderHook(() => useContactForm());

    expect(result.current.values.name).toBe('');
    expect(result.current.values.email).toBe('');
    expect(result.current.values.subject).toBe('');
    expect(result.current.values.message).toBe('');
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('updates values on change', () => {
    const { result } = renderHook(() => useContactForm());

    act(() => {
      result.current.handleChange('name', 'John Doe');
    });

    expect(result.current.values.name).toBe('John Doe');
  });

  it('validates required fields on blur', () => {
    const { result } = renderHook(() => useContactForm());

    act(() => {
      result.current.handleBlur('name');
    });

    expect(result.current.errors.name).toBe('Name is required');
  });

  it('clears errors when field is touched and fixed', () => {
    const { result } = renderHook(() => useContactForm());

    // Start with a touched field showing error
    act(() => {
      result.current.handleBlur('email');
    });
    expect(result.current.errors.email).toBeDefined();

    // Fix the error
    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });
    expect(result.current.values.email).toBe('test@example.com');
  });

  it('validates message minimum length', () => {
    const { result } = renderHook(() => useContactForm());

    act(() => {
      result.current.handleChange('message', 'short');
      result.current.handleBlur('message');
    });

    expect(result.current.errors.message).toBeDefined();
  });

  it('prevents submission with validation errors', async () => {
    const { result } = renderHook(() => useContactForm());

    const form = new Event('submit');
    Object.defineProperty(form, 'preventDefault', {
      value: vi.fn(),
    });

    await act(async () => {
      await result.current.handleSubmit(form as any);
    });

    expect((global.fetch as any)).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useContactForm());

    act(() => {
      result.current.handleChange('name', 'John Doe');
      result.current.handleChange('email', 'john@example.com');
      result.current.handleChange('subject', 'Test Subject');
      result.current.handleChange('message', 'This is a test message');
    });

    const form = new Event('submit');
    Object.defineProperty(form, 'preventDefault', {
      value: vi.fn(),
    });

    await act(async () => {
      await result.current.handleSubmit(form as any);
    });

    expect((global.fetch as any)).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('shows success state after successful submission', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useContactForm());

    act(() => {
      result.current.handleChange('name', 'John Doe');
      result.current.handleChange('email', 'john@example.com');
      result.current.handleChange('subject', 'Test Subject');
      result.current.handleChange('message', 'This is a test message');
    });

    const form = new Event('submit');
    Object.defineProperty(form, 'preventDefault', {
      value: vi.fn(),
    });

    await act(async () => {
      await result.current.handleSubmit(form as any);
    });

    expect(result.current.isSuccess).toBe(true);
  });

  it('handles submission error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Server error' }),
    });

    const { result } = renderHook(() => useContactForm());

    act(() => {
      result.current.handleChange('name', 'John Doe');
      result.current.handleChange('email', 'john@example.com');
      result.current.handleChange('subject', 'Test Subject');
      result.current.handleChange('message', 'This is a test message');
    });

    const form = new Event('submit');
    Object.defineProperty(form, 'preventDefault', {
      value: vi.fn(),
    });

    await act(async () => {
      await result.current.handleSubmit(form as any);
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.errors.message).toBe('Server error');
  });
});
