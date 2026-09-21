import { CHAT_COPY } from "@/shared/config";

/** 전송 중 봇 자리에 뜨는 타이핑 인디케이터 */
export function TypingIndicator() {
  return (
    <div className="flex flex-col gap-1 items-start">
      <span className="px-1 text-xs text-content-muted">상담봇</span>
      <div
        role="status"
        aria-label={CHAT_COPY.typing}
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-line bg-surface px-4 py-3"
      >
        <span className="size-1.5 animate-bounce rounded-full bg-line-strong [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-line-strong [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-line-strong" />
      </div>
    </div>
  );
}
