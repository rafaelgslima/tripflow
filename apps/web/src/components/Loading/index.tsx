import { MdAutorenew } from "react-icons/md";
import type { LoadingProps } from "./types";

export function Loading({ message = "Loading..." }: LoadingProps = {}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-tf-bg flex-col gap-4">
      <MdAutorenew
        size={32}
        aria-hidden="true"
        className="text-tf-amber"
        style={{ animation: "spin 1s linear infinite" }}
      />
      <p className="text-[13px] text-tf-muted font-outfit">
        {message}
      </p>
    </div>
  );
}
