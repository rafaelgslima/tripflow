import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import type { PasswordInputProps } from "./types";

export function PasswordInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required = false,
  hasError = false,
  disabled = false,
  ariaInvalid = false,
  ariaDescribedBy,
}: PasswordInputProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleToggle = () => {
    setIsRevealed(!isRevealed);
  };

  return (
    <div className="relative w-full">
      <input
        id={id}
        name={name}
        type={isRevealed ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={`tf-input pr-[42px]${hasError ? " tf-input--error" : ""}`}
      />

      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={isRevealed ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-tf-muted hover:text-tf-amber transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRevealed ? (
          <MdVisibility size={18} aria-hidden="true" />
        ) : (
          <MdVisibilityOff size={18} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
