import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SortableDayPlanItem } from "./index";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
}));

const baseItem = {
  id: "item-1",
  description: "Visit museum",
  time: null,
  isDone: false,
  createdAt: new Date(),
};

describe("SortableDayPlanItem", () => {
  it("renders item description", () => {
    render(
      <SortableDayPlanItem
        item={baseItem}
        onEdit={() => {}}
        onToggleDone={() => {}}
      />,
    );

    expect(screen.getByText("Visit museum")).toBeInTheDocument();
  });

  it("renders unchecked toggle with correct aria-label", () => {
    render(
      <SortableDayPlanItem
        item={baseItem}
        onEdit={() => {}}
        onToggleDone={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /mark as done/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark as done/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("renders checked toggle when isDone is true", () => {
    render(
      <SortableDayPlanItem
        item={{ ...baseItem, isDone: true }}
        onEdit={() => {}}
        onToggleDone={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /mark as not done/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark as not done/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("applies green styling to description when isDone is true", () => {
    render(
      <SortableDayPlanItem
        item={{ ...baseItem, isDone: true }}
        onEdit={() => {}}
        onToggleDone={() => {}}
      />,
    );

    const description = screen.getByText("Visit museum");
    expect(description.className).toMatch(/green/);
    expect(description.className).toMatch(/line-through/);
  });

  it("calls onToggleDone(id, true) when unchecked toggle is clicked", async () => {
    const onToggleDone = vi.fn();
    render(
      <SortableDayPlanItem
        item={baseItem}
        onEdit={() => {}}
        onToggleDone={onToggleDone}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /mark as done/i }));

    expect(onToggleDone).toHaveBeenCalledWith("item-1", true);
  });

  it("calls onToggleDone(id, false) when checked toggle is clicked (undo)", async () => {
    const onToggleDone = vi.fn();
    render(
      <SortableDayPlanItem
        item={{ ...baseItem, isDone: true }}
        onEdit={() => {}}
        onToggleDone={onToggleDone}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /mark as not done/i }));

    expect(onToggleDone).toHaveBeenCalledWith("item-1", false);
  });

  it("calls onEdit when edit button is clicked", async () => {
    const onEdit = vi.fn();
    render(
      <SortableDayPlanItem
        item={baseItem}
        onEdit={onEdit}
        onToggleDone={() => {}}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /edit visit museum/i }));

    expect(onEdit).toHaveBeenCalledWith("item-1");
  });

  it("renders time label when time is set", () => {
    render(
      <SortableDayPlanItem
        item={{ ...baseItem, time: "09:00" }}
        onEdit={() => {}}
        onToggleDone={() => {}}
      />,
    );

    expect(screen.getByText(/9:00/i)).toBeInTheDocument();
  });
});
