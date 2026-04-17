import { useCallback, useRef, useState } from "react";
import {
  createDayPlan,
  deleteDayPlan,
  fetchDayPlans,
  moveItemToDay,
  reorderDayPlans,
  toggleDayPlanDone,
  updateDayPlan,
} from "@/lib/api/dayPlans";
import type { ItineraryItem } from "@/types/itinerary";
import { getSupabaseAccessToken } from "@/utils/getSupabaseAccessToken";
import { normalizeTime, sortItemsByTime } from "@/utils/timeOptions";
import type { DayState, UseTravelPlanItemsParams, UseTravelPlanItemsReturn } from "./types";

const DEFAULT_DAY_STATE: DayState = {
  items: [],
  isLoading: false,
  loadError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  toggleDoneError: null,
};

function mapApiItem(item: {
  id: string;
  description: string;
  time: string | null;
  is_done: boolean;
  created_at: string;
}): ItineraryItem {
  return {
    id: item.id,
    description: item.description,
    time: normalizeTime(item.time),
    isDone: item.is_done,
    createdAt: new Date(item.created_at),
  };
}

export function useTravelPlanItems({
  travelPlanId,
}: UseTravelPlanItemsParams): UseTravelPlanItemsReturn {
  const [dayStates, setDayStates] = useState<Record<string, DayState>>({});

  // "Latest state" ref — updated on every render so async callbacks always read
  // current state without stale closures or relying on setState-updater timing.
  const dayStatesRef = useRef<Record<string, DayState>>(dayStates);
  dayStatesRef.current = dayStates;

  const updateDayState = useCallback(
    (day: string, patch: Partial<DayState>) => {
      setDayStates((prev) => {
        const current = prev[day] ?? DEFAULT_DAY_STATE;
        const next = { ...current, ...patch };
        return { ...prev, [day]: next };
      });
    },
    [],
  );

  const setDayItems = useCallback(
    (day: string, updater: (prev: ItineraryItem[]) => ItineraryItem[]) => {
      setDayStates((prev) => {
        const current = prev[day] ?? DEFAULT_DAY_STATE;
        const next = { ...current, items: updater(current.items) };
        return { ...prev, [day]: next };
      });
    },
    [],
  );

  const getDay = useCallback(
    (day: string): DayState => dayStates[day] ?? DEFAULT_DAY_STATE,
    [dayStates],
  );

  const loadDay = useCallback(
    async (day: string) => {
      updateDayState(day, { isLoading: true, loadError: null });

      try {
        const accessToken = await getSupabaseAccessToken();
        if (!accessToken) {
          updateDayState(day, { isLoading: false, items: [] });
          return;
        }

        const items = await fetchDayPlans(travelPlanId, day, accessToken);
        updateDayState(day, { isLoading: false, items: items.map(mapApiItem) });
      } catch {
        updateDayState(day, { isLoading: false, loadError: "Day plans couldn't be retrieved." });
      }
    },
    [travelPlanId, updateDayState],
  );

  const createItem = useCallback(
    async (day: string, description: string, time: string | null) => {
      updateDayState(day, { createError: null });

      try {
        const accessToken = await getSupabaseAccessToken();
        if (!accessToken) throw new Error("Session not found");

        const created = await createDayPlan(
          travelPlanId,
          day,
          { description, time },
          accessToken,
        );
        const mappedItem = mapApiItem(created);

        // Compute new items synchronously via ref to avoid stale closure
        const currentItems = dayStatesRef.current[day]?.items ?? [];
        const withNew = [...currentItems, mappedItem];
        const sorted = time ? sortItemsByTime(withNew) : withNew;

        updateDayState(day, { items: sorted });

        if (time && sorted.length > 1) {
          await reorderDayPlans(
            travelPlanId,
            day,
            { itemIdsInOrder: sorted.map((i) => i.id) },
            accessToken,
          );
        }
      } catch (error) {
        updateDayState(day, { createError: "Unable to save activity. Try again later." });
        throw error;
      }
    },
    [travelPlanId, updateDayState],
  );

  const updateItem = useCallback(
    async (day: string, itemId: string, description: string, time: string | null) => {
      updateDayState(day, { updateError: null });

      try {
        const accessToken = await getSupabaseAccessToken();
        if (!accessToken) throw new Error("Session not found");

        const updated = await updateDayPlan(
          travelPlanId,
          day,
          itemId,
          { description, time },
          accessToken,
        );
        const mappedItem = mapApiItem(updated);

        const currentItems = dayStatesRef.current[day]?.items ?? [];
        const replaced = currentItems.map((item) =>
          item.id === itemId ? mappedItem : item,
        );
        const sorted = sortItemsByTime(replaced);

        updateDayState(day, { items: sorted });

        await reorderDayPlans(
          travelPlanId,
          day,
          { itemIdsInOrder: sorted.map((i) => i.id) },
          accessToken,
        );
      } catch (error) {
        updateDayState(day, { updateError: "Unable to update activity. Try again later." });
        throw error;
      }
    },
    [travelPlanId, updateDayState],
  );

  const deleteItem = useCallback(
    async (day: string, itemId: string) => {
      updateDayState(day, { deleteError: null });

      try {
        const accessToken = await getSupabaseAccessToken();
        if (!accessToken) throw new Error("Session not found");

        await deleteDayPlan(travelPlanId, day, itemId, accessToken);

        const currentItems = dayStatesRef.current[day]?.items ?? [];
        updateDayState(day, { items: currentItems.filter((i) => i.id !== itemId) });
      } catch (error) {
        updateDayState(day, { deleteError: "Unable to delete activity. Try again later." });
        throw error;
      }
    },
    [travelPlanId, updateDayState],
  );

  const toggleDone = useCallback(
    async (day: string, itemId: string, isDone: boolean) => {
      // Optimistic update
      setDayItems(day, (prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, isDone } : item)),
      );
      updateDayState(day, { toggleDoneError: null });

      try {
        const accessToken = await getSupabaseAccessToken();
        if (!accessToken) throw new Error("Session not found");
        await toggleDayPlanDone(travelPlanId, day, itemId, isDone, accessToken);
      } catch {
        // Rollback
        setDayItems(day, (prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, isDone: !isDone } : item)),
        );
        updateDayState(day, { toggleDoneError: "Unable to update activity. Try again later." });
      }
    },
    [travelPlanId, updateDayState, setDayItems],
  );

  const reorderDay = useCallback(
    async (day: string, itemIds: string[]) => {
      const accessToken = await getSupabaseAccessToken();
      if (!accessToken) throw new Error("Session not found");
      await reorderDayPlans(travelPlanId, day, { itemIdsInOrder: itemIds }, accessToken);
    },
    [travelPlanId],
  );

  const moveItemBetweenDays = useCallback(
    async (
      itemId: string,
      fromDay: string,
      toDay: string,
    ) => {
      const fromItems = dayStatesRef.current[fromDay]?.items ?? [];
      const toItems = dayStatesRef.current[toDay]?.items ?? [];

      const movingItem = fromItems.find((i) => i.id === itemId);
      if (!movingItem) return;

      // Always preserve the item's original time — no swap with target
      const newFromItems = sortItemsByTime(fromItems.filter((i) => i.id !== itemId));
      const newToItems = sortItemsByTime([...toItems, movingItem]);

      // Optimistic update — single batched write for both days
      setDayStates((prev) => ({
        ...prev,
        [fromDay]: { ...(prev[fromDay] ?? DEFAULT_DAY_STATE), items: newFromItems },
        [toDay]: { ...(prev[toDay] ?? DEFAULT_DAY_STATE), items: newToItems },
      }));

      try {
        const accessToken = await getSupabaseAccessToken();
        if (!accessToken) throw new Error("Session not found");

        await moveItemToDay(
          travelPlanId,
          fromDay,
          itemId,
          { target_day: toDay, time: movingItem.time },
          accessToken,
        );

        if (newFromItems.length > 0) {
          await reorderDayPlans(
            travelPlanId,
            fromDay,
            { itemIdsInOrder: newFromItems.map((i) => i.id) },
            accessToken,
          );
        }
        await reorderDayPlans(
          travelPlanId,
          toDay,
          { itemIdsInOrder: newToItems.map((i) => i.id) },
          accessToken,
        );
      } catch {
        // Rollback — single atomic write restoring both days
        setDayStates((prev) => ({
          ...prev,
          [fromDay]: { ...(prev[fromDay] ?? DEFAULT_DAY_STATE), items: fromItems },
          [toDay]: { ...(prev[toDay] ?? DEFAULT_DAY_STATE), items: toItems },
        }));
      }
    },
    [travelPlanId],
  );

  return {
    getDay,
    setDayItems,
    loadDay,
    createItem,
    updateItem,
    deleteItem,
    toggleDone,
    reorderDay,
    moveItemBetweenDays,
    clearCreateError: (day) => updateDayState(day, { createError: null }),
    clearUpdateError: (day) => updateDayState(day, { updateError: null }),
    clearDeleteError: (day) => updateDayState(day, { deleteError: null }),
    clearToggleDoneError: (day) => updateDayState(day, { toggleDoneError: null }),
  };
}
