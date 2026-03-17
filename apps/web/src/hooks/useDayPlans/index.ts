import { useCallback, useMemo, useState } from "react";
import {
  createDayPlan,
  deleteDayPlan,
  fetchDayPlans,
  reorderDayPlans,
  updateDayPlan,
} from "@/lib/api/dayPlans";
import type { ItineraryItem } from "@/types/itinerary";
import { getSupabaseAccessToken } from "@/utils/getSupabaseAccessToken";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const day = useMemo(() => toDateOnlyISOString(date), [date]);

  const loadDayPlans = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const accessToken = await getSupabaseAccessToken();

      if (!accessToken) {
        setItineraryItems([]);
        return;
      }

      const items = await fetchDayPlans(travelPlanId, day, accessToken);
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
        const accessToken = await getSupabaseAccessToken();

        if (!accessToken) {
          throw new Error("Session not found");
        }

        const created = await createDayPlan(
          travelPlanId,
          day,
          { description },
          accessToken,
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
        const accessToken = await getSupabaseAccessToken();

        if (!accessToken) {
          throw new Error("Session not found");
        }

        const updated = await updateDayPlan(
          travelPlanId,
          day,
          itemId,
          { description },
          accessToken,
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

  const deleteDayPlanForDay = useCallback(
    async (itemId: string) => {
      setIsDeleting(true);
      setDeleteError(null);

      try {
        const accessToken = await getSupabaseAccessToken();

        if (!accessToken) {
          throw new Error("Session not found");
        }

        await deleteDayPlan(travelPlanId, day, itemId, accessToken);

        setItineraryItems((previousItems) =>
          previousItems.filter((item) => item.id !== itemId),
        );
      } catch (error) {
        setDeleteError("Unable to delete day plan. Try again later.");
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [day, travelPlanId],
  );

  const reorderDayPlansForDay = useCallback(
    async (itemIdsInOrder: string[]) => {
      const accessToken = await getSupabaseAccessToken();

      if (!accessToken) {
        throw new Error("Session not found");
      }

      await reorderDayPlans(travelPlanId, day, { itemIdsInOrder }, accessToken);
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
    isDeleting,
    deleteError,
    clearDeleteError: () => setDeleteError(null),
    deleteDayPlan: deleteDayPlanForDay,
    reorderDayPlans: reorderDayPlansForDay,
  };
}
