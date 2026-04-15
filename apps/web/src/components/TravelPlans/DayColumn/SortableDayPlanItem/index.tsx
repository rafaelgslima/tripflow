import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type PointerEvent as ReactPointerEvent, useRef } from "react";
import type { SortableDayPlanItemProps } from "./types";

export function SortableDayPlanItem({
  item,
  onEdit,
}: SortableDayPlanItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  const pointerDownAt = useRef<number>(0);
  const longPressMs = 180;
  const {
    onPointerDown: dndPointerDown,
    onPointerUp: dndPointerUp,
    ...restListeners
  } = listeners ?? {};

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dndPointerDown) {
      dndPointerDown(event);
    }
    pointerDownAt.current = Date.now();
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dndPointerUp) {
      dndPointerUp(event);
    }

    const pressDuration = Date.now() - pointerDownAt.current;
    if (pressDuration < longPressMs) {
      onEdit(item.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="py-2.5 px-3 bg-tf-bg-3 border border-tf-border rounded-[10px] text-[13px] text-tf-text cursor-grab font-outfit leading-[1.4] select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      aria-label={`Plan ${item.description}`}
      {...attributes}
      {...restListeners}
    >
      <span>{item.description}</span>
    </div>
  );
}
