import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ForgotPasswordForm } from "./index";

describe("ForgotPasswordForm", () => {
  it("renders email input field", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<ForgotPasswordForm />);
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeInTheDocument();
  });

  it("renders back to login link", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText("Back to login")).toBeInTheDocument();
  });

  it("email input has correct type", () => {
    render(<ForgotPasswordForm />);
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("email input has placeholder", () => {
    render(<ForgotPasswordForm />);
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute("placeholder", "you@example.com");
  });

  it("back to login link points to login page", () => {
    render(<ForgotPasswordForm />);
    const backLink = screen.getByText("Back to login");
    expect(backLink).toHaveAttribute("href", "/login");
  });

  it("renders instructional text", () => {
    render(<ForgotPasswordForm />);
    expect(
      screen.getByText(
        /enter your email address and we'll send you a link to reset your password/i,
      ),
    ).toBeInTheDocument();
  });
});
