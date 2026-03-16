import type { ShareTravelPlanModalProps } from "./types";

export function ShareTravelPlanModal({
  isOpen,
  friendEmail,
  friendEmailError,
  message,
  isConfirmDisabled,
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
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        data-testid="share-travel-plan-backdrop"
        onClick={onClose}
      />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6 z-50">
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Share this plan
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600">
                After sharing the plan with a friend, the friend will be able to
                view and edit the plan.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="share-friend-email"
                className="block text-sm font-medium text-gray-700"
              >
                Friend email
              </label>
              <input
                id="share-friend-email"
                type="email"
                value={friendEmail}
                onChange={(event) => onFriendEmailChange(event.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white ${
                  friendEmailError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="friend@example.com"
              />
              {friendEmailError ? (
                <p className="text-sm text-red-600">{friendEmailError}</p>
              ) : null}
            </div>

            {message ? (
              <div
                className={
                  message.type === "success"
                    ? "rounded-md border border-green-200 bg-green-50 p-3 text-green-800 text-sm"
                    : "rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm"
                }
              >
                {message.text}
              </div>
            ) : null}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isConfirmDisabled}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
