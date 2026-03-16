import { useCallback, useState } from "react";
import { createTravelPlan, fetchTravelPlans } from "@/lib/api/travelPlans";
import { supabase } from "@/lib/supabase";
import type { TravelPlan } from "@/components/TravelPlans/types";
import type { UseTravelPlansReturn } from "./types";

function toDateOnlyISOString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function mapApiTravelPlanToUi(travelPlan: {
  id: string;
  destination_city: string;
  start_date: string;
  end_date: string;
  created_at: string;
}): TravelPlan {
  return {
    id: travelPlan.id,
    destination: travelPlan.destination_city,
    startDate: new Date(travelPlan.start_date),
    endDate: new Date(travelPlan.end_date),
    createdAt: new Date(travelPlan.created_at),
  };
}

export function useTravelPlans(): UseTravelPlansReturn {
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadTravelPlans = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setTravelPlans([]);
        return;
      }

      const plans = await fetchTravelPlans(session.access_token);
      setTravelPlans(plans.map(mapApiTravelPlanToUi));
    } catch {
      setLoadError("Travel plans couldn't be retrieved.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPlan = useCallback(
    async (destination: string, startDate: Date, endDate: Date) => {
      setIsCreating(true);
      setCreateError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Session not found");
        }

        const createdTravelPlan = await createTravelPlan(
          {
            destination_city: destination,
            start_date: toDateOnlyISOString(startDate),
            end_date: toDateOnlyISOString(endDate),
          },
          session.access_token,
        );

        setTravelPlans((previousTravelPlans) => [
          ...previousTravelPlans,
          mapApiTravelPlanToUi(createdTravelPlan),
        ]);
      } catch (error) {
        setCreateError("Unable to create travel plan. Please try again.");
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  return {
    travelPlans,
    isLoading,
    loadError,
    loadTravelPlans,
    isCreating,
    createError,
    createPlan,
  };
}
