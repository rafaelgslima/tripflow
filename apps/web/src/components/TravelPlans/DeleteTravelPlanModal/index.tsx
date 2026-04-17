import { MdClose } from "react-icons/md";
import type { DeleteTravelPlanModalProps } from "./types";

export function DeleteTravelPlanModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteTravelPlanModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Delete travel plan"
    >
      <div
        className="fixed inset-0 bg-[rgba(10,8,5,0.85)] backdrop-blur-sm"
        data-testid="delete-travel-plan-backdrop"
        onClick={onClose}
      />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-tf-card border border-tf-border rounded-[20px] p-8 max-w-[440px] w-full z-50">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-cormorant text-[28px] font-normal text-tf-text tracking-[-0.02em] leading-[1.1]">
                Delete travel plan
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="bg-transparent border-none cursor-pointer text-tf-muted p-1 shrink-0 mt-1"
                aria-label="Close modal"
              >
                <MdClose size={18} aria-hidden="true" />
              </button>
            </div>

            <p className="text-sm text-tf-muted font-outfit leading-relaxed mb-7">
              Are you sure you want to delete this travel plan? This action is{" "}
              <span className="text-red-300 font-medium">permanent</span> and cannot be undone. All itinerary items will be lost.
            </p>

            <div className="flex gap-[10px]">
              <button
                type="button"
                onClick={onClose}
                className="tf-btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="tf-btn-danger flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
