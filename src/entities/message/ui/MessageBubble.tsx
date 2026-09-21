import type { ReactNode } from "react";

import type { MessageRole } from "../model/types";

const ROLE_ALIGN: Record<MessageRole, string> = {
  customer: "items-end",
  bot: "items-start",
  system: "items-center",
};

const ROLE_BUBBLE: Record<MessageRole, string> = {
  customer: "bg-content text-content-inverse rounded-br-sm",
  bot: "bg-surface text-content border border-line rounded-bl-sm",
  system: "bg-surface-sunken text-content-muted text-center",
};

const ROLE_NAME: Record<MessageRole, string> = {
  customer: "고객",
  bot: "상담봇",
  system: "안내",
};

interface MessageBubbleProps {
  role: MessageRole;
  children: ReactNode;
}

export function MessageBubble({ role, children }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col gap-1 ${ROLE_ALIGN[role]}`}>
      <span className="px-1 text-xs text-content-muted">{ROLE_NAME[role]}</span>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${ROLE_BUBBLE[role]}`}
      >
        {children}
      </div>
    </div>
  );
}
