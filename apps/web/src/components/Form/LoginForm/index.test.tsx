import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LoginForm } from "./index";

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: {},
  }),
}));

vi.mock("@/hooks/useLoginForm", () => ({
  useLoginForm: () => ({
    values: {
      email: "",
      password: "",
      rememberMe: false,
    },
    errors: {},
    touched: {
      email: false,
      password: false,
    },
    isSubmitting: false,
    isSuccess: false,
    handleChange: () => vi.fn(),
    handleBlur: () => vi.fn(),
    handleSubmit: vi.fn((e: { preventDefault: () => void }) =>
      e.preventDefault(),
    ),
  }),
}));

describe("LoginForm", () => {
  it("renders email input field", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it("renders password input field", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    render(<LoginForm />);
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  it("renders remember me checkbox", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Remember me")).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("renders sign up link", () => {
    render(<LoginForm />);
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("email input has correct type", () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("password input has correct type", () => {
    render(<LoginForm />);
    const passwordInput = screen.getByLabelText(/^password/i);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("remember me is a checkbox", () => {
    render(<LoginForm />);
    const rememberMe = screen.getByLabelText("Remember me");
    expect(rememberMe).toHaveAttribute("type", "checkbox");
  });

  it("forgot password link points to correct page", () => {
    render(<LoginForm />);
    const forgotLink = screen.getByText("Forgot password?");
    expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  it("sign up link points to signup page", () => {
    render(<LoginForm />);
    const signupLink = screen.getByText("Sign up");
    expect(signupLink).toHaveAttribute("href", "/signup");
  });
});
