import { useCallback, useMemo, useState } from "react";
import { createTravelPlanShareInvite } from "@/lib/api/travelPlans";
import { getSupabaseAccessToken } from "@/utils/getSupabaseAccessToken";
import { validateEmail } from "@/utils/validation";
import { ShareTravelPlanModal } from "../ShareTravelPlanModal";
import type { ShareTravelPlanButtonProps } from "./types";

type ShareResult = "idle" | "success" | "error";

export function ShareTravelPlanButton({
  travelPlanId,
  onShareCreated,
}: ShareTravelPlanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [friendEmailError, setFriendEmailError] = useState<string | null>(null);
  const [result, setResult] = useState<ShareResult>("idle");
  const [isSending, setIsSending] = useState(false);

  const message = useMemo(() => {
    if (result === "success")
      return {
        type: "success" as const,
        text: "The plan was shared with the friend and now the friend should confirm it via email to be able to see the plan in their account.",
      };
    if (result === "error")
      return {
        type: "error" as const,
        text: "There was an error sending the invitation. Try again later.",
      };
    return null;
  }, [result]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFriendEmail("");
    setFriendEmailError(null);
    setResult("idle");
  }, []);

  const handleConfirm = useCallback(async () => {
    setResult("idle");

    const emailError = validateEmail(friendEmail);
    if (emailError) {
      setFriendEmailError(emailError);
      return;
    }

    setIsSending(true);
    try {
      const accessToken = await getSupabaseAccessToken();
      if (!accessToken) {
        setResult("error");
        return;
      }

      await createTravelPlanShareInvite(
        travelPlanId,
        { invited_email: friendEmail },
        accessToken,
      );
      setResult("success");
      if (onShareCreated) onShareCreated();
    } catch (error) {
      setResult("error");
    } finally {
      setIsSending(false);
    }
  }, [friendEmail, travelPlanId]);

  const isConfirmDisabled = result === "success" || isSending;

  const handleFriendEmailChange = useCallback(
    (email: string) => {
      setFriendEmail(email);
      if (friendEmailError) {
        setFriendEmailError(null);
      }
    },
    [friendEmailError],
  );

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-tf-amber-soft border border-tf-border-amber rounded-[9px] text-[13px] font-semibold text-tf-amber font-outfit cursor-pointer transition-colors duration-150"
        aria-label="Share this plan with a friend"
        onClick={handleOpen}
      >
        <svg aria-hidden="true" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 103.217-2.186 2.25 2.25 0 00-3.217 2.186Zm0-12.628a2.25 2.25 0 103.217 2.186 2.25 2.25 0 00-3.217-2.186Z" />
        </svg>
        <span>Share</span>
      </button>

      <ShareTravelPlanModal
        isOpen={isOpen}
        friendEmail={friendEmail}
        friendEmailError={friendEmailError}
        message={message}
        isConfirmDisabled={isConfirmDisabled}
        isSending={isSending}
        onClose={handleClose}
        onConfirm={handleConfirm}
        onFriendEmailChange={handleFriendEmailChange}
      />
    </>
  );
}
