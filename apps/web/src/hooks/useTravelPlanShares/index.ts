import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { fetchTravelPlanShares } from "@/lib/api/travelPlans";
import { getSupabaseAccessToken } from "@/utils/getSupabaseAccessToken";
import type { ShareEntry, UseTravelPlanSharesReturn } from "./types";

export function useTravelPlanShares(
  travelPlanId: string,
  refreshKey: number = 0,
): UseTravelPlanSharesReturn {
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = await getSupabaseAccessToken();
      if (!accessToken) {
        setError("Not authenticated.");
        return;
      }

      const [data, { data: { user: currentUser } }] = await Promise.all([
        fetchTravelPlanShares(travelPlanId, accessToken),
        supabase.auth.getUser(),
      ]);

      const currentEmail = currentUser?.email?.toLowerCase();
      const filtered = data.filter(
        (s) => s.invited_email.toLowerCase() !== currentEmail,
      );
      setShares(filtered);
    } catch {
      setError("Failed to load share status.");
    } finally {
      setIsLoading(false);
    }
  }, [travelPlanId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return { shares, isLoading, error, refetch: load };
}
