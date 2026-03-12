import Link from "next/link";
import type { BackButtonProps } from "./types";

export function BackButton({ href = "/", label = "Back" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {label}
    </Link>
  );
}
