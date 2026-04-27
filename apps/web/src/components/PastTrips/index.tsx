import { useEffect } from "react";
import { MdAccessTime } from "react-icons/md";
import { useTravelPlans } from "@/hooks/useTravelPlans";
import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { TravelPlansList } from "../TravelPlans/TravelPlansList";
import type { PastTripsProps } from "./types";

export function PastTrips({}: PastTripsProps = {}) {
  const {
    travelPlans,
    isLoading,
    loadError,
    loadTravelPlans,
  } = useTravelPlans("past");

  useEffect(() => {
    void loadTravelPlans();
  }, [loadTravelPlans]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2
          className="font-outfit font-normal tracking-[-0.025em] text-tf-text leading-[1.1] mb-1.5 text-[30px]"
        >
          Past trips
        </h2>
        <p className="text-sm text-tf-muted font-outfit">
          A record of your completed adventures
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 py-8" data-testid="past-trips-loading">
          <LoadingSpinner size="lg" className="text-amber-400" />
          <p className="text-sm text-tf-muted font-outfit">Loading your past trips…</p>
        </div>
      )}

      {!isLoading && loadError && (
        <div className="tf-alert-error" data-testid="past-trips-load-error">{loadError}</div>
      )}

      {!isLoading && !loadError && travelPlans.length === 0 && (
        <div className="py-[80px] px-6 text-center">
          {/* Decorative timeline element */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-tf-amber opacity-60" />
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-tf-amber to-transparent opacity-30" />
            <div className="w-1.5 h-1.5 rounded-full bg-tf-amber opacity-40" />
          </div>

          {/* Heading with visual distinction */}
          <h3 className="font-outfit font-normal tracking-[-0.025em] text-tf-text leading-[1.1] mb-3" style={{ fontSize: "clamp(24px, 5vw, 32px)" }}>
            Your archive is empty
          </h3>

          {/* Descriptive text with better hierarchy */}
          <p className="text-[14px] text-tf-muted font-outfit leading-[1.6] max-w-sm mx-auto">
            When a trip ends, it becomes part of your travel history. Check back here to revisit memories from journeys past.
          </p>

          {/* Secondary visual element */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-[12px] bg-white/[0.02] border border-white/[0.05]">
              <MdAccessTime
                size={18}
                className="text-tf-amber opacity-60"
                aria-hidden="true"
              />
              <span className="text-xs font-outfit text-tf-muted opacity-70">
                Your completed adventures await
              </span>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !loadError && travelPlans.length > 0 && (
        <TravelPlansList
          plans={travelPlans}
          onDeletePlan={async () => {}}
          readOnly
        />
      )}
    </div>
  );
}
