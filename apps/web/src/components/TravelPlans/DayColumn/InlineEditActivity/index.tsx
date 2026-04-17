import { useState, useEffect, type ChangeEvent } from "react";
import { MdClose, MdCheck, MdDelete } from "react-icons/md";
import { TIME_OPTIONS } from "@/utils/timeOptions";
import type { InlineEditActivityProps } from "./types";

export function InlineEditActivity({
  initialValue,
  initialTime,
  error,
  onSave,
  onCancel,
  onDelete,
  onClearError,
}: InlineEditActivityProps) {
  const [value, setValue] = useState(initialValue);
  const [time, setTime] = useState<string>(initialTime ?? "");
  const [localError, setLocalError] = useState("");

  const displayError = error || localError;

  useEffect(() => {
    setValue(initialValue);
    setTime(initialTime ?? "");
    setLocalError("");
  }, [initialValue, initialTime]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setLocalError("Required");
      return;
    }
    onSave(trimmed, time || null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (localError || error) {
      setLocalError("");
      if (onClearError) onClearError();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onCancel();
        }}
        className={`tf-input text-[13px]${displayError ? " tf-input--error" : ""}`}
        autoFocus
      />

      <select
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="tf-input text-[12px] text-tf-muted"
      >
        <option value="">No time</option>
        {TIME_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {displayError && (
        <p className="text-[11px] text-red-300 px-0.5 leading-tight">{displayError}</p>
      )}

      {/* [✗ cancel]  [────── ✓ Save ──────]  [🗑 delete] */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[7px] border border-tf-border bg-transparent text-tf-muted hover:text-tf-text hover:border-white/15 cursor-pointer transition-colors duration-150"
          aria-label="Cancel"
        >
          <MdClose size={11} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-1 h-8 flex items-center justify-center gap-1 rounded-[7px] bg-tf-amber text-[#0E0B09] text-[11px] font-semibold border-none cursor-pointer transition-opacity duration-150 hover:opacity-90 font-outfit"
          aria-label="Save changes"
        >
          <MdCheck size={11} aria-hidden="true" />
          Save
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[7px] border border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/20 cursor-pointer transition-colors duration-150"
          aria-label="Delete activity"
        >
          <MdDelete size={12} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
