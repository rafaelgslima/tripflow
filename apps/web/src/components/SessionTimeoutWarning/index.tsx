import { useState } from "react";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Session Expiring Soon
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Your session will expire in{" "}
              <span className="font-semibold text-yellow-600">
                {Math.ceil(remainingSeconds / 60)} minute
                {Math.ceil(remainingSeconds / 60) !== 1 ? "s" : ""}
              </span>
              . Would you like to extend your session?
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleExtend}
            disabled={isExtending}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExtending ? "Extending..." : "Extend Session"}
          </button>
          <button
            onClick={onLogout}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}
