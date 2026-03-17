export type AcceptStatus = "idle" | "loading" | "success" | "error";

export interface UseAcceptShareInviteResult {
  status: AcceptStatus;
  errorMessage: string | null;
}
