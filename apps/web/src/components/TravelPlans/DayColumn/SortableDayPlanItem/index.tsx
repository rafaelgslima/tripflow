import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DayPlanItemCard } from "../DayPlanItemCard";
import type { SortableDayPlanItemProps } from "./types";

export function SortableDayPlanItem({
  item,
  onEdit,
  onToggleDone,
}: SortableDayPlanItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      // When a DragOverlay is active this item is the "placeholder" —
      // make it invisible so only the overlay ghost is visible.
      className={isDragging ? "opacity-0" : ""}
      {...attributes}
    >
      <DayPlanItemCard
        item={item}
        onEdit={onEdit}
        onToggleDone={onToggleDone}
        dragListeners={listeners as Record<string, (event: Event) => void> | undefined}
      />
    </div>
  );
}
