import { Logo } from "@/components/Logo";
import { BackButton } from "@/components/BackButton";
import type { AuthPageHeaderProps } from "./types";

export function AuthPageHeader({ title, subtitle }: AuthPageHeaderProps) {
  return (
    <div className="text-center">
      <div className="relative mb-2">
        <BackButton />
        <Logo />
      </div>
      <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}
