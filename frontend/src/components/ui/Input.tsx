import { useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
}

export function Input({
  id,
  label,
  error = false,
  errorMessage,
  helperText,
  className = "",
  disabled = false,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const hasErrorMessage = error && Boolean(errorMessage);
  const describedBy = hasErrorMessage || helperText ? messageId : undefined;

  return (
    <div className="flex w-full flex-col font-sans text-sm">
      <label
        htmlFor={inputId}
        className="mb-1 text-xs font-bold text-gray-700"
      >
        {label}
      </label>
      <div
        className={`rounded-lg border px-3 py-2 transition-all ${
          error
            ? "border-red-500"
            : disabled
              ? "cursor-not-allowed border-transparent bg-gray-100"
              : "border-gray-300 focus-within:border-2 focus-within:border-eco-dark"
        }`}
      >
        <input
          {...props}
          id={inputId}
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          className={`w-full bg-transparent text-gray-800 outline-none placeholder:text-gray-400 disabled:text-gray-400 ${className}`}
        />
      </div>
      {hasErrorMessage ? (
        <span
          id={messageId}
          className="mt-1 flex items-start gap-2 text-xs text-red-600"
        >
          <span aria-hidden="true" className="mt-0.5 shrink-0">✕</span>
          <span className="min-w-0 whitespace-pre-line">{errorMessage}</span>
        </span>
      ) : (
        helperText && (
          <span id={messageId} className="mt-1 text-xs text-gray-500">
            {helperText}
          </span>
        )
      )}
    </div>
  );
}
