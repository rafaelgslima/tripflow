import { useState } from "react";
import { MdWarning, MdClose } from "react-icons/md";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import type { DeleteAccountModalProps } from "./types";

const CONFIRMATION_TEXT = "delete my account";

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [inputValue, setInputValue] = useState("");
  const { deleteAccount, isDeleting, error } = useDeleteAccount();

  const isExactMatch = inputValue === CONFIRMATION_TEXT;

  const handleDelete = async () => {
    if (isExactMatch) {
      await deleteAccount();
      // Redirect happens in the hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-tf-card border border-red-500/40 rounded-[20px] w-full max-w-[480px] mx-4 p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-6 right-6 text-tf-muted hover:text-tf-text transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <MdClose className="w-5 h-5" />
        </button>

        {/* Warning header */}
        <div className="flex items-start gap-3 mb-6">
          <MdWarning className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-tf-text font-lora mb-1">
              Delete Account?
            </h2>
            <p className="text-xs text-red-400 font-outfit font-semibold uppercase tracking-wide">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Warning message */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-xs text-tf-text font-outfit leading-relaxed">
            <strong>Warning:</strong> Deleting your account will permanently erase all your data, including:
          </p>
          <ul className="text-xs text-tf-text font-outfit mt-2 ml-2 space-y-1">
            <li>• All travel plans you created</li>
            <li>• All itinerary items</li>
            <li>• All shared travel plan access</li>
            <li>• Your profile information</li>
          </ul>
          <p className="text-xs text-tf-text font-outfit mt-2">
            You will also be removed from any travel plans shared with you by others.
          </p>
        </div>

        {/* Confirmation input */}
        <div className="mb-6">
          <label className="text-xs text-tf-muted font-outfit font-semibold uppercase tracking-wide mb-2 block">
            Type &quot;{CONFIRMATION_TEXT}&quot; to confirm
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={CONFIRMATION_TEXT}
            disabled={isDeleting}
            className="w-full bg-tf-bg border border-tf-border rounded-lg px-4 py-3 text-sm font-outfit text-tf-text placeholder-tf-muted/50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all disabled:opacity-50"
            autoComplete="off"
          />
          {inputValue && !isExactMatch && (
            <p className="text-xs text-red-400 font-outfit mt-1">
              Text does not match. Type exactly: <strong>{CONFIRMATION_TEXT}</strong>
            </p>
          )}
          {isExactMatch && (
            <p className="text-xs text-green-400 font-outfit mt-1">
              ✓ Ready to delete
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
            <p className="text-xs text-red-300 font-outfit">
              {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-xs font-semibold text-tf-text font-outfit bg-tf-card border border-tf-border rounded-lg hover:border-tf-border/80 hover:bg-tf-card/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isExactMatch || isDeleting}
            className="flex-1 px-4 py-2.5 text-xs font-semibold text-white font-outfit bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed rounded-lg transition-colors"
            aria-busy={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="sr-only">Deleting account, please wait</span>
                <span aria-hidden="true">Deleting…</span>
              </>
            ) : (
              "Delete Account Permanently"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
