import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PasswordInput } from "./index";

describe("PasswordInput", () => {
  const defaultProps = {
    id: "password",
    name: "password",
    value: "test123",
    onChange: vi.fn(),
  };

  it("renders password input with hidden value by default", () => {
    render(<PasswordInput {...defaultProps} />);
    const input = screen.getByDisplayValue("test123") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("reveals password when toggle button is clicked", () => {
    render(<PasswordInput {...defaultProps} />);
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    const input = screen.getByDisplayValue("test123") as HTMLInputElement;

    fireEvent.click(toggleButton);
    expect(input.type).toBe("text");
  });

  it("hides password when toggle button is clicked again", () => {
    render(<PasswordInput {...defaultProps} />);
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    const input = screen.getByDisplayValue("test123") as HTMLInputElement;

    fireEvent.click(toggleButton);
    expect(input.type).toBe("text");

    fireEvent.click(toggleButton);
    expect(input.type).toBe("password");
  });

  it("calls onChange when value changes", () => {
    const onChange = vi.fn();
    render(<PasswordInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByDisplayValue("test123");

    fireEvent.change(input, { target: { value: "newPassword" } });
    expect(onChange).toHaveBeenCalledWith("newPassword");
  });

  it("calls onBlur when input loses focus", () => {
    const onBlur = vi.fn();
    render(<PasswordInput {...defaultProps} onBlur={onBlur} />);
    const input = screen.getByDisplayValue("test123");

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
  });

  it("calls onFocus when input receives focus", () => {
    const onFocus = vi.fn();
    render(<PasswordInput {...defaultProps} onFocus={onFocus} />);
    const input = screen.getByDisplayValue("test123");

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalled();
  });

  it("applies error style when hasError is true", () => {
    render(<PasswordInput {...defaultProps} hasError={true} />);
    const input = screen.getByDisplayValue("test123");
    expect(input).toHaveClass("tf-input--error");
  });

  it("disables toggle button when disabled prop is true", () => {
    render(<PasswordInput {...defaultProps} disabled={true} />);
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    expect(toggleButton).toBeDisabled();
  });

  it("has proper aria labels for accessibility", () => {
    render(<PasswordInput {...defaultProps} />);
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    expect(toggleButton).toHaveAttribute("aria-label", "Show password");
  });

  it("updates aria label when password is revealed", () => {
    render(<PasswordInput {...defaultProps} />);
    const toggleButton = screen.getByRole("button", { name: /show password/i });

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-label", "Hide password");
  });
});
