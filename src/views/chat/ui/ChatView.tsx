"use client";

import Link from "next/link";

import { useMessageStore } from "@/entities/message";
import { useSendInquiry } from "@/features/send-inquiry";
import { ChatPanel } from "@/widgets/chat-panel";
import { VerdictInspector, type InspectorState } from "@/widgets/verdict-inspector";

/** 상담 채팅 화면 (S-01 + S-02) — 스토어와 위젯을 이어주는 조립 지점 */
export function ChatView() {
  const messages = useMessageStore((state) => state.messages);
  const resetMessages = useMessageStore((state) => state.resetMessages);
  const { send, isSending, lastOutcome, hasSent } = useSendInquiry();

  const inspectorState: InspectorState = isSending
    ? "loading"
    : hasSent
      ? "done"
      : "idle";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 lg:flex-row">
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <ChatPanel
          messages={messages}
          isSending={isSending}
          onSend={(message) => void send(message)}
          onReset={resetMessages}
        />
        <Link
          href="/tickets"
          className="self-end text-xs text-content-muted underline underline-offset-4 hover:text-content"
        >
          티켓 목록 보기
        </Link>
      </div>

      <VerdictInspector
        state={inspectorState}
        verdict={lastOutcome?.verdict ?? null}
        reason={lastOutcome?.reason ?? null}
      />
    </main>
  );
}
