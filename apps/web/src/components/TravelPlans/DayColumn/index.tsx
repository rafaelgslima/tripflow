import { useState } from "react";
import type { DayColumnProps } from "./types";

export function DayColumn({
  date,
  dayNumber,
  travelPlanId,
  isMobile = false,
}: DayColumnProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date: Date): { weekday: string; monthDay: string } => {
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return { weekday, monthDay };
  };

  const handleAddPlan = () => {
    // TODO: Implement add plan functionality
    // This will be implemented in the next iteration
    // Should open a modal/form to add a new itinerary item for this day
    console.log(`Add plan for ${travelPlanId} on ${date.toISOString()}`);
  };

  const { weekday, monthDay } = formatDate(date);

  // Mobile Accordion View
  if (isMobile) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="text-left">
            <div className="font-semibold text-gray-900">Day {dayNumber}</div>
            <div className="text-sm text-gray-600">
              {weekday}, {monthDay}
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isExpanded && (
          <div className="p-4 space-y-3">
            {/* TODO: Render itinerary items here */}
            <div className="text-sm text-gray-500 text-center py-4">
              No plans yet for this day
            </div>

            <button
              onClick={handleAddPlan}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
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
              Add Plan
            </button>
          </div>
        )}
      </div>
    );
  }

  // Desktop Table Column View
  return (
    <div className="flex-1 min-w-[200px] border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      {/* Day Header */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <div className="font-semibold text-lg text-gray-900">
          Day {dayNumber}
        </div>
        <div className="text-sm text-gray-600">{weekday}</div>
        <div className="text-sm text-gray-600">{monthDay}</div>
      </div>

      {/* Itinerary Items Container */}
      <div className="space-y-2 mb-4 min-h-[100px]">
        {/* TODO: Render itinerary items here */}
        <div className="text-xs text-gray-400 text-center py-2">
          No plans yet
        </div>
      </div>

      {/* Add Plan Button */}
      <button
        onClick={handleAddPlan}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors text-sm"
      >
        <svg
          className="w-4 h-4"
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
        Add Plan
      </button>
    </div>
  );
}
