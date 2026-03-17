import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { acceptTravelPlanShareInvite } from "@/lib/api/travelPlans";
import { supabase } from "@/lib/supabase";
import type { AcceptStatus, UseAcceptShareInviteResult } from "./types";

export function useAcceptShareInvite(
  token: string | null,
): UseAcceptShareInviteResult {
  const router = useRouter();
  const [status, setStatus] = useState<AcceptStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function acceptInvite() {
      if (!token) return;

      setStatus("loading");

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          const next = `/share/accept?token=${encodeURIComponent(token)}`;
          await router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }

        await acceptTravelPlanShareInvite({ token }, session.access_token);

        if (!isMounted) return;
        setStatus("success");

        setTimeout(() => {
          void router.replace("/home");
        }, 600);
      } catch (err: unknown) {
        if (!isMounted) return;
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? null;
        setStatus("error");
        setErrorMessage(message);
      }
    }

    void acceptInvite();

    return () => {
      isMounted = false;
    };
  }, [router, token]);

  return { status, errorMessage };
}
