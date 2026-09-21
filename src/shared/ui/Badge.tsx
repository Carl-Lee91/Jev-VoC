import type { ReactNode } from "react";

type BadgeTone = "auto" | "clarify" | "escalate" | "neutral" | "urgent";

const TONE_CLASS: Record<BadgeTone, string> = {
  auto: "bg-auto-reply-soft text-auto-reply-strong border-auto-reply-line",
  clarify: "bg-clarify-soft text-clarify-strong border-clarify-line",
  escalate: "bg-escalate-soft text-escalate-strong border-escalate-line",
  neutral: "bg-surface-sunken text-content-muted border-line",
  urgent: "bg-escalate-soft text-escalate-strong border-escalate-line",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
