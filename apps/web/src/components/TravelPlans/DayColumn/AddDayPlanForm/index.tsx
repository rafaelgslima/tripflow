import { useState, type ChangeEvent } from "react";
import type { AddDayPlanFormProps } from "./types";

export function AddDayPlanForm({
  initialValue = "",
  onCancel,
  onConfirm,
  confirmLabel = "Confirm",
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
    if (onClearError) {
      onClearError();
    }
    onCancel();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
    if (localError || error) {
      setLocalError("");
      if (onClearError) {
        onClearError();
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={description}
        onChange={handleChange}
        placeholder="What's the plan?"
        className={`tf-input${displayError ? " tf-input--error" : ""}`}
        autoFocus
      />
      {displayError && (
        <p className="text-xs text-red-300 m-0">
          {displayError}
        </p>
      )}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={handleCancel}
          className="tf-btn-ghost flex-1 py-[7px] px-2.5 text-xs"
        >
          Cancel
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="tf-btn-danger flex-1 py-[7px] px-2.5 text-xs"
          >
            {deleteLabel}
          </button>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          className="tf-btn-primary flex-1 py-[7px] px-2.5 text-xs"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
