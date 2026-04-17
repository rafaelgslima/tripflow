import { MdEdit, MdCheck } from "react-icons/md";
import { formatTime } from "@/utils/timeOptions";
import type { DayPlanItemCardProps } from "./types";

export function DayPlanItemCard({ item, onEdit, onToggleDone, dragListeners, readOnly }: DayPlanItemCardProps) {
  return (
    <div
      className={[
        "group flex items-stretch border rounded-[10px] font-outfit overflow-hidden transition-colors duration-300",
        item.isDone
          ? "bg-green-950/20 border-green-900/40"
          : "bg-tf-bg-3 border-tf-border",
      ].join(" ")}
    >
      {/* Done toggle */}
      <button
        type="button"
        onClick={() => !readOnly && onToggleDone(item.id, !item.isDone)}
        disabled={readOnly}
        aria-label={item.isDone ? "Mark as not done" : "Mark as done"}
        aria-pressed={item.isDone}
        className={[
          "shrink-0 flex items-center justify-center w-9 border-r transition-colors duration-300 bg-transparent",
          readOnly ? "cursor-default opacity-60" : "cursor-pointer",
          item.isDone
            ? "border-white/[0.06]"
            : "border-white/[0.06] hover:bg-white/[0.03]",
        ].join(" ")}
      >
        {item.isDone ? (
          <div className="w-[15px] h-[15px] rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <MdCheck size={10} color="white" aria-hidden="true" />
          </div>
        ) : (
          <div className="w-[15px] h-[15px] rounded-full border border-white/20 group-hover:border-white/35 transition-colors duration-200 shrink-0" />
        )}
      </button>

      {/* Content — drag handle when dragListeners provided */}
      <div
        className={`flex-1 min-w-0 flex flex-col gap-[3px] py-2.5 px-2.5 touch-none ${readOnly ? "cursor-default" : "cursor-grab"}`}
        {...dragListeners}
      >
        {item.time && (
          <span
            className={[
              "text-[11px] font-semibold text-tf-amber tracking-[0.03em] leading-none transition-opacity duration-300",
              item.isDone ? "opacity-40" : "",
            ].join(" ")}
          >
            {formatTime(item.time)}
          </span>
        )}
        <span
          className={[
            "break-words text-[13px] leading-[1.4] select-none transition-all duration-300",
            item.isDone
              ? "text-green-400/60 line-through decoration-green-700/40"
              : "text-tf-text",
          ].join(" ")}
        >
          {item.description}
        </span>
      </div>

      {/* Edit button */}
      {!readOnly && (
        <button
          type="button"
          onClick={() => onEdit(item.id)}
          aria-label={`Edit ${item.description}`}
          className={[
            "shrink-0 flex items-center justify-center w-10 bg-transparent border-none cursor-pointer transition-all duration-150 rounded-r-[9px]",
            item.isDone
              ? "text-tf-muted opacity-20"
              : "text-tf-muted opacity-40 md:opacity-0 md:group-hover:opacity-60 hover:opacity-100 hover:text-tf-amber hover:bg-white/5",
          ].join(" ")}
        >
          <MdEdit size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
