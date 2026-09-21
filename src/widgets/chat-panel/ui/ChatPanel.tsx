"use client";

import type { Message } from "@/entities/message";
import { InquiryForm } from "@/features/send-inquiry";
import { ResetConversationButton } from "@/features/reset-conversation";

import { MessageList } from "./MessageList";

interface ChatPanelProps {
  messages: Message[];
  isSending: boolean;
  onSend: (message: string) => void;
  onReset: () => void;
  onEscalate?: () => void;
}

/** 상담 채팅 화면 전체 조립 (docs/02-화면명세서.md S-01) */
export function ChatPanel({
  messages,
  isSending,
  onSend,
  onReset,
  onEscalate,
}: ChatPanelProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-surface-muted">
      <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <h1 className="text-base font-semibold text-content">Jev VOC 상담봇</h1>
        <ResetConversationButton onReset={onReset} disabled={isSending} />
      </header>

      <MessageList
        messages={messages}
        isSending={isSending}
        onSelectExample={onSend}
        onEscalate={onEscalate}
      />

      <div className="border-t border-line p-4">
        <InquiryForm onSubmit={onSend} isSending={isSending} />
      </div>
    </section>
  );
}
