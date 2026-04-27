import { useState } from "react";
import { MdClose } from "react-icons/md";
import { validateTravelPlanForm } from "@/utils/validation";
import type { CreateTravelPlanModalProps } from "./types";

export function CreateTravelPlanModal({
  isOpen,
  onClose,
  onConfirm,
}: CreateTravelPlanModalProps) {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<{
    destination?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const handleReset = () => {
    setDestination("");
    setStartDate("");
    setEndDate("");
    setErrors({});
  };

  const handleConfirm = () => {
    const validation = validateTravelPlanForm({
      destination,
      startDate,
      endDate,
    });

    if (validation.isValid) {
      onConfirm(destination.trim(), new Date(startDate), new Date(endDate));
      handleReset();
    } else {
      setErrors(validation.errors);
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
    if (errors.destination) {
      setErrors({ ...errors, destination: undefined });
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    if (errors.startDate) {
      setErrors({ ...errors, startDate: undefined });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    if (errors.endDate) {
      setErrors({ ...errors, endDate: undefined });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-[rgba(10,8,5,0.85)] backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-tf-card border border-tf-border rounded-[20px] p-8 max-w-[460px] w-full z-50">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-7">
              <div>
                <h3 className="font-outfit text-[32px] font-normal text-tf-text tracking-[-0.02em] leading-[1.1] mb-1">
                  Plan a new trip
                </h3>
                <p className="text-[13px] text-tf-muted font-outfit">
                  Where are you headed?
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="bg-transparent border-none cursor-pointer text-tf-muted p-1 shrink-0 mt-1"
                aria-label="Close modal"
              >
                <MdClose size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-[18px] mb-7">
              {/* Destination */}
              <div>
                <label htmlFor="destination" className="tf-label">
                  Destination city
                </label>
                <input
                  type="text"
                  id="destination"
                  value={destination}
                  onChange={handleDestinationChange}
                  className={`tf-input${errors.destination ? " tf-input--error" : ""}`}
                  placeholder="Paris, Tokyo, New York…"
                />
                {errors.destination && (
                  <p className="text-[13px] text-red-300 mt-1.5 font-outfit">
                    {errors.destination}
                  </p>
                )}
              </div>

              {/* Dates row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="startDate" className="tf-label">
                    Start date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={handleStartDateChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`tf-input${errors.startDate ? " tf-input--error" : ""}`}
                  />
                  {errors.startDate && (
                    <p className="text-[13px] text-red-300 mt-1.5 font-outfit">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="tf-label">
                    End date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={handleEndDateChange}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    className={`tf-input${errors.endDate ? " tf-input--error" : ""}`}
                  />
                  {errors.endDate && (
                    <p className="text-[13px] text-red-300 mt-1.5 font-outfit">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-[10px]">
              <button
                type="button"
                onClick={handleClose}
                className="tf-btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="tf-btn-primary flex-1"
              >
                Create trip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
