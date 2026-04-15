import { useTravelPlanShares } from "@/hooks/useTravelPlanShares";
import type { ShareStatusListProps } from "./types";

export function ShareStatusList({
  travelPlanId,
  refreshKey = 0,
}: ShareStatusListProps) {
  const { shares, isLoading } = useTravelPlanShares(travelPlanId, refreshKey);

  if (isLoading || shares.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 mt-2 md:items-end">
      {shares.map((share) => {
        const isAccepted = share.status === "accepted";
        const displayName = isAccepted
          ? (share.invited_name ?? share.invited_email)
          : share.invited_email;

        return (
          <div
            key={share.id}
            className={`flex items-start gap-1.5 text-[11px] font-outfit min-w-0 ${
              isAccepted ? "text-green-400" : "text-amber-400"
            }`}
          >
            <svg
              width="10"
              height="10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="shrink-0 mt-[1px]"
            >
              {isAccepted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <span className="min-w-0">
              Shared with{" "}
              <span className={`${isAccepted ? "font-semibold" : "font-medium break-all"}`}>
                {displayName}
              </span>
              {!isAccepted && (
                <span className="text-amber-400/60"> — waiting for acceptance</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
