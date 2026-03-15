import { useState, useRef, useEffect } from "react";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import type {
  UseSessionTimeoutWarningParams,
  UseSessionTimeoutWarningReturn,
} from "./types";

export function useSessionTimeoutWarning({
  timeoutDuration,
  warningDuration,
  onLogout,
}: UseSessionTimeoutWarningParams): UseSessionTimeoutWarningReturn {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(warningDuration);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { resetTimer } = useSessionTimeout({
    timeoutDuration,
    warningDuration,
    onWarning: () => {
      setShowWarning(true);
      setRemainingSeconds(warningDuration);

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      const interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      countdownIntervalRef.current = interval;
    },
    onTimeout: () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setShowWarning(false);
    },
  });

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleExtendSession = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowWarning(false);
    resetTimer();
  };

  const handleLogoutNow = async () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowWarning(false);
    await onLogout();
  };

  return {
    showWarning,
    remainingSeconds,
    handleExtendSession,
    handleLogoutNow,
  };
}
