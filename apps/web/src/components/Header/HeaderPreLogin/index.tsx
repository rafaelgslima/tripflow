import Link from "next/link";
import { useRouter } from "next/router";
import { Logo } from "@/components/Logo";

export function HeaderPreLogin() {
  const router = useRouter();

  return (
    <header className="border-b border-tf-border backdrop-blur-[16px] bg-[rgba(14,11,9,0.8)] sticky top-0 z-40">
      <nav className="max-w-[1200px] mx-auto px-6 h-[62px] flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-1.5">
          <div
            className={`py-2 px-4 rounded-lg transition-all duration-150 ${router.pathname === "/contact" ? "bg-white/10" : "hover:bg-white/10"}`}
          >
            <Link
              href="/contact"
              className="text-sm font-medium text-tf-text no-underline font-outfit"
            >
              Contact
            </Link>
          </div>
          <div
            className={`py-2 px-4 rounded-lg transition-all duration-150 ${router.pathname === "/login" ? "bg-white/10" : "hover:bg-white/10"}`}
          >
            <Link
              href="/login"
              className="text-sm font-medium text-tf-text no-underline font-outfit"
            >
              Log in
            </Link>
          </div>
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
