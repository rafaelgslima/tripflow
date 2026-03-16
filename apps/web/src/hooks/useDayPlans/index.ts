import { useCallback, useMemo, useState } from "react";
import { createDayPlan, fetchDayPlans } from "@/lib/api/dayPlans";
import { supabase } from "@/lib/supabase";
import type { ItineraryItem } from "@/types/itinerary";
import { toDateOnlyISOString } from "@/utils/toDateOnlyISOString";
import type { UseDayPlansParams, UseDayPlansReturn } from "./types";

function mapApiItineraryItemToUi(item: {
  id: string;
  description: string;
  created_at: string;
}): ItineraryItem {
  return {
    id: item.id,
    description: item.description,
    createdAt: new Date(item.created_at),
  };
}

export function useDayPlans({ travelPlanId, date }: UseDayPlansParams):
  UseDayPlansReturn {
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const day = useMemo(() => toDateOnlyISOString(date), [date]);

  const loadDayPlans = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setItineraryItems([]);
        return;
      }

      const items = await fetchDayPlans(travelPlanId, day, session.access_token);
      setItineraryItems(items.map(mapApiItineraryItemToUi));
    } catch {
      setLoadError("Day plans couldn't be retrieved.");
    } finally {
      setIsLoading(false);
    }
  }, [day, travelPlanId]);

  const createDayPlanForDay = useCallback(
    async (description: string) => {
      setIsCreating(true);
      setCreateError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Session not found");
        }

        const created = await createDayPlan(
          travelPlanId,
          day,
          { description },
          session.access_token,
        );

        setItineraryItems((previousItems) => [
          ...previousItems,
          mapApiItineraryItemToUi(created),
        ]);
      } catch (error) {
        setCreateError("Unable to save day plan. Please try again.");
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [day, travelPlanId],
  );

  return {
    itineraryItems,
    setItineraryItems: (updater) => setItineraryItems(updater),
    isLoading,
    loadError,
    loadDayPlans,
    isCreating,
    createError,
    clearCreateError: () => setCreateError(null),
    createDayPlan: createDayPlanForDay,
  };
}
