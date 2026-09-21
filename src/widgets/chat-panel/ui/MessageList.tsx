"use client";

import { useEffect, useRef } from "react";

import { MessageBubble, type Message } from "@/entities/message";

import { BotOutcome } from "./BotOutcome";
import { EmptyGreeting } from "./EmptyGreeting";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  messages: Message[];
  isSending: boolean;
  onSelectExample: (message: string) => void;
  onEscalate?: () => void;
}

export function MessageList({
  messages,
  isSending,
  onSelectExample,
  onEscalate,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 붙으면 하단으로 따라 내려간다. (docs/02-화면명세서.md S-01 접근성)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, isSending]);

  return (
    <div
      aria-live="polite"
      aria-label="상담 메시지"
      className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
    >
      {messages.length === 0 && !isSending ? (
        <EmptyGreeting onSelectExample={onSelectExample} disabled={isSending} />
      ) : null}

      {messages.map((message) =>
        message.role === "bot" && message.outcome !== null ? (
          <BotOutcome
            key={message.id}
            outcome={message.outcome}
            onSelectIntent={onSelectExample}
            onEscalate={onEscalate}
            disabled={isSending}
          />
        ) : (
          <MessageBubble key={message.id} role={message.role}>
            {message.text}
          </MessageBubble>
        ),
      )}

      {isSending ? <TypingIndicator /> : null}
      <div ref={bottomRef} />
    </div>
  );
}
