import { DayColumn } from "../DayColumn";
import { ShareTravelPlanButton } from "../ShareTravelPlanButton";
import type { TravelPlansListProps } from "./types";

export function TravelPlansList({ plans }: TravelPlansListProps) {
  const getDaysArray = (startDate: Date, endDate: Date): Date[] => {
    const days: Date[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const formatDateRange = (startDate: Date, endDate: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    const startStr = startDate.toLocaleDateString("en-US", options);
    const endStr = endDate.toLocaleDateString("en-US", options);
    const year = endDate.getFullYear();

    return `${startStr} - ${endStr}, ${year}`;
  };

  return (
    <div className="space-y-8" data-testid="travel-plans-list">
      {plans.map((plan) => {
        const days = getDaysArray(plan.startDate, plan.endDate);

        return (
          <div key={plan.id} className="bg-white rounded-lg shadow-lg p-6">
            {/* Plan Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.destination}
                </h3>
                <ShareTravelPlanButton travelPlanId={plan.id} />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatDateRange(plan.startDate, plan.endDate)} • {days.length}{" "}
                {days.length === 1 ? "day" : "days"}
              </p>
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block overflow-x-auto">
              <div className="flex gap-4 min-w-full">
                {days.map((day, index) => (
                  <DayColumn
                    key={day.toISOString()}
                    date={day}
                    dayNumber={index + 1}
                    travelPlanId={plan.id}
                  />
                ))}
              </div>
            </div>

            {/* Mobile: Accordion View */}
            <div className="md:hidden space-y-2">
              {days.map((day, index) => (
                <DayColumn
                  key={day.toISOString()}
                  date={day}
                  dayNumber={index + 1}
                  travelPlanId={plan.id}
                  isMobile={true}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
