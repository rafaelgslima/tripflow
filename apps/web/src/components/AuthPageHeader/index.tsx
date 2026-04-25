import { Logo } from "@/components/Logo";
import { BackButton } from "@/components/BackButton";
import type { AuthPageHeaderProps } from "./types";

export function AuthPageHeader({ title, subtitle }: AuthPageHeaderProps) {
  return (
    <div className="text-center mb-16">
      <div className="relative mb-7">
        <BackButton />
        <div className="inline-flex justify-center">
          <Logo />
        </div>
      </div>
      <h2 className="font-lora text-[30px] font-light leading-[1.1] tracking-[-0.02em] text-tf-text mb-2">
        {title}
      </h2>
      <p className="text-sm text-tf-muted font-outfit leading-[1.5]">
        {subtitle}
      </p>
    </div>
  );
}
