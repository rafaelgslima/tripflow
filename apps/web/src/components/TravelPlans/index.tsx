import { useState, useCallback } from "react";
import { CreateTravelPlanModal } from "./CreateTravelPlanModal";
import { TravelPlansList } from "./TravelPlansList";
import type { TravelPlansProps, TravelPlan } from "./types";

export function TravelPlans({}: TravelPlansProps = {}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);

  const handleCreatePlan = useCallback(
    (destination: string, startDate: Date, endDate: Date) => {
      // TODO: Replace with API call to backend
      // POST /api/travel-plans
      // {
      //   destination: string,
      //   startDate: ISO string,
      //   endDate: ISO string
      // }
      // Backend should create the travel plan in database and return the created plan

      // For now, simulate plan creation locally
      const newPlan: TravelPlan = {
        id: `temp-${Date.now()}`, // TODO: Replace with ID from backend
        destination,
        startDate,
        endDate,
        createdAt: new Date(),
      };

      setTravelPlans((prev) => [...prev, newPlan]);
      setIsModalOpen(false);
    },
    [],
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
      {travelPlans.length > 0 && <TravelPlansList plans={travelPlans} />}

      {/* Create Plan Modal */}
      <CreateTravelPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCreatePlan}
      />
    </div>
  );
}
