import Link from "next/link";
import { Logo } from "@/components/Logo";

export function HeaderPreLogin() {
  return (
    <header className="border-b border-tf-border backdrop-blur-[16px] bg-[rgba(14,11,9,0.8)] sticky top-0 z-40">
      <nav className="max-w-[1200px] mx-auto px-6 h-[62px] flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-1.5">
          <Link
            href="/contact"
            className="py-2 px-4 text-sm font-medium text-tf-muted no-underline font-outfit rounded-lg"
          >
            Contact
          </Link>
          <Link
            href="/login"
            className="py-2 px-4 text-sm font-medium text-tf-muted no-underline font-outfit rounded-lg"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="py-[9px] px-5 text-sm font-semibold text-[#0E0B09] bg-tf-amber no-underline rounded-[9px] font-outfit tracking-[-0.01em]"
          >
            Sign up free
          </Link>
        </div>
      </nav>
    </header>
  );
}
