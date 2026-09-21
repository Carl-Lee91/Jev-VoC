import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "escalate";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-content text-content-inverse hover:bg-content/90 focus-visible:outline-content",
  secondary:
    "border border-line-strong bg-surface text-content hover:bg-surface-sunken focus-visible:outline-content",
  escalate:
    "bg-escalate text-content-inverse hover:bg-escalate-strong focus-visible:outline-escalate",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  );
}
