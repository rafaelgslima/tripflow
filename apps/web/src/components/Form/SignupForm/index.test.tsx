import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "./index";

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: {},
  }),
}));

// Mock the useSignupForm hook
vi.mock("@/hooks/useSignupForm", () => ({
  useSignupForm: () => ({
    values: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
    errors: {},
    touched: {},
    isSubmitting: false,
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    handleSubmit: vi.fn(),
  }),
}));

describe("SignupForm", () => {
  it("should render all form fields", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password\s*\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("should render submit button with correct text", () => {
    render(<SignupForm />);

    const button = screen.getByRole("button", { name: /create account/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("should render links to terms of service and privacy policy", () => {
    render(<SignupForm />);

    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
  });

  it("should render sign in link", () => {
    render(<SignupForm />);

    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute("href", "/login");
  });
});
