import type { LoadingProps } from "./types";

export function Loading({ message = "Loading..." }: LoadingProps = {}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-tf-bg flex-col gap-4">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="text-tf-amber"
        style={{ animation: "spin 1s linear infinite" }}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-[13px] text-tf-muted font-outfit">
        {message}
      </p>
    </div>
  );
}
