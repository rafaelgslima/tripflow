import { useState, type ChangeEvent } from "react";
import type { AddDayPlanFormProps } from "./types";

export function AddDayPlanForm({
  initialValue = "",
  onCancel,
  onConfirm,
  confirmLabel = "Confirm",
  error,
  onClearError,
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
    <div className="space-y-2">
      <input
        type="text"
        value={description}
        onChange={handleChange}
        placeholder="What's the plan?"
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-gray-900 bg-white ${
          displayError ? "border-red-500 focus:ring-red-500" : "border-gray-300"
        }`}
        autoFocus
      />
      {displayError && <p className="text-xs text-red-600">{displayError}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
