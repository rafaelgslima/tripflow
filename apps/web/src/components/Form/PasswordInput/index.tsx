import { useState } from "react";
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
          // Eye open icon
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          // Eye closed icon
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.26 3.64m-5.88-2.88a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        )}
      </button>
    </div>
  );
}
