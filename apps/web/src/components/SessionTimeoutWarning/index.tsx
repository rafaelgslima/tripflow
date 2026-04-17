import { useState } from "react";
import { MdWarning } from "react-icons/md";
import type { SessionTimeoutWarningProps } from "./types";

export function SessionTimeoutWarning({
  remainingSeconds,
  onExtendSession,
  onLogout,
}: SessionTimeoutWarningProps) {
  const [isExtending, setIsExtending] = useState(false);

  const handleExtend = async () => {
    setIsExtending(true);
    await onExtendSession();
    setIsExtending(false);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.75)] backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-tf-card border border-tf-border-amber rounded-[20px] p-7 max-w-[420px] w-full shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
        <div className="flex items-start gap-[14px] mb-5">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-tf-amber-soft border border-tf-border-amber flex items-center justify-center shrink-0 text-tf-amber">
            <MdWarning size={18} />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-tf-text font-outfit mb-1.5">
              Session expiring soon
            </h3>
            <p className="text-[13px] text-tf-muted font-outfit leading-relaxed">
              Your session will expire in{" "}
              <span className="font-semibold text-tf-amber">
                {Math.ceil(remainingSeconds / 60)} minute
                {Math.ceil(remainingSeconds / 60) !== 1 ? "s" : ""}
              </span>
              . Would you like to extend it?
            </p>
          </div>
        </div>
        <div className="flex gap-[10px]">
          <button onClick={handleExtend} disabled={isExtending} className="tf-btn-primary flex-1">
            {isExtending ? "Extending…" : "Extend session"}
          </button>
          <button onClick={onLogout} className="tf-btn-ghost flex-1">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
