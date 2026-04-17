import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import type { BackButtonProps } from "./types";

export function BackButton({ href = "/", label = "Back" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[13px] font-medium text-tf-muted no-underline font-outfit"
    >
      <MdArrowBack className="w-4 h-4" />
      {label}
    </Link>
  );
}
