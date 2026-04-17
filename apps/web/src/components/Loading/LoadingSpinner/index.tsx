import { MdAutorenew } from "react-icons/md";
import type { LoadingSpinnerProps } from "./types";

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 32,
};

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <MdAutorenew
      size={sizeMap[size]}
      className={`animate-spin ${className}`}
      aria-hidden="true"
    />
  );
}
