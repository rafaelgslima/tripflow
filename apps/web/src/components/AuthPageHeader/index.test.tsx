import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AuthPageHeader } from "./index";

describe("AuthPageHeader", () => {
  it("renders the title", () => {
    render(
      <AuthPageHeader title="Welcome back" subtitle="Sign in to continue" />,
    );
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(
      <AuthPageHeader title="Welcome back" subtitle="Sign in to continue" />,
    );
    expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
  });

  it("renders the logo", () => {
    render(
      <AuthPageHeader title="Welcome back" subtitle="Sign in to continue" />,
    );
    expect(screen.getByText("Planutrip")).toBeInTheDocument();
  });

  it("renders the back button", () => {
    render(
      <AuthPageHeader title="Welcome back" subtitle="Sign in to continue" />,
    );
    expect(screen.getByText("Back")).toBeInTheDocument();
  });
});
