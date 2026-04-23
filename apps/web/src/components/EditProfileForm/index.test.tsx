import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { EditProfileForm } from "./index";

vi.mock("@/hooks/useEditProfileForm");

import { useEditProfileForm } from "@/hooks/useEditProfileForm";

const mockUseEditProfileForm = vi.mocked(useEditProfileForm);

describe("EditProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form with initial values", async () => {
    mockUseEditProfileForm.mockReturnValue({
      values: { name: "John Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: vi.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    // Click Edit button to enter edit mode
    const editButton = screen.getByLabelText("Edit display name");
    fireEvent.click(editButton);

    // Now the input should be visible
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
  });

  it("should show error message when validation fails", () => {
    mockUseEditProfileForm.mockReturnValue({
      values: { name: "J" },
      errors: { name: "Name must be at least 2 characters long" },
      touched: { name: true },
      isSubmitting: false,
      isSuccess: false,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: vi.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    // Click Edit button to enter edit mode
    const editButton = screen.getByLabelText("Edit display name");
    fireEvent.click(editButton);

    expect(
      screen.getByText("Name must be at least 2 characters long")
    ).toBeInTheDocument();
  });

  it("should call handleChange on input change", async () => {
    const mockHandleChange = vi.fn();
    mockUseEditProfileForm.mockReturnValue({
      values: { name: "John Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: mockHandleChange,
      handleBlur: vi.fn(),
      handleSubmit: vi.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    // Click Edit button to enter edit mode
    const editButton = screen.getByLabelText("Edit display name");
    fireEvent.click(editButton);

    const input = screen.getByDisplayValue("John Doe");
    await userEvent.type(input, "x");

    expect(mockHandleChange).toHaveBeenCalledWith("name", "John Doex");
  });

  it("should call handleBlur on blur", () => {
    const mockHandleBlur = vi.fn();
    mockUseEditProfileForm.mockReturnValue({
      values: { name: "John Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: vi.fn(),
      handleBlur: mockHandleBlur,
      handleSubmit: vi.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    // Click Edit button to enter edit mode
    const editButton = screen.getByLabelText("Edit display name");
    fireEvent.click(editButton);

    const input = screen.getByDisplayValue("John Doe");
    fireEvent.blur(input);

    expect(mockHandleBlur).toHaveBeenCalledWith("name");
  });

  it("should disable submit button while submitting", () => {
    mockUseEditProfileForm.mockReturnValue({
      values: { name: "John Doe" },
      errors: {},
      touched: {},
      isSubmitting: true,
      isSuccess: false,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: vi.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    // Click Edit button to enter edit mode
    const editButton = screen.getByLabelText("Edit display name");
    fireEvent.click(editButton);

    const submitButton = screen.getByRole("button", { name: /saving/i });
    expect(submitButton).toBeDisabled();
  });

  it("should call handleSubmit when form is submitted", async () => {
    const mockHandleSubmit = vi.fn();
    mockUseEditProfileForm.mockReturnValue({
      values: { name: "John Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: mockHandleSubmit,
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    // Click Edit button to enter edit mode
    const editButton = screen.getByLabelText("Edit display name");
    fireEvent.click(editButton);

    const form = screen.getByRole("button", { name: /save/i }).closest("form");
    fireEvent.submit(form!);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("should call onNameUpdated callback when save succeeds", async () => {
    const mockHandleSubmit = vi.fn().mockResolvedValue(undefined);
    const mockOnNameUpdated = vi.fn();
    mockUseEditProfileForm.mockReturnValue({
      values: { name: "Jane Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: mockHandleSubmit,
    });

    render(
      <EditProfileForm
        name="John Doe"
        email="john@example.com"
        onNameUpdated={mockOnNameUpdated}
      />
    );

    // Click Edit button to enter edit mode
    const editButton = screen.getByLabelText("Edit display name");
    fireEvent.click(editButton);

    const form = screen.getByRole("button", { name: /save/i }).closest("form");
    fireEvent.submit(form!);

    // Wait for async handleSubmit to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // The callback should be called with the new name
    expect(mockOnNameUpdated).toHaveBeenCalledWith("Jane Doe");
  });

  it("should show success message on success", () => {
    mockUseEditProfileForm.mockReturnValue({
      values: { name: "Jane Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: true,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: vi.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    // Click Edit button to enter edit mode to see the success message
    const editButton = screen.getByLabelText("Edit display name");
    fireEvent.click(editButton);

    expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
  });

  it("should show general error message", () => {
    mockUseEditProfileForm.mockReturnValue({
      values: { name: "John Doe" },
      errors: { general: "Failed to update profile" },
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: vi.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    // Click Edit button to enter edit mode to see the error message
    const editButton = screen.getByLabelText("Edit display name");
    fireEvent.click(editButton);

    expect(screen.getByText("Failed to update profile")).toBeInTheDocument();
  });
});
