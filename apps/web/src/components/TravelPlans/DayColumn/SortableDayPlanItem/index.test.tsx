import { render, screen } from "@testing-library/react";
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

describe("SortableDayPlanItem", () => {
  it("should render item description", () => {
    render(
      <SortableDayPlanItem
        item={{
          id: "item-1",
          description: "Visit museum",
          createdAt: new Date(),
        }}
        onEdit={() => {}}
      />,
    );

    expect(screen.getByText("Visit museum")).toBeInTheDocument();
    expect(screen.getByLabelText(/plan visit museum/i)).toBeInTheDocument();
  });
});
