import { useState, useCallback, useEffect } from "react";
import { useTravelPlans } from "@/hooks/useTravelPlans";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { CreateTravelPlanModal } from "./CreateTravelPlanModal";
import { TravelPlansList } from "./TravelPlansList";
import type { TravelPlansProps } from "./types";

export function TravelPlans({}: TravelPlansProps = {}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    travelPlans,
    isLoading,
    loadError,
    loadTravelPlans,
    createPlan,
    createError,
  } = useTravelPlans();

  useEffect(() => {
    void loadTravelPlans();
  }, [loadTravelPlans]);

  const handleCreatePlan = useCallback(
    async (destination: string, startDate: Date, endDate: Date) => {
      await createPlan(destination, startDate, endDate);
      setIsModalOpen(false);
    },
    [createPlan],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">
          Plan Your Dream Adventures
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create and organize your travel itineraries in one place
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-lg hover:shadow-xl"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New Trip Plan
        </button>
      </div>

      {/* Travel Plans List */}
      {createError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {createError}
        </div>
      )}

      {isLoading && (
        <div
          className="flex items-center justify-center py-8"
          data-testid="travel-plans-loading"
        >
          <LoadingSpinner size="lg" className="text-primary-600" />
          <p className="ml-3 text-gray-600">Loading travel plans...</p>
        </div>
      )}

      {!isLoading && loadError && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700"
          data-testid="travel-plans-load-error"
        >
          {loadError}
        </div>
      )}

      {!isLoading && !loadError && travelPlans.length > 0 && (
        <TravelPlansList plans={travelPlans} />
      )}

      {/* Create Plan Modal */}
      <CreateTravelPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCreatePlan}
      />
    </div>
  );
}
