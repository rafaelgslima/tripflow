import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import type {
  UseSessionTimeoutOptions,
  UseSessionTimeoutReturn,
} from "./types";

export function useSessionTimeout({
  timeoutDuration = 1200, // 20 minutes default
  warningDuration = 120, // 2 minutes warning
  onWarning,
  onTimeout,
  redirectPath = "/login",
}: UseSessionTimeoutOptions = {}) {
  const router = useRouter();
  const activityTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const warningTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  }, []);

  const handleTimeout = useCallback(async () => {
    clearTimers();

    // Sign out the user
    await supabase.auth.signOut();

    // Call custom timeout handler
    if (onTimeout) {
      onTimeout();
    }

    // Redirect to login
    router.push(redirectPath);
  }, [clearTimers, onTimeout, router, redirectPath]);

  const handleWarning = useCallback(() => {
    if (onWarning) {
      onWarning();
    }

    // Set timeout for actual session expiry
    activityTimeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, warningDuration * 1000);
  }, [onWarning, warningDuration, handleTimeout]);

  const resetTimer = useCallback(() => {
    clearTimers();
    lastActivityRef.current = Date.now();

    // Set warning timer
    const warningTime = (timeoutDuration - warningDuration) * 1000;
    warningTimeoutRef.current = setTimeout(() => {
      handleWarning();
    }, warningTime);
  }, [clearTimers, timeoutDuration, warningDuration, handleWarning]);

  useEffect(() => {
    // Initialize timer on mount (only once)
    resetTimer();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearTimers();
      }
      // Don't reset timer on any auth events - let it run continuously
    });

    // Cleanup
    return () => {
      clearTimers();
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  return {
    resetTimer,
    lastActivity: lastActivityRef.current,
  };
}
