import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePasswordMatch,
} from "./index";

describe("validateEmail", () => {
  it("should return null for valid email", () => {
    expect(validateEmail("user@example.com")).toBeNull();
    expect(validateEmail("test.user+tag@domain.co.uk")).toBeNull();
  });

  it("should return error for empty email", () => {
    expect(validateEmail("")).toBe("Email is required");
    expect(validateEmail("   ")).toBe("Email is required");
  });

  it("should return error for invalid email format", () => {
    expect(validateEmail("invalid")).toBe("Please enter a valid email address");
    expect(validateEmail("invalid@")).toBe(
      "Please enter a valid email address",
    );
    expect(validateEmail("@example.com")).toBe(
      "Please enter a valid email address",
    );
    expect(validateEmail("user@")).toBe("Please enter a valid email address");
  });
});

describe("validatePassword", () => {
  it("should return null for valid password", () => {
    expect(validatePassword("Password123!")).toBeNull();
    expect(validatePassword("SecureP@ss1")).toBeNull();
  });

  it("should return error for empty password", () => {
    expect(validatePassword("")).toBe("Password is required");
    expect(validatePassword("   ")).toBe("Password is required");
  });

  it("should return error for password less than 8 characters", () => {
    expect(validatePassword("Pass1!")).toBe(
      "Password must be at least 8 characters long",
    );
    expect(validatePassword("1234567")).toBe(
      "Password must be at least 8 characters long",
    );
  });

  it("should return error for password without uppercase letter", () => {
    expect(validatePassword("password123!")).toBe(
      "Password must contain at least one uppercase letter",
    );
  });

  it("should return error for password without lowercase letter", () => {
    expect(validatePassword("PASSWORD123!")).toBe(
      "Password must contain at least one lowercase letter",
    );
  });

  it("should return error for password without number", () => {
    expect(validatePassword("Password!")).toBe(
      "Password must contain at least one number",
    );
  });

  it("should return error for password without special character", () => {
    expect(validatePassword("Password123")).toBe(
      "Password must contain at least one special character",
    );
  });
});

describe("validateName", () => {
  it("should return null for valid name", () => {
    expect(validateName("John Doe")).toBeNull();
    expect(validateName("María García")).toBeNull();
    expect(validateName("Jean-Pierre")).toBeNull();
  });

  it("should return error for empty name", () => {
    expect(validateName("")).toBe("Name is required");
    expect(validateName("   ")).toBe("Name is required");
  });

  it("should return error for name less than 2 characters", () => {
    expect(validateName("J")).toBe("Name must be at least 2 characters long");
  });

  it("should return error for name more than 100 characters", () => {
    const longName = "a".repeat(101);
    expect(validateName(longName)).toBe(
      "Name must be less than 100 characters",
    );
  });
});

describe("validatePasswordMatch", () => {
  it("should return null when passwords match", () => {
    expect(validatePasswordMatch("Password123!", "Password123!")).toBeNull();
  });

  it("should return error when passwords do not match", () => {
    expect(validatePasswordMatch("Password123!", "Password123")).toBe(
      "Passwords do not match",
    );
    expect(validatePasswordMatch("Password123!", "")).toBe(
      "Passwords do not match",
    );
  });

  it("should return error when confirm password is empty", () => {
    expect(validatePasswordMatch("Password123!", "")).toBe(
      "Passwords do not match",
    );
  });
});
