import type { TravelPlanFormData, TravelPlanValidationErrors } from "./types";

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns Error message if invalid, null if valid
 */
export function validateEmail(email: string): string | null {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return "Email is required";
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return "Please enter a valid email address";
  }

  return null;
}

/**
 * Validates a password
 * @param password - The password to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string): string | null {
  const trimmedPassword = password.trim();

  if (!trimmedPassword) {
    return "Password is required";
  }

  if (trimmedPassword.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (!/[A-Z]/.test(trimmedPassword)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(trimmedPassword)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(trimmedPassword)) {
    return "Password must contain at least one number";
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmedPassword)) {
    return "Password must contain at least one special character";
  }

  return null;
}

/**
 * Validates a name
 * @param name - The name to validate
 * @returns Error message if invalid, null if valid
 */
export function validateName(name: string): string | null {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "Name is required";
  }

  if (trimmedName.length < 2) {
    return "Name must be at least 2 characters long";
  }

  if (trimmedName.length > 100) {
    return "Name must be less than 100 characters";
  }

  return null;
}

/**
 * Validates that two passwords match
 * @param password - The original password
 * @param confirmPassword - The confirmation password
 * @returns Error message if they don't match, null if they match
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string,
): string | null {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
}

/**
 * Validates a travel plan form
 * @param data - The form data to validate
 * @returns Object with isValid flag and errors object
 */
export function validateTravelPlanForm(data: TravelPlanFormData): {
  isValid: boolean;
  errors: TravelPlanValidationErrors;
} {
  const MAX_TRIP_DAYS = Number(process.env.NEXT_PUBLIC_MAX_TRIP_DAYS) || 30;
  const errors: TravelPlanValidationErrors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validate destination
  if (!data.destination.trim()) {
    errors.destination = "Destination is required";
  }

  // Validate start date
  if (!data.startDate) {
    errors.startDate = "Start date is required";
  } else {
    const start = new Date(data.startDate);
    if (start < today) {
      errors.startDate = "Start date must be today or in the future";
    }
  }

  // Validate end date
  if (!data.endDate) {
    errors.endDate = "End date is required";
  } else if (data.startDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end < today) {
      errors.endDate = "End date must be today or in the future";
    } else if (end < start) {
      errors.endDate = "End date must be after start date";
    } else {
      const daysDiff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysDiff > MAX_TRIP_DAYS) {
        errors.endDate = `Trip duration cannot exceed ${MAX_TRIP_DAYS} days`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
