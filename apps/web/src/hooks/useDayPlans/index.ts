import { useCallback, useMemo, useState } from "react";
import {
  createDayPlan,
  fetchDayPlans,
  updateDayPlan,
} from "@/lib/api/dayPlans";
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

export function useDayPlans({
  travelPlanId,
  date,
}: UseDayPlansParams): UseDayPlansReturn {
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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

      const items = await fetchDayPlans(
        travelPlanId,
        day,
        session.access_token,
      );
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
        setCreateError("Unable to save day plan. Try again later.");
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [day, travelPlanId],
  );

  const updateDayPlanForDay = useCallback(
    async (itemId: string, description: string) => {
      setIsUpdating(true);
      setUpdateError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Session not found");
        }

        const updated = await updateDayPlan(
          travelPlanId,
          day,
          itemId,
          { description },
          session.access_token,
        );

        setItineraryItems((previousItems) =>
          previousItems.map((item) =>
            item.id === itemId ? mapApiItineraryItemToUi(updated) : item,
          ),
        );
      } catch (error) {
        setUpdateError("Unable to update day plan. Try again later.");
        throw error;
      } finally {
        setIsUpdating(false);
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
    isUpdating,
    updateError,
    clearUpdateError: () => setUpdateError(null),
    updateDayPlan: updateDayPlanForDay,
  };
}
