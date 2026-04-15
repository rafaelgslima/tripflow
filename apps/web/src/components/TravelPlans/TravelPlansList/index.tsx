import { useState, useCallback } from "react";
import { DayColumn } from "../DayColumn";
import { DeleteTravelPlanButton } from "../DeleteTravelPlanButton";
import { ShareStatusList } from "../ShareStatusList";
import { ShareTravelPlanButton } from "../ShareTravelPlanButton";
import type { TravelPlansListProps } from "./types";

export function TravelPlansList({ plans, onDeletePlan }: TravelPlansListProps) {
  const [shareRefreshKeys, setShareRefreshKeys] = useState<Record<string, number>>({});

  const handleShareCreated = useCallback((planId: string) => {
    setShareRefreshKeys((prev) => ({ ...prev, [planId]: (prev[planId] ?? 0) + 1 }));
  }, []);

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
    <div className="flex flex-col gap-6" data-testid="travel-plans-list">
      {plans.map((plan) => {
        const days = getDaysArray(plan.startDate, plan.endDate);

        return (
          <div
            key={plan.id}
            className="bg-tf-card border border-tf-border rounded-[20px] p-7"
          >
            {/* Plan Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-cormorant text-[28px] font-normal text-tf-text tracking-[-0.02em] mb-1 leading-[1.1]">
                    {plan.destination}
                  </h3>
                  <p className="text-[13px] text-tf-muted font-outfit">
                    {formatDateRange(plan.startDate, plan.endDate)} · {days.length} {days.length === 1 ? "day" : "days"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ShareTravelPlanButton
                    travelPlanId={plan.id}
                    onShareCreated={() => handleShareCreated(plan.id)}
                  />
                  <DeleteTravelPlanButton travelPlanId={plan.id} onDelete={onDeletePlan} />
                </div>
              </div>
              <ShareStatusList
                travelPlanId={plan.id}
                refreshKey={shareRefreshKeys[plan.id] ?? 0}
              />
            </div>

            {/* Desktop: scrollable columns */}
            <div className="hidden md:block overflow-x-auto">
              <div className="flex gap-3" style={{ minWidth: "100%" }}>
                {days.map((day, index) => (
                  <DayColumn key={day.toISOString()} date={day} dayNumber={index + 1} travelPlanId={plan.id} />
                ))}
              </div>
            </div>

            {/* Mobile: accordion */}
            <div className="md:hidden flex flex-col gap-2">
              {days.map((day, index) => (
                <DayColumn key={day.toISOString()} date={day} dayNumber={index + 1} travelPlanId={plan.id} isMobile={true} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
