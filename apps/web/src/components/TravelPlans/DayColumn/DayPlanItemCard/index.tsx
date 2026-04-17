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
            <svg
              width="9"
              height="7"
              viewBox="0 0 9 7"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 3.5L3.5 6L8 1" />
            </svg>
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
          <svg
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
