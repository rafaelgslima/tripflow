import type { ShareTravelPlanModalProps } from "./types";

export function ShareTravelPlanModal({
  isOpen,
  friendEmail,
  friendEmailError,
  message,
  isConfirmDisabled,
  isSending,
  onClose,
  onConfirm,
  onFriendEmailChange,
}: ShareTravelPlanModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Share travel plan"
    >
      <div
        className="fixed inset-0 bg-[rgba(10,8,5,0.85)] backdrop-blur-sm"
        data-testid="share-travel-plan-backdrop"
        onClick={onClose}
      />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-tf-card border border-tf-border rounded-[20px] p-8 max-w-[440px] w-full z-50">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-1.5">
              <h3 className="font-cormorant text-[28px] font-normal text-tf-text tracking-[-0.02em] leading-[1.1]">
                Share this plan
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="bg-transparent border-none cursor-pointer text-tf-muted p-1 shrink-0 mt-1"
                aria-label="Close modal"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-tf-muted font-outfit leading-relaxed mb-6">
              After sharing, your friend will be able to view and edit this plan.
            </p>

            {/* Email Input */}
            <div className="mb-5">
              <label
                htmlFor="share-friend-email"
                className="tf-label"
              >
                Friend&apos;s email
              </label>
              <input
                id="share-friend-email"
                type="email"
                value={friendEmail}
                onChange={(event) => onFriendEmailChange(event.target.value)}
                className={`tf-input${friendEmailError ? " tf-input--error" : ""}`}
                placeholder="friend@example.com"
              />
              {friendEmailError ? (
                <p className="text-[13px] text-red-300 mt-1.5 font-outfit">
                  {friendEmailError}
                </p>
              ) : null}
            </div>

            {/* Message */}
            {message ? (
              <div
                className={`${message.type === "success" ? "tf-alert-success" : "tf-alert-error"} mb-5`}
              >
                {message.text}
              </div>
            ) : null}

            <div className="flex gap-[10px]">
              <button
                type="button"
                onClick={onClose}
                className="tf-btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isConfirmDisabled}
                className={`tf-btn-primary flex-1 inline-flex items-center justify-center gap-2 ${isConfirmDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {isSending && (
                  <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {isSending ? "Sending…" : "Send invite"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
