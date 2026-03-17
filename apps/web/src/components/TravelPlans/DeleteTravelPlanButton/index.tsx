import { useCallback, useState } from "react";
import { DeleteTravelPlanModal } from "../DeleteTravelPlanModal";
import type { DeleteTravelPlanButtonProps } from "./types";

export function DeleteTravelPlanButton({
  travelPlanId,
  onDelete,
}: DeleteTravelPlanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    await onDelete(travelPlanId);
    setIsOpen(false);
  }, [onDelete, travelPlanId]);

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center rounded-md border border-red-300 bg-white p-2 text-red-500 shadow-sm hover:bg-red-50 hover:border-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 transition-colors"
        aria-label="Delete this travel plan"
        onClick={handleOpen}
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      <DeleteTravelPlanModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </>
  );
}
