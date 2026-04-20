import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { UserProfile, UseUserProfileReturn } from "./types";

export function useUserProfile(userId?: string): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("[useUserProfile] Fetching profile for user:", userId);

        const { data, error: fetchError } = await supabase
          .from("profile")
          .select("id, name, email, avatar_url, country, city")
          .eq("id", userId)
          .single();

        console.log("[useUserProfile] Fetch result:", { data, error: fetchError });

        if (fetchError) {
          console.warn("Failed to fetch profile from database:", fetchError);
          throw new Error(fetchError.message);
        }

        if (data) {
          console.log("[useUserProfile] Profile loaded successfully:", data);
          setProfile(data as UserProfile);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to fetch profile";
        console.error("useUserProfile error:", errorMsg);
        setError(errorMsg);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}
