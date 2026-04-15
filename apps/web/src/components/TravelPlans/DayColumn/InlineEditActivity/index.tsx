import { useState, useEffect, type ChangeEvent } from "react";
import type { InlineEditActivityProps } from "./types";

export function InlineEditActivity({
  initialValue,
  error,
  onSave,
  onCancel,
  onDelete,
  onClearError,
}: InlineEditActivityProps) {
  const [value, setValue] = useState(initialValue);
  const [localError, setLocalError] = useState("");

  const displayError = error || localError;

  useEffect(() => {
    setValue(initialValue);
    setLocalError("");
  }, [initialValue]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setLocalError("Required");
      return;
    }
    onSave(trimmed);
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
          <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-1 h-8 flex items-center justify-center gap-1 rounded-[7px] bg-tf-amber text-[#0E0B09] text-[11px] font-semibold border-none cursor-pointer transition-opacity duration-150 hover:opacity-90 font-outfit"
          aria-label="Save changes"
        >
          <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Save
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[7px] border border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/20 cursor-pointer transition-colors duration-150"
          aria-label="Delete activity"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
