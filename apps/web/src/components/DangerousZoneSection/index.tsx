import { useState } from "react";
import { MdWarning } from "react-icons/md";
import { DeleteAccountModal } from "@/components/DeleteAccountModal";
import type { DangerousZoneSectionProps } from "./types";

export function DangerousZoneSection({ onDeleteClick }: DangerousZoneSectionProps) {
  const [showModal, setShowModal] = useState(false);

  const handleDeleteClick = () => {
    setShowModal(true);
    onDeleteClick?.();
  };

  return (
    <>
      {/* Dangerous Zone Section */}
      <div className="border-t border-red-500/30 pt-7 mt-7">
        {/* Header with warning icon */}
        <div className="flex items-center gap-3 mb-4">
          <MdWarning className="w-5 h-5 text-red-400" />
          <h3 className="text-[11px] font-bold tracking-[0.1em] uppercase text-red-400 font-outfit">
            Dangerous Zone
          </h3>
        </div>

        {/* Warning description */}
        <p className="text-xs text-tf-muted font-outfit leading-relaxed mb-6">
          Deleting your account is permanent and cannot be undone. All your travel plans and data will be deleted forever. This action will also remove you from any shared travel plans with friends.
        </p>

        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          className="px-4 py-2.5 bg-red-500/90 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors duration-200 font-outfit"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
