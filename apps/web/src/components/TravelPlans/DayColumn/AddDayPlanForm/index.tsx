import { useState, type ChangeEvent } from "react";
import type { AddDayPlanFormProps } from "./types";

export function AddDayPlanForm({
  initialValue = "",
  onCancel,
  onConfirm,
  confirmLabel = "Save",
  error,
  onClearError,
  onDelete,
  deleteLabel = "Delete",
}: AddDayPlanFormProps) {
  const [description, setDescription] = useState(initialValue);
  const [localError, setLocalError] = useState("");

  const displayError = error || localError;

  const handleConfirm = () => {
    const trimmed = description.trim();
    if (!trimmed) {
      setLocalError("This field is required");
      return;
    }
    onConfirm(description);
    setDescription("");
    setLocalError("");
  };

  const handleCancel = () => {
    setDescription("");
    setLocalError("");
    if (onClearError) onClearError();
    onCancel();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
    if (localError || error) {
      setLocalError("");
      if (onClearError) onClearError();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={description}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleConfirm();
          if (e.key === "Escape") handleCancel();
        }}
        placeholder="What's the plan?"
        className={`tf-input${displayError ? " tf-input--error" : ""}`}
        autoFocus
      />

      {displayError && (
        <p className="text-xs text-red-300 px-0.5">{displayError}</p>
      )}

      {/* Primary action — full width */}
      <button
        type="button"
        onClick={handleConfirm}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-[8px] bg-tf-amber text-[#0E0B09] text-xs font-semibold border-none cursor-pointer transition-opacity duration-150 hover:opacity-90 font-outfit"
      >
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        {confirmLabel}
      </button>

      {/* Secondary actions — split row */}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 flex items-center justify-center py-2 rounded-[8px] border border-tf-border bg-transparent text-tf-muted text-xs font-medium cursor-pointer transition-colors duration-150 hover:text-tf-text hover:border-white/15 font-outfit"
        >
          Cancel
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 flex items-center justify-center py-2 rounded-[8px] border border-red-500/25 bg-red-500/10 text-red-300 text-xs font-medium cursor-pointer transition-colors duration-150 hover:bg-red-500/20 font-outfit"
          >
            {deleteLabel}
          </button>
        )}
      </div>
    </div>
  );
}
