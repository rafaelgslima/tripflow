import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SortableDayPlanItemProps } from "./types";

export function SortableDayPlanItem({
  item,
  onEdit,
}: SortableDayPlanItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 py-2.5 px-2.5 bg-tf-bg-3 border border-tf-border rounded-[10px] font-outfit${isDragging ? " opacity-50" : ""}`}
      {...attributes}
    >
      {/* Drag handle */}
      <span
        className="shrink-0 cursor-grab touch-none text-tf-muted opacity-25 group-hover:opacity-50 transition-opacity"
        aria-label="Drag to reorder"
        {...listeners}
      >
        <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="8" cy="2" r="1.5" />
          <circle cx="2" cy="6" r="1.5" />
          <circle cx="8" cy="6" r="1.5" />
          <circle cx="2" cy="10" r="1.5" />
          <circle cx="8" cy="10" r="1.5" />
        </svg>
      </span>

      {/* Description */}
      <span className="flex-1 min-w-0 break-words text-[13px] text-tf-text leading-[1.4] select-none">
        {item.description}
      </span>

      {/* Edit button — always visible, unambiguous */}
      <button
        type="button"
        onClick={() => onEdit(item.id)}
        className="shrink-0 cursor-pointer bg-transparent border-none p-[3px] text-tf-muted opacity-40 hover:opacity-100 hover:text-tf-amber transition-all duration-150 rounded-[4px] hover:bg-white/5"
        aria-label={`Edit ${item.description}`}
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  );
}
