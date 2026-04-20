import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditProfileForm } from "./index";

jest.mock("@/hooks/useEditProfileForm");

import { useEditProfileForm } from "@/hooks/useEditProfileForm";

const mockUseEditProfileForm = useEditProfileForm as jest.MockedFunction<typeof useEditProfileForm>;

describe("EditProfileForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the form with initial values", () => {
    mockUseEditProfileForm.mockReturnValueOnce({
      values: { name: "John Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
  });

  it("should show error message when validation fails", () => {
    mockUseEditProfileForm.mockReturnValueOnce({
      values: { name: "J" },
      errors: { name: "Name must be at least 2 characters long" },
      touched: { name: true },
      isSubmitting: false,
      isSuccess: false,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    expect(
      screen.getByText("Name must be at least 2 characters long")
    ).toBeInTheDocument();
  });

  it("should call handleChange on input change", async () => {
    const mockHandleChange = jest.fn();
    mockUseEditProfileForm.mockReturnValueOnce({
      values: { name: "John Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: mockHandleChange,
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    const input = screen.getByDisplayValue("John Doe");
    await userEvent.type(input, "x");

    expect(mockHandleChange).toHaveBeenCalledWith("name", "John Doex");
  });

  it("should call handleBlur on blur", () => {
    const mockHandleBlur = jest.fn();
    mockUseEditProfileForm.mockReturnValueOnce({
      values: { name: "John Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: jest.fn(),
      handleBlur: mockHandleBlur,
      handleSubmit: jest.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    const input = screen.getByDisplayValue("John Doe");
    fireEvent.blur(input);

    expect(mockHandleBlur).toHaveBeenCalledWith("name");
  });

  it("should disable submit button while submitting", () => {
    mockUseEditProfileForm.mockReturnValueOnce({
      values: { name: "John Doe" },
      errors: {},
      touched: {},
      isSubmitting: true,
      isSuccess: false,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    const submitButton = screen.getByRole("button", { name: /saving/i });
    expect(submitButton).toBeDisabled();
  });

  it("should call handleSubmit when form is submitted", async () => {
    const mockHandleSubmit = jest.fn();
    mockUseEditProfileForm.mockReturnValueOnce({
      values: { name: "John Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: mockHandleSubmit,
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    const form = screen.getByRole("button", { name: /save/i }).closest("form");
    fireEvent.submit(form!);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("should call onNameUpdated callback when save succeeds", async () => {
    const mockHandleSubmit = jest.fn();
    const mockOnNameUpdated = jest.fn();
    mockUseEditProfileForm.mockReturnValueOnce({
      values: { name: "Jane Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: mockHandleSubmit,
    });

    render(
      <EditProfileForm
        name="John Doe"
        email="john@example.com"
        onNameUpdated={mockOnNameUpdated}
      />
    );

    const form = screen.getByRole("button", { name: /save/i }).closest("form");
    fireEvent.submit(form!);

    // The callback should be called with the new name
    // (Note: In real scenario, this happens after handleSubmit completes)
    expect(mockOnNameUpdated).toHaveBeenCalledWith("Jane Doe");
  });

  it("should show success message on success", () => {
    mockUseEditProfileForm.mockReturnValueOnce({
      values: { name: "Jane Doe" },
      errors: {},
      touched: {},
      isSubmitting: false,
      isSuccess: true,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
  });

  it("should show general error message", () => {
    mockUseEditProfileForm.mockReturnValueOnce({
      values: { name: "John Doe" },
      errors: { general: "Failed to update profile" },
      touched: {},
      isSubmitting: false,
      isSuccess: false,
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
    });

    render(<EditProfileForm name="John Doe" email="john@example.com" />);

    expect(screen.getByText("Failed to update profile")).toBeInTheDocument();
  });
});
