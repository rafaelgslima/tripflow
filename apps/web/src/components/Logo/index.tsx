import Link from "next/link";

interface LogoProps {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
}

export function Logo({
  className = "",
  textClassName = "text-lg font-semibold",
  iconClassName = "w-5 h-5",
}: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 no-underline ${className}`}>
      <svg
        className={iconClassName}
        fill="var(--tf-amber)"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </svg>
      <span className={`${textClassName} font-outfit text-tf-text tracking-[-0.025em]`}>
        TripFlow
      </span>
    </Link>
  );
}
